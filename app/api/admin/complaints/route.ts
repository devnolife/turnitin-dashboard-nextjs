import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const where: Prisma.ComplaintWhereInput = {}
    if (status && ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
      where.status = status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
    }

    const items = await prisma.complaint.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: {
        user: {
          select: { id: true, name: true, username: true, nim: true, role: true },
        },
        respondedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ items })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.complaints.list_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat pengaduan" }, { status: 500 })
  }
}
