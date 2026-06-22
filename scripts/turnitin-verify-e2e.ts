/**
 * Verifikasi E2E lewat HTTP server nyata (Next.js): student auto-check →
 * worker pipeline → instructor adjust. Membersihkan data test di akhir.
 * Prasyarat: dev server jalan di http://localhost:3000.
 *   npx tsx scripts/turnitin-verify-e2e.ts
 */
import { loadEnv } from "../lib/turnitin/load-env"

loadEnv()

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000"

async function main(): Promise<void> {
  const path = await import("path")
  const { mkdir, writeFile, rm } = await import("fs/promises")
  const { prisma } = await import("../lib/prisma")
  const { createToken } = await import("../lib/auth/verify-token")
  const { claimNextJob } = await import("../lib/turnitin/queue")
  const { processJob } = await import("../lib/turnitin/process-job")
  const { loadTurnitinConfig } = await import("../lib/turnitin/config")
  const { SUBMISSIONS_DIR, UPLOAD_DIR } = await import("../lib/upload")

  const student = await prisma.user.findFirst({
    where: { role: "STUDENT", instructorId: { not: null } },
    select: { id: true, name: true, instructorId: true },
  })
  if (!student?.instructorId) throw new Error("Tidak ada STUDENT dengan instruktur ter-assign.")
  const studentToken = await createToken(student.id, "STUDENT")
  const instructorToken = await createToken(student.instructorId, "INSTRUCTOR")
  console.log("Student:", student.name)

  await mkdir(SUBMISSIONS_DIR, { recursive: true })
  const fileName = `e2e-${Date.now()}.txt`
  const abs = path.join(SUBMISSIONS_DIR, fileName)
  await writeFile(
    abs,
    "End to end verification document submitted through the live HTTP API to confirm the student " +
      "trigger, worker pipeline, and instructor score adjustment all function together correctly.",
    "utf8",
  )
  const rel = path.relative(UPLOAD_DIR, abs).replace(/\\/g, "/")
  const sub = await prisma.submission.create({
    data: {
      userId: student.id,
      documentTitle: "E2E Verify Doc",
      documentUrl: rel,
      fileName,
      fileSize: 1,
      fileMimeType: "text/plain",
      status: "PENDING",
    },
  })
  console.log("Submission:", sub.id)

  try {
    // 1) STUDENT memicu auto-check lewat HTTP (seperti klik tombol "Cek Otomatis")
    const r1 = await fetch(`${BASE}/api/submissions/${sub.id}/auto-check`, {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    console.log(`\n[1] POST auto-check → ${r1.status}:`, (await r1.text()).slice(0, 200))

    // 2) Worker pipeline memproses job
    const job = await claimNextJob()
    if (!job) throw new Error("Tidak ada job untuk diproses (auto-check gagal?)")
    if (job.submissionId !== sub.id) console.log("  (catatan: job lain di antrian)")
    const cfg = loadTurnitinConfig()
    cfg.maxWaitMs = 4 * 60_000
    cfg.pollIntervalMs = 15_000
    console.log("[2] processJob...")
    const res = await processJob(job, cfg)
    console.log("    →", JSON.stringify(res))
    const afterAuto = await prisma.submission.findUnique({
      where: { id: sub.id },
      select: { status: true, similarityScore: true },
    })
    console.log("    Submission setelah bot:", JSON.stringify(afterAuto))

    // 3) INSTRUCTOR menyesuaikan hasil lewat HTTP
    const r3 = await fetch(`${BASE}/api/submissions/${sub.id}/adjust`, {
      method: "POST",
      headers: { Authorization: `Bearer ${instructorToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ similarity: 99, status: "FLAGGED", reason: "E2E: uji override + audit" }),
    })
    console.log(`\n[3] POST adjust → ${r3.status}:`, (await r3.text()).slice(0, 200))
    const afterAdjust = await prisma.submission.findUnique({
      where: { id: sub.id },
      select: {
        status: true,
        similarityScore: true,
        turnitinRawScore: true,
        scoreAdjustedByName: true,
        scoreAdjustmentReason: true,
      },
    })
    console.log("\n=== HASIL AKHIR ===")
    console.log(JSON.stringify(afterAdjust, null, 2))
    const ok =
      afterAdjust?.similarityScore === 99 &&
      afterAdjust?.turnitinRawScore === 0 &&
      afterAdjust?.status === "FLAGGED"
    console.log(ok ? "\n✅ E2E PASS (skor override=99, asli dipreservasi=0, FLAGGED)" : "\n⚠️ Periksa hasil di atas")
  } finally {
    await prisma.submission.delete({ where: { id: sub.id } }).catch(() => {})
    await rm(abs, { force: true }).catch(() => {})
    await prisma.$disconnect().catch(() => {})
    console.log("(cleanup selesai)")
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
