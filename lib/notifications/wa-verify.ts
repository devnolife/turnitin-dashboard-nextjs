import { createHmac } from "crypto"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { normalizeIndonesianPhone } from "@/lib/phone"

/**
 * Verifikasi nomor WhatsApp via "chat duluan".
 *
 * Alur: mahasiswa mengirim pesan ke nomor resmi (yang discan Cloud API) berisi
 * KODE unik. Webhook menerima inbound → memverifikasi kode → menyimpan nomor
 * pengirim sebagai whatsappNumber mahasiswa (sekaligus membuka service window).
 *
 * Token bersifat STATELESS & bertanda-tangan (tanpa tabel DB): berisi userId
 * yang di-encode + HMAC, sehingga tidak bisa dipalsukan untuk mengklaim akun lain.
 */

function secret(): string {
  return process.env.WA_TOKEN_SECRET || process.env.JWT_SECRET || "dev-wa-secret"
}

function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url")
}
function unb64url(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8")
}

/** Buat kode verifikasi untuk seorang user. Format: PM_<b64url(userId)>.<hmac8> */
export function makeWaToken(userId: string): string {
  const payload = b64url(userId)
  const sig = createHmac("sha256", secret()).update(userId).digest("hex").slice(0, 8)
  return `PM_${payload}.${sig}`
}

/** Pola untuk menemukan kode di dalam teks pesan inbound. */
const TOKEN_RE = /PM_([A-Za-z0-9_-]+)\.([a-f0-9]{8})/

/** Verifikasi kode → kembalikan userId bila valid, null bila tidak. */
export function verifyWaToken(text: string): string | null {
  const m = text.match(TOKEN_RE)
  if (!m) return null
  let userId: string
  try {
    userId = unb64url(m[1])
  } catch {
    return null
  }
  const expected = createHmac("sha256", secret()).update(userId).digest("hex").slice(0, 8)
  if (expected !== m[2]) return null
  return userId
}

export interface InboundResult {
  ok: boolean
  userId?: string
  phone?: string
  reason?: string
}

/**
 * Proses satu pesan inbound WhatsApp: cocokkan kode → simpan nomor pengirim ke
 * user terkait. Idempotent & best-effort.
 */
export async function processInboundWa(fromPhone: string, text: string): Promise<InboundResult> {
  const userId = verifyWaToken(text)
  if (!userId) return { ok: false, reason: "no_valid_token" }

  const normalized = normalizeIndonesianPhone(fromPhone)
  if (!normalized) return { ok: false, userId, reason: "invalid_phone" }
  const stored = `+${normalized}`

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return { ok: false, userId, reason: "user_not_found" }
    await prisma.user.update({
      where: { id: userId },
      data: { whatsappNumber: stored },
    })
    logger.info("wa.verify.saved", { userId, phone: normalized })
    return { ok: true, userId, phone: stored }
  } catch (e) {
    logger.warn("wa.verify.save_failed", { userId, error: e instanceof Error ? e.message : String(e) })
    return { ok: false, userId, reason: "db_error" }
  }
}
