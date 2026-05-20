import { NextRequest, NextResponse } from "next/server"
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
    createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const userAgent = request.headers.get("user-agent")
    const { success, resetAt } = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)

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
    const { username, password } = body

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

      if (!bcryptOk && !md5Ok) {
        return NextResponse.json(
          { message: "Username atau password salah" },
          { status: 401 }
        )
      }

      if (!bcryptOk) {
        // Upgrade password ke bcrypt secara transparan
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

    // Step E: Buat user lokal — simpan MD5 (untuk kompat GraphQL) + bcrypt
    const bcryptHash = await hashPassword(password)
    const newUser = await prisma.user.create({
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
