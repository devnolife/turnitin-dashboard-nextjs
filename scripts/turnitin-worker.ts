/**
 * Worker otomasi Turnitin — proses berdiri sendiri (BUKAN bagian Next.js).
 *
 *   npm run turnitin:worker
 *
 * Loop: ambil 1 job dari antрian (DB) → submit ke Turnitin via Quick Submit →
 * tunggu report → simpan skor + PDF ke Submission. Serial (satu job sekaligus)
 * dengan jeda manusiawi antar job.
 *
 * Prasyarat: jalankan `npm run turnitin:bootstrap` dulu agar sesi login tersimpan.
 */
import { loadEnv } from "../lib/turnitin/load-env"

// Muat env SEBELUM modul apa pun yang mengkonstruksi PrismaClient.
loadEnv()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(): Promise<void> {
  // Import dinamis: dilakukan SETELAH loadEnv() agar DATABASE_URL sudah tersedia
  // saat PrismaClient dikonstruksi.
  const { loadTurnitinConfig } = await import("../lib/turnitin/config")
  const { claimNextJob } = await import("../lib/turnitin/queue")
  const { processJob } = await import("../lib/turnitin/process-job")
  const { prisma } = await import("../lib/prisma")

  const cfg = loadTurnitinConfig()
  console.log("[turnitin-worker] mulai. Base URL:", cfg.baseUrl, "| headless:", cfg.headless)

  let running = true
  const stop = (sig: string) => {
    console.log(`[turnitin-worker] ${sig} diterima, berhenti setelah job ini...`)
    running = false
  }
  process.on("SIGINT", () => stop("SIGINT"))
  process.on("SIGTERM", () => stop("SIGTERM"))

  while (running) {
    let job = null
    try {
      job = await claimNextJob()
    } catch (e) {
      console.error("[turnitin-worker] gagal mengambil job:", e)
      await sleep(cfg.pollIntervalMs)
      continue
    }

    if (!job) {
      await sleep(cfg.pollIntervalMs)
      continue
    }

    console.log(
      `[turnitin-worker] memproses job ${job.id} (submission ${job.submissionId}, attempt ${job.attempts})`,
    )
    try {
      const res = await processJob(job, cfg)
      console.log(`[turnitin-worker] job ${job.id} → ${res.status}${res.detail ? ` (${res.detail})` : ""}`)
    } catch (e) {
      console.error(`[turnitin-worker] job ${job.id} crash tak terduga:`, e)
    }

    await sleep(cfg.jobDelayMs) // pacing antar job
  }

  await prisma.$disconnect().catch(() => {})
  console.log("[turnitin-worker] berhenti.")
  process.exit(0)
}

main().catch((e) => {
  console.error("[turnitin-worker] fatal:", e)
  process.exit(1)
})
