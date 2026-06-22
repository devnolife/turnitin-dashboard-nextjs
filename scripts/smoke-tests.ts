/**
 * Smoke test untuk lib/phone.ts dan helper graduation.
 * Jalankan: npx tsx scripts/smoke-tests.ts
 *
 * Bukan jest, tapi cukup untuk verifikasi fungsi pure logic sebelum deploy.
 */
import { normalizeIndonesianPhone, buildWaMeUrl } from "../lib/phone"
import { ruleMatches, decideSubmissionStatus } from "../lib/similarity-rule"

let passed = 0
let failed = 0
const failures: string[] = []

function expect(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    failures.push(`  ✗ ${name}\n    expected: ${JSON.stringify(expected)}\n    got:      ${JSON.stringify(actual)}`)
  }
}

console.log("\n[phone] normalizeIndonesianPhone")
expect("0812 → 6281...", normalizeIndonesianPhone("081234567890"), "6281234567890")
expect("+62 with spaces", normalizeIndonesianPhone("+62 812-3456-7890"), "6281234567890")
expect("62 already", normalizeIndonesianPhone("6281234567890"), "6281234567890")
expect("starts with 8", normalizeIndonesianPhone("81234567890"), "6281234567890")
expect("with dots and parens", normalizeIndonesianPhone("(0812).3456.7890"), "6281234567890")
expect("null input", normalizeIndonesianPhone(null), null)
expect("empty string", normalizeIndonesianPhone(""), null)
expect("only spaces", normalizeIndonesianPhone("   "), null)
expect("too short rejected", normalizeIndonesianPhone("12345"), null)
expect("too long rejected", normalizeIndonesianPhone("6281234567890123456"), null)
expect("undefined input", normalizeIndonesianPhone(undefined), null)

console.log("\n[phone] buildWaMeUrl")
const url = buildWaMeUrl("081234567890", "halo kak")
expect(
  "valid URL shape",
  url,
  "https://wa.me/6281234567890?text=halo%20kak",
)
expect(
  "URL encodes emoji & special",
  buildWaMeUrl("081234567890", "halo 🙏 & friends"),
  "https://wa.me/6281234567890?text=halo%20%F0%9F%99%8F%20%26%20friends",
)
expect("null phone → null", buildWaMeUrl(null, "x"), null)
expect("invalid phone → null", buildWaMeUrl("abc", "x"), null)

// Test rule matching using the REAL shared helper (lib/similarity-rule.ts is
// pure / DB-free, so it can be imported directly here).
console.log("\n[similarity-rule] ruleMatches logic (smoke)")

expect(
  "PER_CHAPTER exact",
  ruleMatches({ ruleType: "PER_CHAPTER", label: "Bab 1" }, { examType: null, chapter: "Bab 1" }),
  true,
)
expect(
  "PER_CHAPTER case insensitive",
  ruleMatches({ ruleType: "PER_CHAPTER", label: "BAB 1" }, { examType: null, chapter: "bab 1" }),
  true,
)
expect(
  "PER_CHAPTER mismatch",
  ruleMatches({ ruleType: "PER_CHAPTER", label: "Bab 2" }, { examType: null, chapter: "Bab 1" }),
  false,
)
expect(
  "PER_CHAPTER null chapter",
  ruleMatches({ ruleType: "PER_CHAPTER", label: "Bab 1" }, { examType: "PROPOSAL_DEFENSE", chapter: null }),
  false,
)
expect(
  "PER_EXAM matches Proposal label",
  ruleMatches({ ruleType: "PER_EXAM", label: "Proposal" }, { examType: "PROPOSAL_DEFENSE", chapter: null }),
  true,
)
expect(
  "PER_EXAM matches Hasil label",
  ruleMatches({ ruleType: "PER_EXAM", label: "Hasil" }, { examType: "RESULTS_DEFENSE", chapter: null }),
  false, // 'results' vs 'hasil' — not auto-translated; expected mismatch
)
expect(
  "PER_EXAM raw enum match",
  ruleMatches({ ruleType: "PER_EXAM", label: "FINAL_DEFENSE" }, { examType: "FINAL_DEFENSE", chapter: null }),
  true,
)
expect(
  "PER_EXAM null exam type",
  ruleMatches({ ruleType: "PER_EXAM", label: "Proposal" }, { examType: null, chapter: "Bab 1" }),
  false,
)

console.log("\n[similarity-rule] decideSubmissionStatus")
const rulesChapter = [{ ruleType: "PER_CHAPTER" as const, label: "Bab 1", maxPercentage: 25 }]
expect(
  "score below threshold → REVIEWED",
  decideSubmissionStatus(rulesChapter, { examType: null, chapter: "Bab 1" }, 20).status,
  "REVIEWED",
)
expect(
  "score above threshold → FLAGGED",
  decideSubmissionStatus(rulesChapter, { examType: null, chapter: "Bab 1" }, 30).status,
  "FLAGGED",
)
expect(
  "score equal threshold → REVIEWED (strict >)",
  decideSubmissionStatus(rulesChapter, { examType: null, chapter: "Bab 1" }, 25).status,
  "REVIEWED",
)
expect(
  "no matching rule → REVIEWED + null threshold",
  decideSubmissionStatus(rulesChapter, { examType: null, chapter: "Bab 2" }, 90),
  { status: "REVIEWED", matchedRule: null, threshold: null },
)
expect(
  "matched threshold reported",
  decideSubmissionStatus(rulesChapter, { examType: null, chapter: "Bab 1" }, 30).threshold,
  25,
)

console.log("\n" + "=".repeat(60))
if (failed === 0) {
  console.log(`✓ ALL ${passed} TESTS PASSED`)
  process.exit(0)
} else {
  console.log(`✗ ${failed} FAILED, ${passed} PASSED\n`)
  for (const f of failures) console.log(f)
  process.exit(1)
}
