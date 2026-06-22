import type { Page } from "playwright"
import { QUICK_SUBMIT, TURNITIN_PATHS } from "./selectors"
import type { TurnitinConfig } from "./config"

export type ReportErrorCode = "TIMEOUT" | "SELECTOR" | "UNKNOWN"

export class TurnitinReportError extends Error {
  code: ReportErrorCode
  constructor(message: string, code: ReportErrorCode = "UNKNOWN") {
    super(message)
    this.name = "TurnitinReportError"
    this.code = code
  }
}

export interface ReportResult {
  /** Persentase similarity 0..100. */
  similarity: number
  /** PDF report — null untuk Fase 1 (unduh PDF = Fase 2). */
  reportPdf: Buffer | null
}

async function openInbox(page: Page, cfg: TurnitinConfig): Promise<void> {
  await page
    .goto(cfg.baseUrl + TURNITIN_PATHS.home, { waitUntil: "domcontentloaded", timeout: 45_000 })
    .catch(() => {})
  await page.locator(QUICK_SUBMIT.quickSubmitTab).first().click({ timeout: 30_000 }).catch(() => {})
  await page.waitForLoadState("networkidle").catch(() => {})
}

/**
 * Baca similarity untuk baris paper yang judulnya mengandung `titleToken`.
 * Mengembalikan null bila baris belum ada atau report masih diproses
 * (similarity link "or-link" belum muncul).
 */
async function readSimilarityForTitle(page: Page, titleToken: string): Promise<number | null> {
  const row = page.locator(`tr:has-text(${JSON.stringify(titleToken)})`).first()
  if ((await row.count().catch(() => 0)) === 0) return null
  const orText = await row
    .locator(QUICK_SUBMIT.originalityLink)
    .first()
    .textContent()
    .catch(() => null)
  if (!orText) return null
  const m = orText.match(/(\d{1,3})\s*%/)
  if (!m) return null
  const v = Number(m[1])
  return Number.isFinite(v) && v >= 0 && v <= 100 ? v : null
}

/**
 * Poll inbox sampai similarity untuk paper (dicocokkan via `titleToken`) muncul,
 * dalam batas cfg.maxWaitMs. Melempar TurnitinReportError(TIMEOUT) bila lewat.
 */
export async function waitForReport(
  page: Page,
  cfg: TurnitinConfig,
  titleToken: string,
): Promise<ReportResult> {
  const deadline = Date.now() + cfg.maxWaitMs
  await openInbox(page, cfg)

  while (Date.now() < deadline) {
    const score = await readSimilarityForTitle(page, titleToken)
    if (score != null) {
      return { similarity: score, reportPdf: null }
    }
    await page.waitForTimeout(cfg.pollIntervalMs)
    await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {})
    await page.waitForLoadState("networkidle").catch(() => {})
  }

  throw new TurnitinReportError(
    `Report tidak selesai dalam ${Math.round(cfg.maxWaitMs / 60_000)} menit.`,
    "TIMEOUT",
  )
}
