import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

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

interface RuleLike {
  ruleType: "PER_CHAPTER" | "PER_EXAM"
  label: string
}

interface SubLike {
  examType: string | null
  chapter: string | null
}

function ruleMatches(rule: RuleLike, sub: SubLike): boolean {
  const labelNorm = rule.label.toLowerCase().trim()
  if (rule.ruleType === "PER_CHAPTER") {
    if (!sub.chapter) return false
    return sub.chapter.toLowerCase().trim() === labelNorm
  }
  if (rule.ruleType === "PER_EXAM") {
    if (!sub.examType) return false
    const examLabel = sub.examType.replace(/_DEFENSE$/i, "").toLowerCase()
    return (
      sub.examType.toLowerCase() === labelNorm ||
      examLabel === labelNorm ||
      labelNorm.includes(examLabel)
    )
  }
  return false
}
