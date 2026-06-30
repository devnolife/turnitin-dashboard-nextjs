/**
 * Konfigurasi otomasi Turnitin dari environment variables.
 * Dipakai oleh worker (`scripts/turnitin-worker.ts`) dan bootstrap.
 */

export interface TurnitinConfig {
  email: string
  password: string
  baseUrl: string
  statePath: string
  headless: boolean
  maxWaitMs: number
  pollIntervalMs: number
  jobDelayMs: number
  /** Unduh PDF Similarity Report dari Feedback Studio (butuh mode headed). */
  downloadReport: boolean
  /** Jeda menunggu SPA Feedback Studio render sebelum klik Download (ms). */
  reportRenderMs: number
  /** Kapasitas maksimum paper di inbox Quick Submit (akun limit, default 25). */
  inboxCapacity: number
  /** Ambang peringatan sebagai rasio kapasitas (0..1, default 0.8 = 80%). */
  inboxWarnRatio: number
}

function num(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Parse rasio 0..1 (mis. 0.8). Di luar rentang → fallback. */
function ratio(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : fallback
}

export function loadTurnitinConfig(): TurnitinConfig {
  return {
    email: process.env.TURNITIN_EMAIL ?? "",
    password: process.env.TURNITIN_PASSWORD ?? "",
    baseUrl: (process.env.TURNITIN_BASE_URL ?? "https://www.turnitin.com").replace(/\/+$/, ""),
    statePath: process.env.TURNITIN_STATE_PATH ?? "uploads/.turnitin/state.json",
    headless: (process.env.TURNITIN_HEADLESS ?? "true") !== "false",
    maxWaitMs: num(process.env.TURNITIN_MAX_WAIT_MIN, 15) * 60_000,
    pollIntervalMs: num(process.env.TURNITIN_POLL_INTERVAL_SEC, 30) * 1_000,
    jobDelayMs: num(process.env.TURNITIN_JOB_DELAY_SEC, 10) * 1_000,
    downloadReport: (process.env.TURNITIN_DOWNLOAD_REPORT ?? "true") !== "false",
    reportRenderMs: num(process.env.TURNITIN_REPORT_RENDER_SEC, 16) * 1_000,
    inboxCapacity: num(process.env.TURNITIN_INBOX_CAPACITY, 25),
    inboxWarnRatio: ratio(process.env.TURNITIN_INBOX_WARN_RATIO, 0.8),
  }
}

export function assertCredentials(cfg: TurnitinConfig): void {
  if (!cfg.email || !cfg.password) {
    throw new Error(
      "TURNITIN_EMAIL / TURNITIN_PASSWORD belum di-set. Isi di .env lalu jalankan ulang.",
    )
  }
}
