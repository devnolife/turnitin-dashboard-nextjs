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
  const { openSession, ensureLoggedIn } = await import("../lib/turnitin/session")
  const { countInboxPapers } = await import("../lib/turnitin/inbox-count")
  const { writeInboxStatus, computeLevel } = await import("../lib/turnitin/inbox-status")

  const cfg = loadTurnitinConfig()
  console.log("[turnitin-worker] mulai. Base URL:", cfg.baseUrl, "| headless:", cfg.headless)

  // Snapshot jumlah paper inbox Turnitin → file JSON (dibaca API admin). Best-effort:
  // tidak pernah menggagalkan/menghentikan pemrosesan job. Dipakai untuk deteksi
  // "inbox hampir penuh" (akun limit ~25) lalu memperingatkan admin.
  let lastInboxCheck = 0
  const INBOX_CHECK_INTERVAL_MS = 10 * 60_000 // saat idle, paling sering tiap 10 menit
  const refreshInboxStatus = async (force: boolean) => {
    if (!force && Date.now() - lastInboxCheck < INBOX_CHECK_INTERVAL_MS) return
    lastInboxCheck = Date.now()
    const warnAt = Math.max(1, Math.floor(cfg.inboxCapacity * cfg.inboxWarnRatio))
    const session = await openSession(cfg)
    try {
      await ensureLoggedIn(session, cfg)
      const count = await countInboxPapers(session.page, cfg)
      await writeInboxStatus({
        count,
        capacity: cfg.inboxCapacity,
        warnAt,
        level: computeLevel(count, cfg.inboxCapacity, warnAt),
        checkedAt: new Date().toISOString(),
      })
      console.log(`[turnitin-worker] inbox Turnitin: ${count}/${cfg.inboxCapacity} paper`)
    } catch (e) {
      await writeInboxStatus({
        count: -1,
        capacity: cfg.inboxCapacity,
        warnAt,
        level: "unknown",
        checkedAt: new Date().toISOString(),
        note: e instanceof Error ? e.message.slice(0, 200) : String(e),
      })
    } finally {
      await session.close()
    }
  }

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
      // Idle: perbarui status inbox sesekali (rate-limited internal).
      await refreshInboxStatus(false)
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

    // Setelah tiap job, perbarui jumlah inbox (paper baru bertambah → kuota berkurang).
    await refreshInboxStatus(true)

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
