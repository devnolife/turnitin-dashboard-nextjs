import { NextRequest, NextResponse } from "next/server"
import { processInboundWa } from "@/lib/notifications/wa-verify"
import { sendWhatsappText } from "@/lib/notifications/whatsapp"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"

/**
 * Webhook WhatsApp Cloud API (Meta).
 *
 * GET  : handshake verifikasi webhook (hub.challenge).
 * POST : terima pesan inbound. Dipakai untuk verifikasi "chat duluan" — bila
 *        pesan berisi kode valid, nomor pengirim disimpan ke akun mahasiswa.
 */

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const mode = sp.get("hub.mode")
  const token = sp.get("hub.verify_token")
  const challenge = sp.get("hub.challenge")
  const expected = process.env.WA_WEBHOOK_VERIFY_TOKEN

  if (mode === "subscribe" && expected && token === expected) {
    return new NextResponse(challenge ?? "", { status: 200 })
  }
  return new NextResponse("Forbidden", { status: 403 })
}

interface WaWebhookBody {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{ from?: string; text?: { body?: string }; type?: string }>
      }
    }>
  }>
}

export async function POST(request: NextRequest) {
  // Selalu balas 200 cepat agar Meta tidak retry; proses best-effort di dalam.
  try {
    const body = (await request.json().catch(() => ({}))) as WaWebhookBody
    const messages =
      body.entry?.flatMap((e) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []) ?? []

    for (const msg of messages) {
      const from = msg.from
      const text = msg.text?.body
      if (!from || !text) continue
      const res = await processInboundWa(from, text)
      if (res.ok) {
        // Konfirmasi balik (gratis — dalam service window yang baru dibuka user).
        await sendWhatsappText(
          from,
          "✅ Nomor WhatsApp Anda berhasil diverifikasi. Anda akan menerima notifikasi hasil cek plagiarisme di sini. — Perpusmu",
        ).catch(() => {})
      } else {
        logger.info("wa.webhook.inbound_unmatched", { reason: res.reason })
      }
    }
  } catch (e) {
    logger.warn("wa.webhook.error", { error: e instanceof Error ? e.message : String(e) })
  }
  return NextResponse.json({ received: true })
}
