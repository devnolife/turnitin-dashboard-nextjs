import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (role && role !== "all") {
      where.role = role.toUpperCase()
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { nim: { contains: search, mode: "insensitive" } },
        { prodi: { contains: search, mode: "insensitive" } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        nim: true,
        email: true,
        prodi: true,
        role: true,
        hasCompletedPayment: true,
        whatsappNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ users })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Admin users error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data pengguna" },
      { status: 500 }
    )
  }
}
