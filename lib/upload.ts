import { mkdir, writeFile, readFile, stat } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import crypto from "crypto"

export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  path.join(process.cwd(), "uploads")

export const SUBMISSIONS_DIR = path.join(UPLOAD_DIR, "submissions")
export const REPORTS_DIR = path.join(UPLOAD_DIR, "reports")

export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export const ALLOWED_DOC_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

export const ALLOWED_REPORT_MIME = new Set(["application/pdf"])

export type SaveTarget = "submission" | "report"

export interface SavedFile {
  storedName: string
  originalName: string
  size: number
  mimeType: string
  relativePath: string // path relative to UPLOAD_DIR
}

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

function safeBaseName(name: string): string {
  return name
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120)
}

export async function validateFile(
  file: File,
  target: SaveTarget,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!file || file.size === 0) {
    return { ok: false, reason: "File kosong" }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, reason: "Ukuran file melebihi 20MB" }
  }
  const allowed =
    target === "submission" ? ALLOWED_DOC_MIME : ALLOWED_REPORT_MIME
  if (!allowed.has(file.type)) {
    return {
      ok: false,
      reason:
        target === "submission"
          ? "Format file harus PDF atau DOCX"
          : "Format report harus PDF",
    }
  }

  // Magic-byte sniff — jangan percaya MIME dari klien begitu saja.
  // PDF: starts with "%PDF-"
  // DOCX (zip): starts with "PK\x03\x04" or "PK\x05\x06" (empty) or "PK\x07\x08" (spanned)
  // DOC (legacy OLE): "D0 CF 11 E0 A1 B1 1A E1"
  try {
    const head = Buffer.from(await file.slice(0, 8).arrayBuffer())
    const isPdf = head.slice(0, 5).toString("ascii") === "%PDF-"
    const isZip = head[0] === 0x50 && head[1] === 0x4b
    const isOleDoc =
      head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0
    if (file.type === "application/pdf" && !isPdf) {
      return { ok: false, reason: "File mengaku PDF tapi isinya bukan PDF" }
    }
    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      !isZip
    ) {
      return { ok: false, reason: "File DOCX tidak valid" }
    }
    if (file.type === "application/msword" && !isOleDoc) {
      return { ok: false, reason: "File DOC tidak valid" }
    }
  } catch {
    return { ok: false, reason: "Tidak dapat memvalidasi isi file" }
  }

  return { ok: true }
}

export async function saveUploadedFile(
  file: File,
  target: SaveTarget,
  submissionId: string,
): Promise<SavedFile> {
  const dir = target === "submission" ? SUBMISSIONS_DIR : REPORTS_DIR
  await ensureDir(dir)

  const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : "")
  const random = crypto.randomBytes(6).toString("hex")
  const baseOriginal = safeBaseName(path.basename(file.name, ext))
  const storedName = `${submissionId}-${random}-${baseOriginal}${ext}`
  const absPath = path.join(dir, storedName)

  const buf = Buffer.from(await file.arrayBuffer())
  await writeFile(absPath, buf)

  return {
    storedName,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
    relativePath: path.relative(UPLOAD_DIR, absPath).replace(/\\/g, "/"),
  }
}

export async function readStoredFile(
  relativePath: string,
): Promise<{ data: Buffer; size: number } | null> {
  // Reject anything trying to escape
  const safeRel = relativePath.replace(/\\/g, "/")
  if (safeRel.includes("..") || safeRel.startsWith("/")) return null
  const absPath = path.join(UPLOAD_DIR, safeRel)
  if (!absPath.startsWith(UPLOAD_DIR)) return null
  if (!existsSync(absPath)) return null
  const [data, s] = await Promise.all([readFile(absPath), stat(absPath)])
  return { data, size: s.size }
}

/**
 * Resolusi path absolut dari relativePath tersimpan, dengan pengecekan keamanan
 * yang sama seperti `readStoredFile`. Dipakai worker bot untuk memberi file ke
 * Playwright (`setInputFiles`) tanpa perlu membaca seluruh isi ke memori.
 * Mengembalikan null bila path tidak valid atau file tidak ada.
 */
export function resolveStoredFilePath(relativePath: string): string | null {
  const safeRel = relativePath.replace(/\\/g, "/")
  if (safeRel.includes("..") || safeRel.startsWith("/")) return null
  const absPath = path.join(UPLOAD_DIR, safeRel)
  if (!absPath.startsWith(UPLOAD_DIR)) return null
  if (!existsSync(absPath)) return null
  return absPath
}

/**
 * Simpan buffer report (PDF) yang diunduh bot ke REPORTS_DIR. Mirip
 * `saveUploadedFile` tapi sumbernya Buffer, bukan `File`.
 */
export async function saveReportBuffer(
  buf: Buffer,
  submissionId: string,
  originalName: string,
): Promise<SavedFile> {
  await ensureDir(REPORTS_DIR)
  const random = crypto.randomBytes(6).toString("hex")
  const ext = path.extname(originalName) || ".pdf"
  const base = safeBaseName(path.basename(originalName, path.extname(originalName)) || "report")
  const storedName = `${submissionId}-${random}-${base}${ext}`
  const absPath = path.join(REPORTS_DIR, storedName)
  await writeFile(absPath, buf)
  return {
    storedName,
    originalName,
    size: buf.length,
    mimeType: "application/pdf",
    relativePath: path.relative(UPLOAD_DIR, absPath).replace(/\\/g, "/"),
  }
}
