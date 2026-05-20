import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR")

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}
    if (status && ["PENDING", "REVIEWED", "FLAGGED"].includes(status.toUpperCase())) {
      where.status = status.toUpperCase()
    }
    if (search && search.trim().length > 0) {
      where.documentTitle = { contains: search.trim(), mode: "insensitive" }
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              nim: true,
              prodi: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.submission.count({ where }),
    ])

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Instructor submissions error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data pengiriman" },
      { status: 500 }
    )
  }
}
