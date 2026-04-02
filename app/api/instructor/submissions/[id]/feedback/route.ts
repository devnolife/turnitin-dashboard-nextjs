import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR")

    const { id: submissionId } = await params
    const body = await request.json()
    const { feedback, status, similarityScore } = body

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return NextResponse.json({ message: "Pengiriman tidak ditemukan" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      reviewedBy: auth.userId,
      reviewedAt: new Date(),
    }

    if (status) updateData.status = status
    if (similarityScore !== undefined) updateData.similarityScore = Number(similarityScore)
    if (feedback) updateData.reportUrl = feedback // Store feedback in reportUrl field

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, username: true, nim: true },
        },
      },
    })

    return NextResponse.json({
      message: "Feedback berhasil disimpan",
      submission: updated,
    })
  } catch (error) {
    console.error("Submission feedback error:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan feedback" },
      { status: 500 }
    )
  }
}
