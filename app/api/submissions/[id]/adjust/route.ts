import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { decideSubmissionStatus } from "@/lib/similarity-rule"
import { evaluateGraduation } from "@/lib/graduation"
import { audit } from "@/lib/audit"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"

const schema = z.object({
  similarity: z.coerce.number().min(0).max(100),
  status: z.enum(["REVIEWED", "FLAGGED"]).optional(),
  reason: z.string().min(5, "Alasan minimal 5 karakter").max(1000),
})

/**
 * Sesuaikan (override) hasil Turnitin secara manual dengan jejak audit.
 * Skor ASLI Turnitin disimpan permanen di `turnitinRawScore` (saat override pertama)
 * dan tetap ditampilkan — penyesuaian = menambah catatan, bukan menghapus.
 */
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
      include: { user: { select: { instructorId: true, studyProgramId: true } } },
    })
    if (!submission) {
      return NextResponse.json({ error: "Submission tidak ditemukan" }, { status: 404 })
    }
    if (auth.role === "INSTRUCTOR" && submission.user.instructorId !== auth.userId) {
      throw new AuthError("Bukan mahasiswa Anda", 403)
    }
    if (submission.status !== "REVIEWED" && submission.status !== "FLAGGED") {
      return NextResponse.json(
        { error: "Hanya hasil yang sudah ada (REVIEWED/FLAGGED) yang dapat disesuaikan." },
        { status: 409 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.issues },
        { status: 400 },
      )
    }
    const { similarity, status: providedStatus, reason } = parsed.data

    // Simpan skor asli Turnitin saat override PERTAMA (jangan ditimpa di override berikutnya).
    const rawScore = submission.turnitinRawScore ?? submission.similarityScore ?? null

    // Status: pakai yang diberikan, atau hitung ulang dari SimilarityRule prodi.
    let newStatus: "REVIEWED" | "FLAGGED"
    if (providedStatus) {
      newStatus = providedStatus
    } else {
      const rules = submission.user.studyProgramId
        ? await prisma.similarityRule.findMany({
            where: { studyProgramId: submission.user.studyProgramId },
          })
        : []
      newStatus = decideSubmissionStatus(
        rules.map((r) => ({ ruleType: r.ruleType, label: r.label, maxPercentage: r.maxPercentage })),
        { examType: submission.examType, chapter: submission.chapter },
        similarity,
      ).status
    }

    const actor = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true },
    })

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        turnitinRawScore: rawScore,
        similarityScore: similarity,
        status: newStatus,
        rejectionReason: newStatus === "FLAGGED" ? reason : null,
        scoreAdjustedBy: auth.userId,
        scoreAdjustedByName: actor?.name ?? null,
        scoreAdjustedAt: new Date(),
        scoreAdjustmentReason: reason,
        reviewedBy: auth.userId,
        reviewedAt: new Date(),
      },
    })

    await audit("submission.score_adjusted", {
      request,
      actorId: auth.userId,
      actorRole: auth.role,
      targetType: "submission",
      targetId: id,
      metadata: { from: rawScore, to: similarity, status: newStatus, reason },
    })
    logger.info("submission.score_adjusted", {
      id,
      from: rawScore,
      to: similarity,
      status: newStatus,
      by: auth.userId,
    })

    if (newStatus === "REVIEWED") void evaluateGraduation(updated.userId)

    return NextResponse.json({ submission: updated })
  } catch (error) {
    logger.error("Submission adjust failed", { error })
    return handleAuthError(error)
  }
}
