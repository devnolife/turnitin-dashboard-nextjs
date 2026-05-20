import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const searchParams = request.nextUrl.searchParams
    const rawStatus = searchParams.get("status")
    const rawSearch = searchParams.get("search")
    const rawJenis = searchParams.get("jenis")

    const allowedStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"]
    const status = rawStatus && rawStatus !== "all"
      ? rawStatus.trim().toUpperCase()
      : null
    const search = rawSearch ? rawSearch.trim().slice(0, 200) : null
    const jenis = rawJenis && rawJenis !== "all" ? rawJenis.trim() : null

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Status tidak valid", allowedStatuses },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    if (jenis) {
      where.jenisPembayaran = { contains: jenis, mode: "insensitive" }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            nim: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Admin payments error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data pembayaran" },
      { status: 500 }
    )
  }
}
