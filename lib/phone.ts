/**
 * Normalisasi nomor telepon Indonesia ke format E.164 tanpa tanda "+".
 * Cocok untuk URL `https://wa.me/<nomor>`.
 *
 * Contoh:
 *   "081234567890"       -> "6281234567890"
 *   "+62 812-3456-7890"  -> "6281234567890"
 *   "62 812 3456 7890"   -> "6281234567890"
 *   "8123456789"         -> "628123456789"
 *
 * Mengembalikan null jika input kosong atau tidak terlihat valid (< 9 digit).
 */
export function normalizeIndonesianPhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D+/g, "")
  if (!digits) return null

  let normalized: string
  if (digits.startsWith("62")) {
    normalized = digits
  } else if (digits.startsWith("0")) {
    normalized = "62" + digits.slice(1)
  } else if (digits.startsWith("8")) {
    normalized = "62" + digits
  } else {
    normalized = digits
  }

  if (normalized.length < 10 || normalized.length > 15) return null
  return normalized
}

/**
 * Bangun URL wa.me untuk membuka chat langsung dengan pesan terisi.
 * Mengembalikan null jika nomor tidak valid.
 */
export function buildWaMeUrl(phone: string | null | undefined, message: string): string | null {
  const normalized = normalizeIndonesianPhone(phone)
  if (!normalized) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}
