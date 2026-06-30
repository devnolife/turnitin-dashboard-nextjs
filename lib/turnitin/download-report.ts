import { readFile } from "fs/promises"
import type { BrowserContext, Locator, Page } from "playwright"
import { QUICK_SUBMIT, TURNITIN_PATHS } from "./selectors"
import { logger } from "@/lib/logger"
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
 *
 * Setiap titik kegagalan dicatat lewat `reason` (log `turnitin.report_capture_detail`)
 * supaya bisa didiagnosis tanpa menebak. Tunggu render pakai POLLING (bukan jeda
 * tetap) agar tahan terhadap Feedback Studio yang lambat saat CPU sibuk.
 */
export async function downloadSimilarityReport(
  page: Page,
  context: BrowserContext,
  cfg: TurnitinConfig,
  paperId: string,
): Promise<ReportCapture> {
  const result: ReportCapture = { reportPdf: null, integrityFlags: null }
  let reason = "ok"
  let viewer: Page | null = null
  try {
    await openInboxSorted(page, cfg)

    const row = page.locator(`tr:has-text(${JSON.stringify(paperId)})`).first()
    if ((await row.count().catch(() => 0)) === 0) {
      reason = "row_not_found"
      return result
    }

    const url = await extractViewerUrl(row)
    if (!url) {
      reason = "no_viewer_url"
      return result
    }

    // Buka laporan → popup Feedback Studio.
    try {
      const [popup] = await Promise.all([
        context.waitForEvent("page", { timeout: 30_000 }),
        page.evaluate((u) => window.open(u, "paper_viewer"), url),
      ])
      viewer = popup
    } catch {
      viewer = null
    }
    if (!viewer) {
      reason = "popup_failed"
      return result
    }
    await viewer.waitForLoadState("domcontentloaded", { timeout: 60_000 }).catch(() => {})
    // Jeda awal supaya shell SPA mulai render sebelum kita polling elemennya.
    await viewer.waitForTimeout(Math.min(cfg.reportRenderMs, 8_000))

    // (1) Baca Integrity Flags dari tab "Flags".
    result.integrityFlags = await readIntegrityFlags(viewer)

    // (2) Unduh "Similarity Report" — tunggu tombol Download muncul (poll).
    const downloadBtn = await waitForDownloadButton(viewer, cfg)
    if (!downloadBtn) {
      // Bedakan: viewer benar-benar kosong (flags juga null) vs hanya tombol belum ada.
      reason = result.integrityFlags == null ? "viewer_blank" : "download_btn_absent"
      return result
    }
    await downloadBtn.click({ timeout: 15_000 }).catch(() => {})

    // Menu Download memunculkan opsi: "Current View" (= PDF Similarity Report sesuai
    // tampilan saat ini, lengkap dengan highlight), "Digital Receipt", "Originally
    // Submitted File". CATATAN: TIDAK ada item literal "Similarity Report" — opsi yang
    // benar untuk PDF laporan similarity adalah "Current View".
    const menuItem = await waitForDownloadMenuItem(viewer)
    if (!menuItem) {
      reason = "download_menu_item_absent"
      return result
    }

    let download = null
    try {
      const [dl] = await Promise.all([
        viewer.waitForEvent("download", { timeout: 120_000 }),
        menuItem.click({ timeout: 15_000 }),
      ])
      download = dl
    } catch {
      download = null
    }
    if (!download) {
      reason = "download_event_timeout"
      return result
    }

    const filePath = await download.path().catch(() => null)
    if (!filePath) {
      reason = "download_no_path"
      return result
    }
    const buf = await readFile(filePath)
    if (buf.length > 1_000) {
      result.reportPdf = buf
      reason = "ok"
    } else {
      reason = `download_too_small(${buf.length})`
    }
    return result
  } catch (e) {
    reason = "exception:" + (e instanceof Error ? e.message.slice(0, 100) : String(e))
    return result
  } finally {
    logger.info("turnitin.report_capture_detail", {
      paperId,
      reason,
      captured: !!result.reportPdf,
      integrityFlags: result.integrityFlags,
    })
    if (viewer) await viewer.close().catch(() => {})
  }
}

/** Buka inbox Quick Submit & urutkan paper id terbesar (terbaru) di halaman 1. */
async function openInboxSorted(page: Page, cfg: TurnitinConfig): Promise<void> {
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
}

/** Ekstrak URL viewer dari baris inbox (onclick `window.open('...')`). */
async function extractViewerUrl(row: Locator): Promise<string | null> {
  const candidates = ["a.or-link", "td.or_report_cell a", "a[onclick*='window.open']"]
  for (const sel of candidates) {
    const onclick = await row.locator(sel).first().getAttribute("onclick").catch(() => null)
    const url = onclick?.match(/window\.open\('([^']+)'/)?.[1]
    if (url) return url.replace(/&amp;/g, "&")
  }
  return null
}

/**
 * Tunggu tombol "Download" Feedback Studio muncul & terlihat. Poll sampai
 * `reportRenderMs + 25s` karena FS bisa lambat render saat CPU sibuk.
 */
async function waitForDownloadButton(viewer: Page, cfg: TurnitinConfig): Promise<Locator | null> {
  const deadline = Date.now() + cfg.reportRenderMs + 25_000
  while (Date.now() < deadline) {
    const btn = viewer.getByRole("button", { name: /download/i }).first()
    if ((await btn.count().catch(() => 0)) > 0 && (await btn.isVisible().catch(() => false))) {
      return btn
    }
    await viewer.waitForTimeout(1_500)
  }
  return null
}

/** Tunggu item menu "Current View" (PDF Similarity Report) muncul setelah klik Download. */
async function waitForDownloadMenuItem(viewer: Page): Promise<Locator | null> {
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    const it = viewer.getByText(/current view/i).first()
    if ((await it.count().catch(() => 0)) > 0 && (await it.isVisible().catch(() => false))) {
      return it
    }
    await viewer.waitForTimeout(700)
  }
  return null
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
