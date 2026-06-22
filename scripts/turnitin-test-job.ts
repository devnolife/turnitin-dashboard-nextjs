/**
 * Test JALUR PRODUKSI penuh: buat Submission dummy → enqueue → worker pipeline
 * (claim → processJob → tulis skor ke Submission). Membersihkan data test di akhir.
 *   npx tsx scripts/turnitin-test-job.ts
 */
import { loadEnv } from "../lib/turnitin/load-env"

loadEnv()

async function main(): Promise<void> {
  const path = await import("path")
  const { mkdir, writeFile, rm } = await import("fs/promises")
  const { prisma } = await import("../lib/prisma")
  const { SUBMISSIONS_DIR, UPLOAD_DIR } = await import("../lib/upload")
  const { enqueueJob, claimNextJob, getLatestJob } = await import("../lib/turnitin/queue")
  const { processJob } = await import("../lib/turnitin/process-job")
  const { loadTurnitinConfig } = await import("../lib/turnitin/config")

  const student = await prisma.user.findFirst({ where: { role: "STUDENT" }, select: { id: true, name: true } })
  if (!student) {
    console.error("Tidak ada user STUDENT untuk test.")
    process.exit(1)
  }

  // Buat file dokumen test di uploads/submissions/
  await mkdir(SUBMISSIONS_DIR, { recursive: true })
  const fileName = `jobtest-${Date.now()}.txt`
  const absFile = path.join(SUBMISSIONS_DIR, fileName)
  await writeFile(
    absFile,
    "This is a full pipeline integration test document submitted automatically through the worker queue. " +
      "It verifies that the Turnitin automation worker can claim a job, log in, submit via Quick Submit, " +
      "retrieve the similarity score, and persist the result back to the submission record in the database.",
    "utf8",
  )
  const relPath = path.relative(UPLOAD_DIR, absFile).replace(/\\/g, "/")

  const submission = await prisma.submission.create({
    data: {
      userId: student.id,
      documentTitle: "Pipeline Test Document",
      documentUrl: relPath,
      fileName,
      fileSize: 1,
      fileMimeType: "text/plain",
      status: "PROCESSING",
    },
  })
  console.log("Created submission:", submission.id, "| student:", student.name)

  try {
    await enqueueJob(submission.id)
    const job = await claimNextJob()
    if (!job) throw new Error("claimNextJob mengembalikan null")
    console.log("Claimed job:", job.id, "→ processing (maks ~4 menit)...")

    const cfg = loadTurnitinConfig()
    cfg.maxWaitMs = 4 * 60_000
    cfg.pollIntervalMs = 15_000

    const res = await processJob(job, cfg)
    console.log("processJob result:", JSON.stringify(res))

    const updated = await prisma.submission.findUnique({
      where: { id: submission.id },
      select: { status: true, similarityScore: true, autoCheckError: true, autoCheckedAt: true },
    })
    const finalJob = await getLatestJob(submission.id)
    console.log("\n=== HASIL ===")
    console.log("Submission.status        :", updated?.status)
    console.log("Submission.similarityScore:", updated?.similarityScore)
    console.log("Submission.autoCheckError :", updated?.autoCheckError)
    console.log("Job.status               :", finalJob?.status)
  } catch (e) {
    console.error("TEST ERROR:", e instanceof Error ? `${e.name}: ${e.message}` : e)
  } finally {
    // Bersihkan data test.
    await prisma.submission.delete({ where: { id: submission.id } }).catch(() => {})
    await rm(absFile, { force: true }).catch(() => {})
    await prisma.$disconnect().catch(() => {})
    console.log("\n(cleanup: submission + job + file dihapus)")
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
