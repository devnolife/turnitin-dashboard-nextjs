import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { hashPassword, PASSWORD_PLACEHOLDER } from "@/lib/auth/password"
import { rateLimit } from "@/lib/rate-limit"
import { audit } from "@/lib/audit"
import { logger } from "@/lib/logger"

function generateTempPassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const rl = await rateLimit(`reset-password:${auth.userId}`, 30, 60 * 60 * 1000)
    if (!rl.success) {
      const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { message: "Terlalu banyak reset password. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      )
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, username: true, role: true },
    })
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Tidak dapat mereset password admin dari sini" },
        { status: 403 }
      )
    }

    const tempPassword = generateTempPassword(10)
    const newHash = await hashPassword(tempPassword)

    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          password: PASSWORD_PLACEHOLDER,
          passwordHash: newHash,
          mustChangePassword: true,
        },
      }),
      prisma.session.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])

    logger.info("admin.password_reset", { adminId: auth.userId, targetUserId: id })
    void audit("admin.password_reset", {
      request,
      actorId: auth.userId,
      actorRole: "ADMIN",
      targetType: "user",
      targetId: id,
      metadata: { targetUsername: user.username, targetRole: user.role },
    })

    return NextResponse.json({
      message: "Password berhasil direset",
      tempPassword,
      user: { id: user.id, name: user.name, username: user.username },
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.password_reset_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal mereset password" }, { status: 500 })
  }
}
