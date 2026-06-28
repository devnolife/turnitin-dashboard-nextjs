import { NextRequest, NextResponse } from "next/server"
import { Prisma, type User } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { fetchMahasiswaByNim } from "@/lib/auth/graphql-client"
import { createSession, setSessionCookie } from "@/lib/auth/verify-token"
import { hashPassword, md5, verifyBcrypt, verifyMd5 } from "@/lib/auth/password"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

function sanitizeUser(user: {
  id: string
  username: string
  name: string
  role: string
  nim?: string | null
  hp?: string | null
  email?: string | null
  prodi?: string | null
  hasCompletedPayment: boolean
  whatsappNumber?: string | null
  mustChangePassword?: boolean
  accountStatus?: "ACTIVE" | "INACTIVE" | "GRADUATED"
  graduatedAt?: Date | null
  tourCompletedAt?: Date | null
  createdAt?: Date | null
}) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role.toLowerCase(),
    nim: user.nim ?? undefined,
    hp: user.hp ?? undefined,
    email: user.email ?? undefined,
    prodi: user.prodi ?? undefined,
    hasCompletedPayment: user.hasCompletedPayment,
    whatsappNumber: user.whatsappNumber ?? undefined,
    mustChangePassword: user.mustChangePassword ?? false,
    accountStatus: user.accountStatus,
    graduatedAt: user.graduatedAt ? user.graduatedAt.toISOString() : null,
    tourCompletedAt: user.tourCompletedAt ? user.tourCompletedAt.toISOString() : null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const userAgent = request.headers.get("user-agent")
    const { success, resetAt } = await rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)

    if (!success) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { message: `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.` },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      )
    }

    const body = await request.json()
    const password = body.password
    const username = typeof body.username === "string" ? body.username.trim() : body.username

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password harus diisi" },
        { status: 400 }
      )
    }

    // Step A: Check local database first
    const localUser = await prisma.user.findUnique({
      where: { username },
    })

    if (localUser) {
      // Step B: Verifikasi password. Prefer bcrypt; fallback MD5 untuk user lama,
      // lalu migrasi otomatis ke bcrypt setelah verifikasi berhasil.
      const bcryptOk = localUser.passwordHash
        ? await verifyBcrypt(password, localUser.passwordHash)
        : false
      const md5Ok = !bcryptOk && verifyMd5(password, localUser.password)

      let authOk = bcryptOk || md5Ok
      let syncedFromSimak = false

      // Step B.1: Jika local gagal, sync ke SIMAK untuk STUDENT.
      // Kasus: user mengganti password di SIMAK setelah login pertama,
      // jadi hash lokal sudah basi. Verifikasi ulang ke GraphQL — kalau
      // password yang diinput sekarang cocok di SIMAK, sinkronkan lokal.
      if (!authOk && localUser.role === "STUDENT" && localUser.nim) {
        try {
          const mahasiswa = await fetchMahasiswaByNim(localUser.nim)
          if (mahasiswa && mahasiswa.passwd === md5(password)) {
            authOk = true
            syncedFromSimak = true
          }
        } catch (e) {
          // GraphQL down: jangan ungkap; biarkan authOk tetap false.
          logger.warn("SIMAK fallback failed during login:", e)
        }
      }

      if (!authOk) {
        return NextResponse.json(
          { message: "Username atau password salah" },
          { status: 401 }
        )
      }

      if (syncedFromSimak) {
        // Password SIMAK berubah → tulis ulang MD5 + bcrypt lokal.
        try {
          const newHash = await hashPassword(password)
          await prisma.user.update({
            where: { id: localUser.id },
            data: {
              password: md5(password),
              passwordHash: newHash,
            },
          })
          logger.info("Password resynced from SIMAK", { userId: localUser.id })
        } catch (e) {
          logger.warn("Failed to persist resynced SIMAK password:", e)
        }
      } else if (!bcryptOk) {
        // Upgrade password MD5-only ke bcrypt secara transparan.
        try {
          const newHash = await hashPassword(password)
          await prisma.user.update({
            where: { id: localUser.id },
            data: { passwordHash: newHash },
          })
        } catch (e) {
          logger.warn("Failed to upgrade password to bcrypt:", e)
        }
      }

      if (localUser.accountStatus === "INACTIVE") {
        return NextResponse.json(
          { message: "Akun Anda dinonaktifkan. Silakan hubungi admin." },
          { status: 403 }
        )
      }

      const { token, expiresAt } = await createSession(localUser.id, localUser.role, {
        ip,
        userAgent,
      })
      const res = NextResponse.json({ user: sanitizeUser(localUser), token })
      setSessionCookie(res, token, expiresAt)
      return res
    }

    // Step C: User not found locally — try GraphQL (student login with NIM)
    let mahasiswa
    try {
      mahasiswa = await fetchMahasiswaByNim(username)
    } catch {
      // Samakan dengan invalid credentials agar tidak bocor info ketersediaan layanan
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      )
    }

    if (!mahasiswa) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      )
    }

    // Step D: Verify password against GraphQL data (MD5)
    if (mahasiswa.passwd !== md5(password)) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      )
    }

    // Step E: Buat user lokal secara idempoten — simpan MD5 (kompat GraphQL) + bcrypt.
    // Password sudah diverifikasi terhadap SIMAK (Step D), jadi bila record dengan
    // username = NIM kanonik sudah ada (request paralel/double-submit, atau input
    // username dengan format berbeda dari NIM kanonik), perlakukan sebagai login
    // user tersebut alih-alih menggagalkan dengan unique constraint.
    const bcryptHash = await hashPassword(password)
    let newUser: User
    try {
      newUser = await prisma.user.create({
        data: {
          username: mahasiswa.nim,
          password: md5(password),
          passwordHash: bcryptHash,
          name: mahasiswa.nama,
          nim: mahasiswa.nim,
          hp: mahasiswa.hp,
          email: mahasiswa.email,
          prodi: mahasiswa.prodi,
          role: "STUDENT",
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        // User sudah ter-provisioning (race condition atau NIM kanonik != input).
        // Cari via NIM (identitas kanonik SIMAK) dulu, lalu fallback ke username —
        // keduanya unik dan di Step E di-set ke nilai yang sama.
        const existing =
          (await prisma.user.findUnique({ where: { nim: mahasiswa.nim } })) ??
          (await prisma.user.findUnique({ where: { username: mahasiswa.nim } }))
        if (!existing) throw e
        if (existing.accountStatus === "INACTIVE") {
          return NextResponse.json(
            { message: "Akun Anda dinonaktifkan. Silakan hubungi admin." },
            { status: 403 }
          )
        }
        // Sinkronkan hash lokal (best-effort) agar konsisten dengan SIMAK.
        try {
          await prisma.user.update({
            where: { id: existing.id },
            data: { password: md5(password), passwordHash: bcryptHash },
          })
        } catch (updateErr) {
          logger.warn("Failed to sync password for existing user during login race:", updateErr)
        }
        newUser = existing
      } else {
        throw e
      }
    }

    const { token, expiresAt } = await createSession(newUser.id, newUser.role, {
      ip,
      userAgent,
    })
    const res = NextResponse.json({ user: sanitizeUser(newUser), token })
    setSessionCookie(res, token, expiresAt)
    return res
  } catch (error) {
    logger.error("Login error:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
