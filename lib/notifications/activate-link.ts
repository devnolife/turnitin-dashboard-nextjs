import { buildWaMeUrl } from "@/lib/phone"

/**
 * Bangun link wa.me agar mahasiswa MENGIRIM pesan duluan ke nomor resmi kampus.
 * Tujuannya membuka "service window" 24 jam WhatsApp Cloud API, sehingga sistem
 * bisa membalas notifikasi hasil secara GRATIS (tanpa template berbayar) dan
 * sepenuhnya sesuai aturan (user yang inisiasi → bukan spam).
 *
 * Nomor resmi diambil dari env WA_OFFICIAL_NUMBER. Pesan awal menyertakan token
 * submission (6 hex terakhir) supaya inbound bisa dipetakan ke mahasiswa nanti.
 *
 * Mengembalikan null bila nomor resmi belum di-set.
 */
export function buildActivateWaUrl(opts: { token?: string | null } = {}): string | null {
  const official = process.env.WA_OFFICIAL_NUMBER || process.env.NEXT_PUBLIC_WA_OFFICIAL_NUMBER
  if (!official) return null
  const tokenPart = opts.token ? ` #${opts.token}` : ""
  const text = `Halo Perpusmu, saya ingin menerima notifikasi hasil cek plagiarisme via WhatsApp.${tokenPart}`
  return buildWaMeUrl(official, text)
}
