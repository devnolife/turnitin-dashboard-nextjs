/**
 * Logika pencocokan SimilarityRule + keputusan status submission.
 *
 * Diekstrak agar dipakai bersama oleh:
 * - `lib/graduation.ts` (evaluasi kelulusan)
 * - `lib/turnitin/apply-result.ts` (bot menentukan REVIEWED/FLAGGED otomatis)
 *
 * Semua fungsi di sini PURE (tanpa DB) sehingga mudah di-unit-test.
 */

export type RuleType = "PER_CHAPTER" | "PER_EXAM"

export interface RuleLike {
  ruleType: RuleType
  label: string
  maxPercentage: number
}

export interface SubLike {
  examType: string | null
  chapter: string | null
}

/**
 * Apakah sebuah SimilarityRule berlaku untuk submission tertentu.
 * - PER_CHAPTER: cocok bila `chapter` submission sama dengan label rule.
 * - PER_EXAM: cocok bila `examType` submission sama/serupa dengan label rule.
 */
export function ruleMatches(
  rule: { ruleType: RuleType; label: string },
  sub: SubLike,
): boolean {
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

/** Rule pertama yang cocok dengan submission (atau null). */
export function findApplicableRule<R extends RuleLike>(
  rules: R[],
  sub: SubLike,
): R | null {
  return rules.find((r) => ruleMatches(r, sub)) ?? null
}

export interface StatusDecision {
  status: "REVIEWED" | "FLAGGED"
  matchedRule: RuleLike | null
  threshold: number | null
}

/**
 * Tentukan status submission dari skor similarity + daftar rule prodi.
 * - Ada rule cocok: FLAGGED bila `score > maxPercentage`, selain itu REVIEWED.
 * - Tidak ada rule cocok: REVIEWED (skor tetap disimpan; ambang tak bisa
 *   ditentukan, jadi tidak menandai FLAGGED secara sewenang-wenang).
 */
export function decideSubmissionStatus(
  rules: RuleLike[],
  sub: SubLike,
  similarityScore: number,
): StatusDecision {
  const matchedRule = findApplicableRule(rules, sub)
  if (!matchedRule) {
    return { status: "REVIEWED", matchedRule: null, threshold: null }
  }
  const status = similarityScore > matchedRule.maxPercentage ? "FLAGGED" : "REVIEWED"
  return { status, matchedRule, threshold: matchedRule.maxPercentage }
}
