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
 * Kata kunci kanonik per jenis ujian untuk mencocokkan label rule PER_EXAM.
 * Mendukung label Bahasa Indonesia (default editor: "Ujian Proposal/Hasil/Tutup ...")
 * maupun label berbahasa Inggris / enum mentah. Sebuah rule cocok bila labelnya
 * (lowercase) mengandung salah satu kata kunci jenis ujian submission.
 *
 * Penting: kata kunci tiap jenis ujian sengaja tidak saling tumpang tindih agar
 * submission proposal tidak keliru cocok dengan rule "hasil"/"tutup", dst.
 */
const EXAM_TYPE_KEYWORDS: Record<string, string[]> = {
  proposal_defense: ["proposal"],
  results_defense: ["hasil", "result"],
  final_defense: ["tutup", "akhir", "final", "munaqasyah", "meja"],
}

/**
 * Apakah sebuah SimilarityRule berlaku untuk submission tertentu.
 * - PER_CHAPTER: cocok bila `chapter` submission sama dengan label rule.
 * - PER_EXAM: cocok bila `examType` submission sama/serupa dengan label rule
 *   (lewat enum/stem Inggris ATAU kata kunci kanonik Bahasa Indonesia).
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
    const examNorm = sub.examType.toLowerCase().trim() // mis. "results_defense"
    const examStem = examNorm.replace(/_defense$/i, "") // mis. "results"
    // 1) Kecocokan enum/stem langsung (label berbahasa Inggris atau enum mentah).
    if (
      examNorm === labelNorm ||
      examStem === labelNorm ||
      labelNorm.includes(examStem)
    ) {
      return true
    }
    // 2) Kata kunci kanonik — menutup label Bahasa Indonesia default editor,
    //    mis. "Ujian Hasil" (results) & "Ujian Tutup / Sidang Akhir" (final)
    //    yang TIDAK mengandung stem Inggris sehingga sebelumnya tak pernah cocok.
    const keywords = EXAM_TYPE_KEYWORDS[examNorm] ?? []
    return keywords.some((kw) => labelNorm.includes(kw))
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
