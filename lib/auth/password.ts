import { createHash } from "crypto"
import bcrypt from "bcryptjs"

const BCRYPT_ROUNDS = 12

/**
 * Sentinel untuk kolom `password` (legacy MD5). Kami TIDAK lagi menyimpan MD5 dari
 * password asli karena MD5 tanpa salt trivial di-crack bila DB bocor. bcrypt
 * (`passwordHash`) adalah SATU-SATUNYA hash password yang disimpan. Nilai ini
 * sengaja BUKAN string 32-hex agar tidak pernah cocok dengan `md5(...)` apa pun
 * pada `verifyMd5` (sehingga baris yang sudah dimigrasi hanya bisa lewat bcrypt).
 */
export const PASSWORD_PLACEHOLDER = "managed-by-bcrypt"

/**
 * Legacy MD5 hash. Dipakai HANYA secara transien (tidak disimpan):
 * 1. Verifikasi sekali user lama yang belum migrasi ke bcrypt (lalu di-upgrade).
 * 2. Sinkron dengan GraphQL UNISMUH (kolom `passwd` di sana memakai MD5) — kita
 *    bandingkan `md5(inputPassword)` dengan nilai milik SIMAK, bukan menyimpannya.
 * JANGAN menulis hasil `md5()` ke database (pakai `PASSWORD_PLACEHOLDER`).
 */
export function md5(input: string): string {
  return createHash("md5").update(input).digest("hex")
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

export async function verifyBcrypt(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function verifyMd5(plain: string, hash: string): boolean {
  return md5(plain) === hash
}
