import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"
import { evaluateGraduation } from "@/lib/graduation"
import { z } from "zod"

const feedbackSchema = z.object({
  feedback: z.string().min(1, "Feedback tidak boleh kosong").optional(),
  status: z.enum(["REVIEWED", "FLAGGED", "PENDING"]).optional(),
  similarityScore: z.number().min(0).max(100).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR")

    const { id: submissionId } = await params
    const body = await request.json()
    const result = feedbackSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const { feedback, status, similarityScore } = result.data

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return NextResponse.json({ message: "Pengiriman tidak ditemukan" }, { status: 404 })
    }

    // Ownership check: prevent different instructor from overwriting
    if (submission.reviewedBy && submission.reviewedBy !== auth.userId) {
      return NextResponse.json(
        { message: "Pengiriman ini sudah direview oleh dosen lain" },
        { status: 403 }
      )
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

    if (status === "REVIEWED") {
      void evaluateGraduation(updated.userId)
    }

    return NextResponse.json({
      message: "Feedback berhasil disimpan",
      submission: updated,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Submission feedback error:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan feedback" },
      { status: 500 }
    )
  }
}
