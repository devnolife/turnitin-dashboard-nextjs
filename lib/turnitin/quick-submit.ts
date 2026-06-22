import type { Page } from "playwright"
import { QUICK_SUBMIT, TURNITIN_PATHS } from "./selectors"
import type { TurnitinConfig } from "./config"

export type SubmitErrorCode = "REJECTED" | "SELECTOR" | "UNKNOWN"

export class TurnitinSubmitError extends Error {
  code: SubmitErrorCode
  constructor(message: string, code: SubmitErrorCode = "UNKNOWN") {
    super(message)
    this.name = "TurnitinSubmitError"
    this.code = code
  }
}

export interface SubmitInput {
  /** Path absolut file mahasiswa (PDF/DOCX) di disk. */
  filePath: string
  /** Judul yang dikirim (sebaiknya mengandung token unik untuk korelasi report). */
  title: string
  firstName: string
  lastName: string
}

export interface SubmitResult {
  paperId: string | null
  titleUsed: string
}

async function openQuickSubmitInbox(page: Page, cfg: TurnitinConfig): Promise<void> {
  await page.goto(cfg.baseUrl + TURNITIN_PATHS.home, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  })
  await page.locator(QUICK_SUBMIT.quickSubmitTab).first().click({ timeout: 30_000 })
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.waitForTimeout(1_000)
}

/**
 * Submit satu dokumen lewat Quick Submit. Alur (terverifikasi):
 *   home → Quick Submit → Submit → custom search (no repository) → form upload →
 *   Upload → Confirm → digital receipt.
 */
export async function submitDocument(
  page: Page,
  cfg: TurnitinConfig,
  input: SubmitInput,
): Promise<SubmitResult> {
  await openQuickSubmitInbox(page, cfg)

  // Tombol "Submit" di inbox → halaman custom search.
  try {
    await page.locator(QUICK_SUBMIT.submitPaperButton).first().click({ timeout: 30_000 })
  } catch {
    throw new TurnitinSubmitError("Tombol Submit di inbox tidak ditemukan.", "SELECTOR")
  }
  await page.waitForLoadState("networkidle").catch(() => {})

  // Custom search: bandingkan ke semua sumber, repository = no repository.
  const boxes = page.locator(QUICK_SUBMIT.compareCheckbox)
  const n = await boxes.count().catch(() => 0)
  for (let i = 0; i < n; i++) await boxes.nth(i).check().catch(() => {})
  await page
    .selectOption(QUICK_SUBMIT.repositorySelect, { value: QUICK_SUBMIT.repositoryNoRepoValue })
    .catch(() => {})
  try {
    await page.locator(QUICK_SUBMIT.customSearchSubmit).first().click({ timeout: 30_000 })
  } catch {
    throw new TurnitinSubmitError("Tombol Submit di custom search tidak ditemukan.", "SELECTOR")
  }
  await page.waitForLoadState("networkidle").catch(() => {})

  // Form upload (t_submit.asp).
  const fileInput = page.locator(QUICK_SUBMIT.fileInput).first()
  try {
    await fileInput.waitFor({ state: "attached", timeout: 30_000 })
  } catch {
    throw new TurnitinSubmitError("Form upload tidak muncul (selector berubah?).", "SELECTOR")
  }

  await page.locator(QUICK_SUBMIT.authorFirst).first().fill(input.firstName).catch(() => {})
  await page.locator(QUICK_SUBMIT.authorLast).first().fill(input.lastName).catch(() => {})
  await page.locator(QUICK_SUBMIT.titleInput).first().fill(input.title).catch(() => {})

  try {
    await fileInput.setInputFiles(input.filePath)
  } catch (e) {
    throw new TurnitinSubmitError(`Gagal melampirkan file: ${String(e)}`, "REJECTED")
  }

  // Upload → tunggu state konfirmasi (konversi file bisa lama).
  await page.locator(QUICK_SUBMIT.uploadButton).first().click({ timeout: 30_000 }).catch(() => {})
  try {
    await page.locator(QUICK_SUBMIT.confirmButton).first().waitFor({ state: "visible", timeout: 180_000 })
  } catch {
    throw new TurnitinSubmitError(
      "Tombol Confirm tidak muncul — file mungkin ditolak atau konversi gagal.",
      "REJECTED",
    )
  }
  await page.locator(QUICK_SUBMIT.confirmButton).first().click({ timeout: 30_000 }).catch(() => {})

  // Tunggu digital receipt (tanda submission tersimpan).
  await page
    .locator(QUICK_SUBMIT.digitalReceipt)
    .first()
    .waitFor({ state: "visible", timeout: 120_000 })
    .catch(() => {})

  return { paperId: null, titleUsed: input.title }
}
