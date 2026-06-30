/**
 * One-off migration: bersihkan hash MD5 password lama dari user yang SUDAH migrasi.
 *
 * Konteks: kolom `users.password` dahulu menyimpan MD5 dari password asli (lemah,
 * trivial di-crack bila DB bocor). Sejak perbaikan keamanan, sistem hanya menyimpan
 * bcrypt di `passwordHash` dan mengisi `password` dengan sentinel non-rahasia.
 *
 * Script ini menimpa `password` menjadi sentinel untuk SEMUA user yang SUDAH punya
 * `passwordHash` (bcrypt) — aman karena login tetap bisa lewat bcrypt. User TANPA
 * `passwordHash` (belum pernah login sejak migrasi bcrypt) sengaja DILEWATI agar
 * MD5 lama masih bisa memverifikasi sekali, lalu otomatis di-upgrade saat login.
 *
 * Idempotent: aman dijalankan berkali-kali.
 *
 * Jalankan: npm run scrub:md5   (atau: npx tsx scripts/scrub-legacy-md5.ts)
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Harus sama dengan PASSWORD_PLACEHOLDER di lib/auth/password.ts.
const PASSWORD_PLACEHOLDER = "managed-by-bcrypt"

async function main() {
  const where = {
    passwordHash: { not: null },
    password: { not: PASSWORD_PLACEHOLDER },
  } as const

  const target = await prisma.user.count({ where })

  if (target === 0) {
    console.log("Tidak ada hash MD5 legacy yang perlu dibersihkan. \u2713")
  } else {
    console.log(`Membersihkan MD5 legacy dari ${target} user (sudah punya bcrypt)...`)
    const res = await prisma.user.updateMany({
      where,
      data: { password: PASSWORD_PLACEHOLDER },
    })
    console.log(`Selesai. ${res.count} baris diperbarui. \u2713`)
  }

  const remaining = await prisma.user.count({ where: { passwordHash: null } })
  if (remaining > 0) {
    console.log(
      `Catatan: ${remaining} user belum punya bcrypt (passwordHash null) dan ` +
        `sengaja dilewati; MD5 mereka akan di-scrub otomatis saat login berikutnya.`,
    )
  }
}

main()
  .catch((e) => {
    console.error("Scrub gagal:", e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
