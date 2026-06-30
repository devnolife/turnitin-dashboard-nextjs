import { logger } from "@/lib/logger"
import { normalizeIndonesianPhone } from "@/lib/phone"

/**
 * Lapisan pengiriman WhatsApp yang provider-agnostic.
 *
 * Strategi anti-banned + hemat biaya: pakai WhatsApp Cloud API RESMI (Meta),
 * dan andalkan "service window" 24 jam — mahasiswa chat duluan ke nomor resmi
 * (membuka jendela), lalu sistem membalas hasil sebagai pesan layanan GRATIS
 * tanpa perlu template berbayar.
 *
 * Provider dipilih via env WA_PROVIDER:
 *   - "log"   (default) : tidak benar-benar mengirim, hanya mencatat ke log.
 *                         Aman untuk dev/staging & tanpa kredensial (nol risiko).
 *   - "cloud"           : WhatsApp Cloud API resmi (Meta). Butuh
 *                         WA_CLOUD_PHONE_ID + WA_CLOUD_TOKEN.
 */
export type WaProvider = "log" | "cloud"

export interface WaSendResult {
  ok: boolean
  provider: WaProvider
  /** Id pesan dari provider (bila ada). */
  id?: string
  error?: string
  /** true bila sengaja dilewati (mis. nomor tak valid / fitur nonaktif). */
  skipped?: boolean
}

function getProvider(): WaProvider {
  const p = (process.env.WA_PROVIDER ?? "log").toLowerCase()
  return p === "cloud" ? "cloud" : "log"
}

/** Apakah notifikasi WhatsApp diaktifkan sama sekali. Default: aktif (mode log). */
export function isWhatsappEnabled(): boolean {
  return (process.env.WA_ENABLED ?? "true") !== "false"
}

/**
 * Kirim pesan teks WhatsApp ke satu nomor (best-effort).
 * Tidak pernah melempar — selalu mengembalikan WaSendResult.
 */
export async function sendWhatsappText(
  rawPhone: string | null | undefined,
  message: string,
): Promise<WaSendResult> {
  const provider = getProvider()

  if (!isWhatsappEnabled()) {
    return { ok: false, provider, skipped: true, error: "WA dinonaktifkan (WA_ENABLED=false)" }
  }

  const phone = normalizeIndonesianPhone(rawPhone)
  if (!phone) {
    return { ok: false, provider, skipped: true, error: "Nomor WhatsApp tidak valid/ kosong" }
  }

  if (provider === "log") {
    logger.info("wa.send.log_only", { phone, preview: message.slice(0, 120) })
    return { ok: true, provider: "log", skipped: true }
  }

  // provider === "cloud"
  try {
    return await sendViaCloud(phone, message)
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    logger.warn("wa.send.cloud_failed", { phone, error })
    return { ok: false, provider: "cloud", error }
  }
}

/**
 * Kirim via WhatsApp Cloud API (Meta).
 * Endpoint: POST https://graph.facebook.com/<ver>/<PHONE_ID>/messages
 * Memakai tipe "text" (cocok untuk balasan dalam service window 24 jam — gratis).
 */
async function sendViaCloud(phone: string, message: string): Promise<WaSendResult> {
  const phoneId = process.env.WA_CLOUD_PHONE_ID
  const token = process.env.WA_CLOUD_TOKEN
  const version = process.env.WA_CLOUD_VERSION ?? "v21.0"
  if (!phoneId || !token) {
    return {
      ok: false,
      provider: "cloud",
      error: "WA_CLOUD_PHONE_ID / WA_CLOUD_TOKEN belum di-set",
    }
  }

  const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "text",
      text: { preview_url: true, body: message },
    }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    messages?: Array<{ id: string }>
    error?: { message?: string }
  }

  if (!res.ok) {
    const error = data?.error?.message || `HTTP ${res.status}`
    return { ok: false, provider: "cloud", error }
  }

  return { ok: true, provider: "cloud", id: data?.messages?.[0]?.id }
}
