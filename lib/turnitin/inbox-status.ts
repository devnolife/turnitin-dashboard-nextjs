import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import { UPLOAD_DIR } from "@/lib/upload"

/** Lokasi snapshot status inbox Turnitin (ditulis worker, dibaca API admin). */
const STATUS_PATH = path.join(UPLOAD_DIR, ".turnitin", "inbox-status.json")

export type InboxLevel = "ok" | "warning" | "full" | "unknown"

export interface InboxStatus {
  /** Jumlah paper terdeteksi di inbox Quick Submit. */
  count: number
  /** Kapasitas maksimum akun (default 25). */
  capacity: number
  /** Ambang peringatan (jumlah paper) — di atas ini → "warning". */
  warnAt: number
  /** ok | warning | full. */
  level: InboxLevel
  /** ISO timestamp pengecekan terakhir. */
  checkedAt: string
  /** Catatan opsional (mis. alasan gagal hitung). */
  note?: string
}

export function computeLevel(count: number, capacity: number, warnAt: number): InboxLevel {
  if (count >= capacity) return "full"
  if (count >= warnAt) return "warning"
  return "ok"
}

/** Tulis snapshot status inbox ke file JSON (best-effort, tidak melempar). */
export async function writeInboxStatus(status: InboxStatus): Promise<void> {
  try {
    await mkdir(path.dirname(STATUS_PATH), { recursive: true })
    await writeFile(STATUS_PATH, JSON.stringify(status, null, 2), "utf8")
  } catch {
    // best-effort: jangan ganggu pemrosesan job
  }
}

/** Baca snapshot status inbox. Mengembalikan null bila belum pernah ada. */
export async function readInboxStatus(): Promise<InboxStatus | null> {
  try {
    const raw = await readFile(STATUS_PATH, "utf8")
    const parsed = JSON.parse(raw) as InboxStatus
    if (typeof parsed.count !== "number") return null
    return parsed
  } catch {
    return null
  }
}
