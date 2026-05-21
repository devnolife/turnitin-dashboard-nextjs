import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

const ALLOWED_STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const
type ComplaintStatus = (typeof ALLOWED_STATUS)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const existing = await prisma.complaint.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 })
    }

    const data: {
      status?: ComplaintStatus
      response?: string | null
      respondedById?: string
      respondedAt?: Date
    } = {}

    if (typeof body.response === "string") {
      const trimmed = body.response.trim()
      if (trimmed.length > 5000) {
        return NextResponse.json({ message: "Balasan terlalu panjang" }, { status: 400 })
      }
      data.response = trimmed || null
      if (trimmed) {
        data.respondedById = auth.userId
        data.respondedAt = new Date()
      }
    }
    if (typeof body.status === "string" && ALLOWED_STATUS.includes(body.status)) {
      data.status = body.status as ComplaintStatus
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "Tidak ada perubahan" }, { status: 400 })
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, username: true, nim: true } },
        respondedBy: { select: { id: true, name: true } },
      },
    })

    logger.info("admin.complaints.updated", { adminId: auth.userId, complaintId: id })
    return NextResponse.json({ complaint: updated })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.complaints.update_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memperbarui" }, { status: 500 })
  }
}
