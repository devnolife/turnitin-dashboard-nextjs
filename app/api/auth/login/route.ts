import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { fetchMahasiswaByNim } from "@/lib/auth/graphql-client"
import { createToken } from "@/lib/auth/verify-token"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex")
}

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
    const { success, remaining, resetAt } = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)

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

    const hashedPassword = md5(password)

    // Step A: Check local database first
    const localUser = await prisma.user.findUnique({
      where: { username },
    })

    if (localUser) {
      // Step B: User exists locally — verify password
      if (localUser.password !== hashedPassword) {
        return NextResponse.json(
          { message: "Username atau password salah" },
          { status: 401 }
        )
      }

      const token = await createToken(localUser.id, localUser.role)
      return NextResponse.json({ user: sanitizeUser(localUser), token })
    }

    // Step C: User not found locally — try GraphQL (student login with NIM)
    let mahasiswa
    try {
      mahasiswa = await fetchMahasiswaByNim(username)
    } catch {
      return NextResponse.json(
        { message: "Gagal menghubungi server akademik. Coba lagi nanti." },
        { status: 503 }
      )
    }

    if (!mahasiswa) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      )
    }

    // Step D: Verify password against GraphQL data (MD5 hash comparison)
    if (mahasiswa.passwd !== hashedPassword) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      )
    }

    // Step E: Password matches — create user in local database
    const newUser = await prisma.user.create({
      data: {
        username: mahasiswa.nim,
        password: hashedPassword,
        name: mahasiswa.nama,
        nim: mahasiswa.nim,
        hp: mahasiswa.hp,
        email: mahasiswa.email,
        prodi: mahasiswa.prodi,
        role: "STUDENT",
      },
    })

    const token = await createToken(newUser.id, newUser.role)
    return NextResponse.json({ user: sanitizeUser(newUser), token })
  } catch (error) {
    logger.error("Login error:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
