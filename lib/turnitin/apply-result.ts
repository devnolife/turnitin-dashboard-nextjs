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
}

/**
 * Tulis hasil pengecekan Turnitin ke Submission — setara dengan yang dilakukan
 * endpoint manual `/result`, tetapi status REVIEWED/FLAGGED diputuskan otomatis
 * dari `SimilarityRule` prodi mahasiswa.
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

  const rules = submission.user.studyProgramId
    ? await prisma.similarityRule.findMany({
        where: { studyProgramId: submission.user.studyProgramId },
      })
    : []

  const decision = decideSubmissionStatus(
    rules.map((r) => ({ ruleType: r.ruleType, label: r.label, maxPercentage: r.maxPercentage })),
    { examType: submission.examType, chapter: submission.chapter },
    input.similarity,
  )

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
