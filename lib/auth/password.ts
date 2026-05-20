import { createHash } from "crypto"
import bcrypt from "bcryptjs"

const BCRYPT_ROUNDS = 12

/**
 * Legacy MD5 hash. Hanya untuk:
 * 1. Verifikasi awal user lama yang belum migrasi ke bcrypt.
 * 2. Sinkron dengan GraphQL UNISMUH (kolom `passwd` di sana memakai MD5).
 * JANGAN dipakai untuk user baru tanpa di-pair dengan bcrypt hash.
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
