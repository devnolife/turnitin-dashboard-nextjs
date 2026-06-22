import { existsSync } from "fs"
import { mkdir } from "fs/promises"
import path from "path"
import { chromium, type Browser, type BrowserContext, type Page } from "playwright"
import { LOGIN, TURNITIN_PATHS } from "./selectors"
import { loadTurnitinConfig, type TurnitinConfig } from "./config"

export type SessionErrorCode = "SESSION" | "TWO_FACTOR" | "LOGIN"

export class TurnitinSessionError extends Error {
  code: SessionErrorCode
  constructor(message: string, code: SessionErrorCode = "SESSION") {
    super(message)
    this.name = "TurnitinSessionError"
    this.code = code
  }
}

export interface TurnitinSession {
  browser: Browser
  context: BrowserContext
  page: Page
  close: () => Promise<void>
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async function ensureDir(file: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true })
}

/** Simpan cookies/localStorage sesi ke disk agar tidak login ulang tiap job. */
export async function saveState(context: BrowserContext, statePath: string): Promise<void> {
  await ensureDir(statePath)
  await context.storageState({ path: statePath })
}

/** Buka browser + context, restore storageState bila ada. */
export async function openSession(
  cfg: TurnitinConfig = loadTurnitinConfig(),
  opts: { headless?: boolean } = {},
): Promise<TurnitinSession> {
  const headless = opts.headless ?? cfg.headless
  const browser = await chromium.launch({ headless })
  const storageState = existsSync(cfg.statePath) ? cfg.statePath : undefined
  const context = await browser.newContext({ storageState, userAgent: UA })
  const page = await context.newPage()
  const close = async () => {
    await context.close().catch(() => {})
    await browser.close().catch(() => {})
  }
  return { browser, context, page, close }
}

/** Cek apakah sesi tersimpan masih login (tanpa mengisi kredensial). */
export async function isLoggedIn(page: Page, cfg: TurnitinConfig): Promise<boolean> {
  try {
    await page.goto(cfg.baseUrl + TURNITIN_PATHS.home, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })
  } catch {
    return false
  }
  const onLoginPage = await page
    .locator(LOGIN.passwordInput)
    .first()
    .isVisible()
    .catch(() => false)
  if (onLoginPage) return false
  return page
    .locator(LOGIN.loggedInIndicator)
    .first()
    .isVisible()
    .catch(() => false)
}

/** Isi form login dengan kredensial dari env. */
export async function loginWithPassword(page: Page, cfg: TurnitinConfig): Promise<void> {
  await page.goto(cfg.baseUrl + TURNITIN_PATHS.login, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  })
  await page.locator(LOGIN.emailInput).first().fill(cfg.email)
  await page.locator(LOGIN.passwordInput).first().fill(cfg.password)
  await page.locator(LOGIN.submitButton).first().click()
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {})
}

/**
 * Pastikan sesi login & valid.
 * - storageState valid  → langsung lanjut.
 * - tidak valid + akun TANPA 2FA → login otomatis dari env, lalu simpan state.
 * - butuh 2FA/OTP → lempar error(code=TWO_FACTOR) supaya operator bootstrap manual.
 */
export async function ensureLoggedIn(
  session: TurnitinSession,
  cfg: TurnitinConfig = loadTurnitinConfig(),
): Promise<void> {
  if (await isLoggedIn(session.page, cfg)) return

  if (!cfg.email || !cfg.password) {
    throw new TurnitinSessionError(
      "Sesi tidak valid & kredensial kosong. Jalankan `npm run turnitin:bootstrap`.",
      "SESSION",
    )
  }

  await loginWithPassword(session.page, cfg)

  const needs2fa = await session.page
    .locator(LOGIN.twoFactorIndicator)
    .first()
    .isVisible()
    .catch(() => false)
  if (needs2fa) {
    throw new TurnitinSessionError(
      "Login butuh 2FA/OTP. Jalankan `npm run turnitin:bootstrap` (browser headed) sekali untuk menyimpan sesi.",
      "TWO_FACTOR",
    )
  }

  if (!(await isLoggedIn(session.page, cfg))) {
    throw new TurnitinSessionError(
      "Login gagal — kredensial salah atau selector login berubah (cek lib/turnitin/selectors.ts).",
      "LOGIN",
    )
  }

  await saveState(session.context, cfg.statePath)
}
