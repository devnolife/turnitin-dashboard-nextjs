import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { ruleMatches } from "@/lib/similarity-rule"

/**
 * Evaluasi apakah seorang mahasiswa layak ditandai LULUS (GRADUATED).
 *
 * Definisi LULUS:
 * - Mahasiswa punya `studyProgramId` dengan minimal satu SimilarityRule.
 * - Setiap rule prodi memiliki minimal satu Submission yang:
 *     - Cocok dengan rule (lihat `ruleMatches`)
 *     - status = REVIEWED
 *     - similarityScore <= rule.maxPercentage
 *
 * Fungsi ini idempotent dan aman dipanggil setelah setiap review.
 * Jika user sudah `GRADUATED`, fungsi tidak mengubah status.
 */
export async function evaluateGraduation(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        accountStatus: true,
        studyProgramId: true,
        examDetails: { select: { examType: true } },
      },
    })
    if (!user || user.role !== "STUDENT") return false
    if (user.accountStatus === "GRADUATED") return true
    if (!user.studyProgramId) return false

    const rules = await prisma.similarityRule.findMany({
      where: { studyProgramId: user.studyProgramId },
    })
    if (rules.length === 0) return false

    const submissions = await prisma.submission.findMany({
      where: { userId, status: "REVIEWED" },
      select: {
        examType: true,
        chapter: true,
        similarityScore: true,
      },
    })
    if (submissions.length === 0) return false

    const allPassed = rules.every((rule) => {
      return submissions.some((sub) => {
        if (sub.similarityScore == null) return false
        if (sub.similarityScore > rule.maxPercentage) return false
        return ruleMatches(rule, sub)
      })
    })
    if (!allPassed) return false

    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "GRADUATED",
        graduatedAt: new Date(),
      },
    })
    logger.info("user.graduated", { userId })
    return true
  } catch (e) {
    logger.warn("evaluateGraduation_failed", { userId, error: String(e) })
    return false
  }
}
