import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    const { id } = await params
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        respondedBy: { select: { id: true, name: true } },
      },
    })
    if (!complaint || complaint.userId !== auth.userId) {
      return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 })
    }
    return NextResponse.json({ complaint })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("complaints.get_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat" }, { status: 500 })
  }
}
