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

/** Ambil paper id (10 digit) dari teks satu baris inbox; null bila tak ada. */
function paperIdOf(rowText: string): number | null {
  const m = rowText.match(/\b(\d{10})\b/)
  return m ? Number(m[1]) : null
}

/** Baca paper id dari beberapa baris data teratas (urut tampilan saat ini). */
async function topPaperIds(page: Page, limit: number): Promise<number[]> {
  const rows = page.locator("table tr")
  const n = await rows.count().catch(() => 0)
  const ids: number[] = []
  for (let i = 0; i < n && ids.length < limit; i++) {
    const t = (await rows.nth(i).innerText().catch(() => "")).replace(/\s+/g, " ")
    const id = paperIdOf(t)
    if (id != null) ids.push(id)
  }
  return ids
}

/**
 * Urutkan inbox dari paper id TERBESAR (paling baru) ke terkecil agar submission
 * yang baru dikirim selalu berada di halaman 1 — lepas dari paginasi & sort default.
 * Header "Paper ID" bersifat toggle (klik=asc, klik lagi=desc): kita klik lalu cek
 * arah dari dua baris teratas; bila masih asc, klik sekali lagi.
 */
async function sortNewestFirst(page: Page): Promise<void> {
  const header = () => page.locator(QUICK_SUBMIT.paperIdSortHeader).first()
  if ((await header().count().catch(() => 0)) === 0) return

  for (let click = 0; click < 2; click++) {
    await header().click({ timeout: 20_000 }).catch(() => {})
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(800)
    const ids = await topPaperIds(page, 3)
    if (ids.length >= 2 && ids[0] > ids[1]) return // sudah descending
  }
}

/**
 * Cari baris yang mengandung `key` (paper id eksak bila tersedia, jika tidak token
 * judul) lalu baca % similarity-nya. Mengembalikan null bila baris belum ada atau
 * report masih diproses (elemen persentase belum muncul).
 */
async function readSimilarityForKey(page: Page, key: string): Promise<number | null> {
  const row = page.locator(`tr:has-text(${JSON.stringify(key)})`).first()
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
 * Cek apakah dokumen dengan judul mengandung `titleToken` SUDAH ada di inbox
 * Quick Submit. Dipakai untuk idempotensi: bila attempt sebelumnya sempat submit
 * (lalu worker mati / lock-nya basi), jangan submit ulang—cukup lanjut menunggu
 * report. Mencegah pengiriman dokumen ganda ke Turnitin.
 *
 * Mengurutkan inbox terbaru-dulu lebih dulu supaya submission baru pasti terlihat
 * di halaman 1 (tanpa ini, paper bisa terkubur di paginasi dan keliru dianggap
 * "belum ada"). Melempar error (UNKNOWN → transient/retryable) bila inbox gagal
 * dimuat, agar kegagalan cek TIDAK pernah diartikan sebagai "belum ada".
 */
export interface InboxMatch {
  found: boolean
  /** Paper id (10 digit) dari baris yang cocok, untuk unduh report saat resume. */
  paperId: string | null
}

export async function inboxHasSubmission(
  page: Page,
  cfg: TurnitinConfig,
  titleToken: string,
): Promise<InboxMatch> {
  await openInbox(page, cfg)
  const inboxLoaded = await page
    .locator(QUICK_SUBMIT.quickSubmitTab)
    .first()
    .isVisible()
    .catch(() => false)
  if (!inboxLoaded) {
    throw new TurnitinReportError(
      "Inbox Quick Submit gagal dimuat saat cek idempotensi.",
      "UNKNOWN",
    )
  }
  await sortNewestFirst(page)
  const row = page.locator(`tr:has-text(${JSON.stringify(titleToken)})`).first()
  if ((await row.count().catch(() => 0)) === 0) return { found: false, paperId: null }
  const text = (await row.innerText().catch(() => "")).replace(/\s+/g, " ")
  const m = text.match(/\b(\d{10})\b/)
  return { found: true, paperId: m ? m[1] : null }
}

/**
 * Poll inbox sampai similarity untuk paper muncul, dalam batas cfg.maxWaitMs.
 * Pencocokan baris memakai `paperId` (presisi, dari digital receipt) bila ada,
 * jika tidak memakai `titleToken`. Setiap iterasi membuka ulang inbox & mengurutkan
 * terbaru-dulu agar baris target selalu ada di halaman 1. Melempar
 * TurnitinReportError(TIMEOUT) bila lewat batas.
 */
export async function waitForReport(
  page: Page,
  cfg: TurnitinConfig,
  titleToken: string,
  paperId: string | null = null,
): Promise<ReportResult> {
  const deadline = Date.now() + cfg.maxWaitMs
  const key = paperId ?? titleToken

  while (Date.now() < deadline) {
    await openInbox(page, cfg)
    await sortNewestFirst(page)
    const score = await readSimilarityForKey(page, key)
    if (score != null) {
      return { similarity: score, reportPdf: null }
    }
    await page.waitForTimeout(cfg.pollIntervalMs)
  }

  throw new TurnitinReportError(
    `Report tidak selesai dalam ${Math.round(cfg.maxWaitMs / 60_000)} menit.`,
    "TIMEOUT",
  )
}
