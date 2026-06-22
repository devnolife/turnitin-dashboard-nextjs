/**
 * Test end-to-end nyata: submit 1 dokumen contoh ke Turnitin via modul bot,
 * lalu tunggu skornya. Pakai sesi tersimpan.
 *   npx tsx scripts/turnitin-test-submit.ts
 */
import { loadEnv } from "../lib/turnitin/load-env"

loadEnv()

import path from "path"
import { mkdir, writeFile } from "fs/promises"
import { loadTurnitinConfig } from "../lib/turnitin/config"
import { openSession, ensureLoggedIn } from "../lib/turnitin/session"
import { submitDocument } from "../lib/turnitin/quick-submit"
import { waitForReport } from "../lib/turnitin/report"

const SAMPLE = `The rapid advancement of digital technology has transformed the way modern
societies access information and communicate with one another. Universities play a central
role in preparing students to navigate this evolving landscape by fostering critical thinking,
academic integrity, and a commitment to original scholarship. Plagiarism detection tools have
become an essential part of maintaining the credibility of academic work. By comparing submitted
documents against vast databases of published material and previously submitted papers, these
systems help instructors identify passages that may require proper citation. This test document
is generated automatically to verify that an automated submission pipeline can deliver a paper to
the similarity service and retrieve the resulting originality score without manual intervention.
The quick brown fox jumps over the lazy dog while researchers continue to study the long term
effects of educational technology on student outcomes and institutional policy across regions.`

async function main(): Promise<void> {
  const cfg = loadTurnitinConfig()
  cfg.maxWaitMs = 4 * 60_000 // batasi tunggu report untuk test
  cfg.pollIntervalMs = 15_000

  const token = `#t${Date.now().toString().slice(-6)}`
  const dir = path.resolve(process.cwd(), "uploads/.turnitin/test")
  await mkdir(dir, { recursive: true })
  const filePath = path.join(dir, "sample.txt")
  await writeFile(filePath, SAMPLE, "utf8")

  console.log("Token:", token, "| file:", filePath)
  const session = await openSession(cfg)
  try {
    console.log("→ ensureLoggedIn...")
    await ensureLoggedIn(session, cfg)
    console.log("✓ login OK")

    console.log("→ submitDocument...")
    const res = await submitDocument(session.page, cfg, {
      filePath,
      title: `Automation Test ${token}`,
      firstName: "Bot",
      lastName: "Tester",
    })
    console.log("✓ SUBMIT OK. titleUsed:", res.titleUsed)

    console.log("→ waitForReport (maks 4 menit)...")
    const report = await waitForReport(session.page, cfg, token)
    console.log("\n✅ SIMILARITY:", report.similarity, "%")
  } catch (e) {
    console.error("\n❌ TEST ERROR:", e instanceof Error ? `${e.name}: ${e.message}` : e)
  } finally {
    await session.close()
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
