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
}

function num(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
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
  }
}

export function assertCredentials(cfg: TurnitinConfig): void {
  if (!cfg.email || !cfg.password) {
    throw new Error(
      "TURNITIN_EMAIL / TURNITIN_PASSWORD belum di-set. Isi di .env lalu jalankan ulang.",
    )
  }
}
