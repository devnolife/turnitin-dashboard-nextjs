import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const params = request.nextUrl.searchParams
    const yearParam = params.get("year")
    const monthParam = params.get("month")
    const where: Record<string, unknown> = {}
    if (yearParam) where.periodeYear = parseInt(yearParam)
    if (monthParam) where.periodeMonth = parseInt(monthParam)

    const archives = await prisma.rekapArchive.findMany({
      where,
      select: {
        id: true,
        periodeMonth: true,
        periodeYear: true,
        periodeLabel: true,
        filterSummary: true,
        fileName: true,
        fileSize: true,
        totalItems: true,
        totalAmount: true,
        generatedByName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    return NextResponse.json({ archives })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.rekap.archives.list_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat arsip rekap" }, { status: 500 })
  }
}
