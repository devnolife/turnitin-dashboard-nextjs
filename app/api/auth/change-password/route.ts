import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { hashPassword, md5, verifyBcrypt, verifyMd5 } from "@/lib/auth/password"
import { rateLimit } from "@/lib/rate-limit"
import { audit } from "@/lib/audit"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    const rl = await rateLimit(`change-password:${auth.userId}`, 5, 15 * 60 * 1000)
    if (!rl.success) {
      const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { message: `Terlalu banyak percobaan ganti password. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      )
    }

    const body = await request.json().catch(() => ({}))
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : ""
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : ""

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password baru minimal 8 karakter" },
        { status: 400 }
      )
    }
    if (newPassword.length > 128) {
      return NextResponse.json({ message: "Password terlalu panjang" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }

    if (!currentPassword) {
      return NextResponse.json(
        { message: "Password saat ini harus diisi" },
        { status: 400 }
      )
    }

    const bcryptOk = user.passwordHash
      ? await verifyBcrypt(currentPassword, user.passwordHash)
      : false
    const md5Ok = !bcryptOk && verifyMd5(currentPassword, user.password)
    if (!bcryptOk && !md5Ok) {
      return NextResponse.json(
        { message: "Password saat ini tidak cocok" },
        { status: 401 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { message: "Password baru harus berbeda dari password saat ini" },
        { status: 400 }
      )
    }

    const newHash = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: md5(newPassword),
        passwordHash: newHash,
        mustChangePassword: false,
      },
    })

    logger.info("user.password_changed", { userId: user.id })
    void audit("auth.password_changed", {
      request,
      actorId: user.id,
      actorRole: user.role,
      targetType: "user",
      targetId: user.id,
    })

    return NextResponse.json({ message: "Password berhasil diubah" })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("change_password_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal mengubah password" }, { status: 500 })
  }
}
