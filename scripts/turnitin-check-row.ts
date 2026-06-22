/**
 * Diagnostik: tampilkan baris inbox untuk token tertentu + isi sel similarity.
 *   npx tsx scripts/turnitin-check-row.ts "#t027085"
 */
import { loadEnv } from "../lib/turnitin/load-env"

loadEnv()

import { existsSync } from "fs"
import { chromium } from "playwright"
import { loadTurnitinConfig } from "../lib/turnitin/config"
import { TURNITIN_PATHS, QUICK_SUBMIT } from "../lib/turnitin/selectors"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async function main(): Promise<void> {
  const token = process.argv[2] || "#t027085"
  const cfg = loadTurnitinConfig()
  if (!existsSync(cfg.statePath)) {
    console.error("no session")
    process.exit(1)
  }
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ storageState: cfg.statePath, userAgent: UA })
  const page = await ctx.newPage()
  page.setDefaultTimeout(45_000)
  try {
    await page.goto(cfg.baseUrl + TURNITIN_PATHS.home, { waitUntil: "domcontentloaded" })
    await page.locator(QUICK_SUBMIT.quickSubmitTab).first().click()
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(1500)

    const row = page.locator(`tr:has-text(${JSON.stringify(token)})`).first()
    const count = await row.count()
    console.log("rows matched:", count)
    if (count > 0) {
      console.log("ROW TEXT:", (await row.innerText().catch(() => "")).replace(/\s+/g, " ").trim())
      const orCell = row.locator("td.or_report_cell").first()
      console.log("OR CELL HTML:", (await orCell.innerHTML().catch(() => "")).replace(/\s+/g, " ").trim().slice(0, 600))
      const orLink = row.locator(QUICK_SUBMIT.originalityLink).first()
      console.log("OR-LINK text:", await orLink.textContent().catch(() => null))
      console.log("OR-LINK count:", await row.locator(QUICK_SUBMIT.originalityLink).count())
    }
  } catch (e) {
    console.error("err:", e)
  } finally {
    await ctx.close().catch(() => {})
    await browser.close().catch(() => {})
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
