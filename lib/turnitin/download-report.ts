import { readFile } from "fs/promises"
import type { BrowserContext, Page } from "playwright"
import { QUICK_SUBMIT, TURNITIN_PATHS } from "./selectors"
import type { TurnitinConfig } from "./config"

export interface ReportCapture {
  /** PDF Similarity Report (null bila gagal/headless). */
  reportPdf: Buffer | null
  /** Jumlah Integrity Flags (0 = bersih, null = tak terbaca/headless). */
  integrityFlags: number | null
}

/**
 * Buka Feedback Studio untuk satu paper lalu ambil: (1) jumlah Integrity Flags,
 * (2) PDF "Similarity Report".
 *
 * PENTING: Feedback Studio (ev.turnitin.com) adalah SPA yang TIDAK render di mode
 * headless (layar kosong) — jadi fungsi ini hanya berhasil bila browser HEADED
 * (TURNITIN_HEADLESS=false). Best-effort: setiap field bisa null bila gagal,
 * supaya skor tetap tersimpan walau PDF/flag tidak didapat.
 */
export async function downloadSimilarityReport(
  page: Page,
  context: BrowserContext,
  cfg: TurnitinConfig,
  paperId: string,
): Promise<ReportCapture> {
  const result: ReportCapture = { reportPdf: null, integrityFlags: null }
  let viewer: Page | null = null
  try {
    // Pastikan di inbox & urut terbaru-dulu agar baris paper ada di halaman 1.
    await page
      .goto(cfg.baseUrl + TURNITIN_PATHS.home, { waitUntil: "domcontentloaded", timeout: 45_000 })
      .catch(() => {})
    await page.locator(QUICK_SUBMIT.quickSubmitTab).first().click({ timeout: 30_000 }).catch(() => {})
    await page.waitForLoadState("networkidle").catch(() => {})
    for (let c = 0; c < 2; c++) {
      await page.locator(QUICK_SUBMIT.paperIdSortHeader).first().click({ timeout: 20_000 }).catch(() => {})
      await page.waitForLoadState("networkidle").catch(() => {})
      await page.waitForTimeout(800)
      const ids = await topPaperIds(page, 3)
      if (ids.length >= 2 && ids[0] > ids[1]) break
    }

    const row = page.locator(`tr:has-text(${JSON.stringify(paperId)})`).first()
    if ((await row.count().catch(() => 0)) === 0) return result

    const onclick = await row.locator("a.or-link").first().getAttribute("onclick").catch(() => null)
    const url = onclick?.match(/window\.open\('([^']+)'/)?.[1]?.replace(/&amp;/g, "&")
    if (!url) return result

    // Buka laporan → popup Feedback Studio.
    const [popup] = await Promise.all([
      context.waitForEvent("page", { timeout: 30_000 }),
      page.evaluate((u) => window.open(u, "paper_viewer"), url),
    ])
    viewer = popup
    await viewer.waitForLoadState("domcontentloaded", { timeout: 60_000 }).catch(() => {})
    // Beri waktu SPA Feedback Studio render penuh sebelum UI bisa diklik.
    await viewer.waitForTimeout(cfg.reportRenderMs)

    // (1) Baca Integrity Flags dari tab "Flags".
    result.integrityFlags = await readIntegrityFlags(viewer)

    // (2) Unduh "Similarity Report".
    const downloadBtn = viewer.getByRole("button", { name: /download/i }).first()
    if ((await downloadBtn.count().catch(() => 0)) === 0) return result // headless → blank
    await downloadBtn.click({ timeout: 15_000 }).catch(() => {})
    await viewer.waitForTimeout(2_000)

    const simReport = viewer.getByText(/similarity report/i).first()
    if ((await simReport.count().catch(() => 0)) === 0) return result

    const [download] = await Promise.all([
      viewer.waitForEvent("download", { timeout: 120_000 }),
      simReport.click({ timeout: 15_000 }),
    ])
    const filePath = await download.path().catch(() => null)
    if (filePath) {
      const buf = await readFile(filePath)
      if (buf.length > 1_000) result.reportPdf = buf
    }
    return result
  } catch {
    return result
  } finally {
    if (viewer) await viewer.close().catch(() => {})
  }
}

/**
 * Baca jumlah Integrity Flags dari panel "Flags" Feedback Studio. Teks-nya berupa
 * "N Integrity Flags for Review" (mis. "0 Integrity Flags for Review").
 */
async function readIntegrityFlags(viewer: Page): Promise<number | null> {
  try {
    const flagsTab = viewer.getByText(/^Flags$/i).first()
    if (await flagsTab.count().catch(() => 0)) {
      await flagsTab.click({ timeout: 8_000 }).catch(() => {})
    }
    // Tunggu teks flag benar-benar muncul (panel Flags butuh waktu render di FS),
    // bukan jeda tetap yang sering belum siap.
    const el = viewer.getByText(/Integrity Flags?\s+for Review/i).first()
    await el.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {})
    if ((await el.count().catch(() => 0)) === 0) return null
    const txt = (await el.textContent().catch(() => "")) || ""
    const m = txt.match(/(\d+)\s*Integrity Flags?/i)
    return m ? Number(m[1]) : null
  } catch {
    return null
  }
}

async function topPaperIds(page: Page, limit: number): Promise<number[]> {
  const rows = page.locator("table tr")
  const n = await rows.count().catch(() => 0)
  const ids: number[] = []
  for (let i = 0; i < n && ids.length < limit; i++) {
    const t = (await rows.nth(i).innerText().catch(() => "")).replace(/\s+/g, " ")
    const m = t.match(/\b(\d{10})\b/)
    if (m) ids.push(Number(m[1]))
  }
  return ids
}

