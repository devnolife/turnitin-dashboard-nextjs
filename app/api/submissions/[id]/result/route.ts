import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { saveUploadedFile, validateFile } from "@/lib/upload"
import { logger } from "@/lib/logger"
import { evaluateGraduation } from "@/lib/graduation"

export const runtime = "nodejs"

const schema = z.object({
  similarity: z.coerce.number().min(0).max(100),
  status: z.enum(["REVIEWED", "FLAGGED"]),
  rejectionReason: z.string().max(1000).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR", "ADMIN")
    const { id } = await params

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { user: { select: { instructorId: true } } },
    })
    if (!submission) {
      return NextResponse.json({ error: "Submission tidak ditemukan" }, { status: 404 })
    }
    if (auth.role === "INSTRUCTOR" && submission.user.instructorId !== auth.userId) {
      throw new AuthError("Bukan mahasiswa Anda", 403)
    }
    if (submission.status !== "PROCESSING") {
      return NextResponse.json(
        {
          error:
            submission.status === "PENDING"
              ? "Submission harus diklaim (status PROCESSING) sebelum upload hasil."
              : `Submission sudah berstatus ${submission.status}`,
        },
        { status: 409 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("report")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File report wajib di-upload" }, { status: 400 })
    }
    const v = await validateFile(file, "report")
    if (!v.ok) return NextResponse.json({ error: v.reason }, { status: 400 })

    const parsed = schema.safeParse({
      similarity: formData.get("similarity"),
      status: formData.get("status"),
      rejectionReason: formData.get("rejectionReason") || undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.issues },
        { status: 400 },
      )
    }
    const { similarity, status, rejectionReason } = parsed.data

    if (status === "FLAGGED" && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: "Alasan revisi wajib diisi untuk status FLAGGED" },
        { status: 400 },
      )
    }

    const saved = await saveUploadedFile(file, "report", submission.id)

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        similarityScore: similarity,
        status,
        rejectionReason: status === "FLAGGED" ? rejectionReason : null,
        reportUrl: saved.relativePath,
        reportFileName: saved.originalName,
        reportFileSize: saved.size,
        reportMimeType: saved.mimeType,
        reportUploadedAt: new Date(),
        reviewedBy: auth.userId,
        reviewedAt: new Date(),
      },
    })

    logger.info("Submission reviewed", { id, status, similarity, reviewer: auth.userId })

    if (status === "REVIEWED") {
      void evaluateGraduation(updated.userId)
    }

    return NextResponse.json({ submission: updated })
  } catch (error) {
    logger.error("Submission result failed", { error })
    return handleAuthError(error)
  }
}
