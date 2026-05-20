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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50")))

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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Admin users error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data pengguna" },
      { status: 500 }
    )
  }
}
