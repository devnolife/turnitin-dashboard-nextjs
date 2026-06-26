import { prisma } from "@/lib/prisma"
import { saveReportBuffer, type SavedFile } from "@/lib/upload"
import { decideSubmissionStatus } from "@/lib/similarity-rule"
import { evaluateGraduation } from "@/lib/graduation"
import { logger } from "@/lib/logger"

export interface ApplyResultInput {
  submissionId: string
  /** Persentase similarity 0..100 dari Turnitin. */
  similarity: number
  /** Isi PDF report (opsional — bila gagal diunduh, skor tetap disimpan). */
  reportPdf: Buffer | null
  /** Jumlah Integrity Flags (opsional — null bila tak terbaca). */
  integrityFlags?: number | null
}

/**
 * Tulis hasil pengecekan Turnitin ke Submission. Status REVIEWED/FLAGGED diputuskan
 * otomatis dari batas per-dokumen (thresholdOverride) atau `SimilarityRule` prodi.
 */
export async function applyTurnitinResult(
  input: ApplyResultInput,
): Promise<{ status: "REVIEWED" | "FLAGGED" }> {
  const submission = await prisma.submission.findUnique({
    where: { id: input.submissionId },
    include: { user: { select: { studyProgramId: true } } },
  })
  if (!submission) {
    throw new Error(`Submission ${input.submissionId} tidak ditemukan`)
  }

  // Keputusan REVIEWED/FLAGGED: batas per-dokumen (thresholdOverride) MENGALAHKAN
  // aturan prodi bila di-set; selain itu pakai SimilarityRule prodi.
  let decision: { status: "REVIEWED" | "FLAGGED"; threshold: number | null }
  if (submission.thresholdOverride != null) {
    decision = {
      status: input.similarity > submission.thresholdOverride ? "FLAGGED" : "REVIEWED",
      threshold: submission.thresholdOverride,
    }
  } else {
    const rules = submission.user.studyProgramId
      ? await prisma.similarityRule.findMany({
          where: { studyProgramId: submission.user.studyProgramId },
        })
      : []
    decision = decideSubmissionStatus(
      rules.map((r) => ({ ruleType: r.ruleType, label: r.label, maxPercentage: r.maxPercentage })),
      { examType: submission.examType, chapter: submission.chapter },
      input.similarity,
    )
  }

  let saved: SavedFile | null = null
  if (input.reportPdf) {
    saved = await saveReportBuffer(
      input.reportPdf,
      submission.id,
      `${submission.documentTitle || "report"}.pdf`,
    )
  }

  const rejectionReason =
    decision.status === "FLAGGED"
      ? `Similarity ${input.similarity}% melebihi batas ${decision.threshold ?? "?"}%`
      : null

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      similarityScore: input.similarity,
      status: decision.status,
      rejectionReason,
      autoCheckedAt: new Date(),
      autoCheckError: null,
      reviewedAt: new Date(),
      ...(input.integrityFlags != null && { integrityFlags: input.integrityFlags }),
      ...(saved && {
        reportUrl: saved.relativePath,
        reportFileName: saved.originalName,
        reportFileSize: saved.size,
        reportMimeType: saved.mimeType,
        reportUploadedAt: new Date(),
      }),
    },
  })

  logger.info("turnitin.auto_result_applied", {
    submissionId: submission.id,
    similarity: input.similarity,
    status: decision.status,
  })

  if (decision.status === "REVIEWED") {
    void evaluateGraduation(submission.userId)
  }

  return { status: decision.status }
}
