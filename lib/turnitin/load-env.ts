import { existsSync, readFileSync } from "fs"
import path from "path"

/**
 * Loader .env minimal & tanpa dependency, untuk dipakai script standalone
 * (`scripts/turnitin-*.ts`) yang dijalankan via `tsx` — di luar Next.js yang
 * biasanya memuat .env otomatis. Tidak menimpa variabel yang sudah ada.
 *
 * Modul ini sengaja TIDAK meng-import apa pun yang mengkonstruksi PrismaClient,
 * supaya bisa dipanggil paling awal sebelum DATABASE_URL dibutuhkan.
 */
export function loadEnv(files: string[] = [".env.local", ".env"]): void {
  for (const f of files) {
    const p = path.resolve(process.cwd(), f)
    if (!existsSync(p)) continue
    const content = readFileSync(p, "utf8")
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith("#")) continue
      const eq = line.indexOf("=")
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      if (!key || key in process.env) continue
      let val = line.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  }
}
