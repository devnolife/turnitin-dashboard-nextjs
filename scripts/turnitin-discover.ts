/**
 * Discovery run — login Turnitin sekali (headless) untuk MEMETAKAN DOM asli
 * (selector login, halaman pasca-login, Quick Submit) + simpan sesi bila berhasil.
 *
 *   npx tsx scripts/turnitin-discover.ts
 *
 * Artefak (screenshot .png, .html, daftar elemen) → uploads/.turnitin/discover/.
 * TIDAK pernah mencetak password ke log.
 */
import { loadEnv } from "../lib/turnitin/load-env"

loadEnv()

import path from "path"
import { mkdir, writeFile } from "fs/promises"
import { chromium, type Page, type BrowserContext } from "playwright"
import { loadTurnitinConfig } from "../lib/turnitin/config"
import { saveState } from "../lib/turnitin/session"

const OUT = path.resolve(process.cwd(), "uploads/.turnitin/discover")
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async function snapshot(page: Page, label: string): Promise<void> {
  await mkdir(OUT, { recursive: true })
  await page.screenshot({ path: path.join(OUT, `${label}.png`), fullPage: true }).catch(() => {})
  const html = await page.content().catch(() => "")
  await writeFile(path.join(OUT, `${label}.html`), html).catch(() => {})

  const info = await page
    .evaluate(() => {
      const attrs = (el: Element) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type"),
        name: el.getAttribute("name"),
        id: (el as HTMLElement).id || null,
        placeholder: el.getAttribute("placeholder"),
        text: ((el as HTMLElement).innerText || "").trim().slice(0, 60) || null,
        href: el.getAttribute("href"),
      })
      const q = (sel: string) => Array.from(document.querySelectorAll(sel))
      return {
        url: location.href,
        title: document.title,
        bodyText: (document.body?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 400),
        inputs: q("input, textarea, select").map(attrs),
        buttons: q("button, input[type=submit], input[type=button], a[role=button]").map(attrs),
        links: q("a")
          .map(attrs)
          .filter((a) => a.text)
          .slice(0, 50),
        iframes: q("iframe").map((f) => f.getAttribute("src")),
      }
    })
    .catch(() => null)

  console.log(`\n===== ${label} =====`)
  if (info) {
    console.log("URL  :", info.url)
    console.log("TITLE:", info.title)
    console.log("BODY :", info.bodyText)
    console.log("INPUTS :", JSON.stringify(info.inputs))
    console.log("BUTTONS:", JSON.stringify(info.buttons))
    console.log("IFRAMES:", JSON.stringify(info.iframes))
    console.log("LINKS  :", JSON.stringify(info.links))
  }
}

async function main(): Promise<void> {
  const cfg = loadTurnitinConfig()
  if (!cfg.email || !cfg.password) {
    console.error("Set TURNITIN_EMAIL & TURNITIN_PASSWORD di .env dulu.")
    process.exit(1)
  }
  console.log("Base URL:", cfg.baseUrl, "| email:", cfg.email)

  const browser = await chromium.launch({ headless: true })
  const ctx: BrowserContext = await browser.newContext({
    userAgent: UA,
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
  })
  const page = await ctx.newPage()
  page.setDefaultTimeout(45_000)

  const emailSel = "input[type=email], input[name=email], #email, input[name=username]"
  const passSel = "input[type=password], input[name=user_password], #password"

  try {
    await page
      .goto(cfg.baseUrl + "/login_page.asp?lang=en_us", { waitUntil: "domcontentloaded" })
      .catch((e) => console.log("goto login err:", String(e)))
    await page.waitForLoadState("networkidle").catch(() => {})
    await snapshot(page, "01-login")

    await page
      .locator(emailSel)
      .first()
      .fill(cfg.email)
      .catch((e) => console.log("fill email err:", String(e)))

    const hasPass = await page
      .locator(passSel)
      .first()
      .isVisible()
      .catch(() => false)
    if (!hasPass) {
      // login mungkin 2 langkah (email dulu, lalu password)
      await page
        .locator('button:has-text("Next"), button:has-text("Continue"), input[type=submit]')
        .first()
        .click()
        .catch(() => {})
      await page.waitForLoadState("networkidle").catch(() => {})
      await snapshot(page, "02-after-email")
    }

    await page
      .locator(passSel)
      .first()
      .fill(cfg.password)
      .catch((e) => console.log("fill pass err:", String(e)))

    await page
      .locator(
        'button[type=submit], input[type=submit], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Log In")',
      )
      .first()
      .click()
      .catch((e) => console.log("submit err:", String(e)))
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(5_000)
    await snapshot(page, "03-after-login")

    // Coba ke instructor home / Quick Submit
    await page.goto(cfg.baseUrl + "/t_home.asp", { waitUntil: "domcontentloaded" }).catch(() => {})
    await page.waitForLoadState("networkidle").catch(() => {})
    await snapshot(page, "04-home")

    await saveState(ctx, cfg.statePath).catch((e) => console.log("saveState err:", String(e)))
    console.log("\nSesi disimpan ke:", cfg.statePath)
  } catch (e) {
    console.error("discover error:", e)
  } finally {
    await ctx.close().catch(() => {})
    await browser.close().catch(() => {})
  }

  console.log("\nArtefak di:", OUT)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
