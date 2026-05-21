import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    const items = await prisma.complaint.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      include: {
        respondedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ items })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("complaints.list_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat pengaduan" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    const body = await request.json().catch(() => ({}))
    const subject = typeof body.subject === "string" ? body.subject.trim() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""

    if (subject.length < 3 || subject.length > 200) {
      return NextResponse.json(
        { message: "Judul harus 3-200 karakter" },
        { status: 400 }
      )
    }
    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { message: "Isi pesan harus 10-5000 karakter" },
        { status: 400 }
      )
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: auth.userId,
        subject,
        message,
      },
    })
    logger.info("complaints.created", { userId: auth.userId, complaintId: complaint.id })
    return NextResponse.json({ complaint }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("complaints.create_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal mengirim pengaduan" }, { status: 500 })
  }
}
