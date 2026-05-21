import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"

/**
 * Mengembalikan user aktif berdasarkan cookie sesi.
 * Dipakai client untuk rehydrate state setelah refresh halaman.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        nim: true,
        hp: true,
        email: true,
        prodi: true,
        hasCompletedPayment: true,
        whatsappNumber: true,
        mustChangePassword: true,
        accountStatus: true,
        graduatedAt: true,
        tourCompletedAt: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
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
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
