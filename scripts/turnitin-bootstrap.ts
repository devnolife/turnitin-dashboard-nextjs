/**
 * Bootstrap sesi login Turnitin — DIJALANKAN SEKALI (browser headed).
 *
 *   npm run turnitin:bootstrap
 *
 * Alur:
 *  1. Membuka browser (tampil), menuju halaman login Turnitin.
 *  2. Kamu login MANUAL di browser itu — termasuk 2FA/OTP bila ada — sampai
 *     benar-benar masuk dashboard instruktur.
 *  3. Kembali ke terminal, tekan ENTER → sesi (cookies) disimpan ke
 *     TURNITIN_STATE_PATH agar worker tidak perlu login ulang.
 *
 * Ulangi langkah ini bila worker melaporkan error SESSION/TWO_FACTOR.
 */
import readline from "readline"
import { loadEnv } from "../lib/turnitin/load-env"
import { loadTurnitinConfig } from "../lib/turnitin/config"
import { openSession, saveState, isLoggedIn } from "../lib/turnitin/session"
import { TURNITIN_PATHS } from "../lib/turnitin/selectors"

loadEnv()

function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) =>
    rl.question(prompt, () => {
      rl.close()
      resolve()
    }),
  )
}

async function main(): Promise<void> {
  const cfg = loadTurnitinConfig()
  console.log("Membuka browser (headed) untuk login Turnitin...")
  console.log(`Base URL: ${cfg.baseUrl}`)

  const session = await openSession(cfg, { headless: false })
  await session.page.goto(cfg.baseUrl + TURNITIN_PATHS.login).catch(() => {})

  console.log("\n→ Silakan LOGIN manual di jendela browser (termasuk 2FA/OTP bila ada).")
  console.log("→ Pastikan sudah masuk ke dashboard instruktur (Quick Submit terlihat).")
  await waitForEnter("\nTekan ENTER di sini setelah berhasil login... ")

  await saveState(session.context, cfg.statePath)
  const ok = await isLoggedIn(session.page, cfg).catch(() => false)
  if (ok) {
    console.log(`\n✓ Sesi tersimpan ke ${cfg.statePath}`)
  } else {
    console.log(
      `\n⚠ Sesi tersimpan ke ${cfg.statePath}, tapi indikator login belum terdeteksi.\n` +
        "  Kemungkinan selector 'loggedInIndicator' di lib/turnitin/selectors.ts perlu disesuaikan.",
    )
  }

  await session.close()
  process.exit(0)
}

main().catch((e) => {
  console.error("Bootstrap gagal:", e)
  process.exit(1)
})
