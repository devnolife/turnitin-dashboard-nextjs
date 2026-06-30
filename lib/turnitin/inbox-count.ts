import type { Page } from "playwright"
import { QUICK_SUBMIT, TURNITIN_PATHS } from "./selectors"
import type { TurnitinConfig } from "./config"

/**
 * Hitung jumlah paper di inbox Quick Submit. Setiap baris paper mengandung satu
 * paper id 10 digit yang unik, jadi kita kumpulkan id unik dari SEMUA halaman
 * (inbox ber-paginasi) lalu hitung jumlahnya.
 *
 * Best-effort: bila inbox gagal dimuat, lempar Error supaya pemanggil bisa
 * memutuskan (worker hanya mencatat note, tidak menggagalkan job).
 */
export async function countInboxPapers(page: Page, cfg: TurnitinConfig): Promise<number> {
  await page
    .goto(cfg.baseUrl + TURNITIN_PATHS.home, { waitUntil: "domcontentloaded", timeout: 45_000 })
    .catch(() => {})
  await page.locator(QUICK_SUBMIT.quickSubmitTab).first().click({ timeout: 30_000 }).catch(() => {})
  await page.waitForLoadState("networkidle").catch(() => {})

  const visible = await page
    .locator(QUICK_SUBMIT.quickSubmitTab)
    .first()
    .isVisible()
    .catch(() => false)
  if (!visible) {
    throw new Error("Inbox Quick Submit gagal dimuat saat menghitung paper.")
  }

  const seen = new Set<string>()
  await collectPageIds(page, seen)

  // Telusuri halaman berikutnya bila ada paginasi (maks 20 halaman sebagai pengaman).
  for (let guard = 0; guard < 20; guard++) {
    const next = page
      .locator('a[href*="o_page"], a:has-text("Next"), a[title="Next"], .pagination a:has-text(">")')
      .first()
    if ((await next.count().catch(() => 0)) === 0) break
    const cls = (await next.getAttribute("class").catch(() => "")) ?? ""
    const disabled =
      cls.includes("disabled") || !(await next.isVisible().catch(() => false))
    if (disabled) break

    const before = seen.size
    await next.click({ timeout: 15_000 }).catch(() => {})
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(600)
    await collectPageIds(page, seen)
    if (seen.size === before) break // tidak ada id baru → berhenti (hindari loop)
  }

  return seen.size
}

/** Kumpulkan semua paper id (10 digit) dari baris-baris di halaman saat ini. */
async function collectPageIds(page: Page, into: Set<string>): Promise<void> {
  const rows = page.locator("table tr")
  const n = await rows.count().catch(() => 0)
  for (let i = 0; i < n; i++) {
    const t = (await rows.nth(i).innerText().catch(() => "")).replace(/\s+/g, " ")
    const m = t.match(/\b(\d{10})\b/)
    if (m) into.add(m[1])
  }
}
