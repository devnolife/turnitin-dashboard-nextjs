/**
 * Verifikasi E2E nonaktifkan instruktur lewat HTTP server nyata.
 * Prasyarat: dev server jalan (E2E_BASE_URL, default http://localhost:3010).
 *   npx tsx scripts/verify-instructor-deactivate.ts
 */
import { loadEnv } from "../lib/turnitin/load-env"

loadEnv()

const BASE = process.env.E2E_BASE_URL || "http://localhost:3010"

async function main(): Promise<void> {
  const { prisma } = await import("../lib/prisma")
  const { createToken } = await import("../lib/auth/verify-token")

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } })
  if (!admin) throw new Error("Tidak ada user ADMIN.")
  const adminToken = await createToken(admin.id, "ADMIN")
  const H = { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" }
  const JH = { "Content-Type": "application/json" }

  const username = `test_inst_${Date.now().toString().slice(-6)}`
  const password = "TestPass123!"
  let instructorId = ""

  const login = () =>
    fetch(`${BASE}/api/auth/login`, { method: "POST", headers: JH, body: JSON.stringify({ username, password }) })

  try {
    const c = await fetch(`${BASE}/api/admin/instructors`, {
      method: "POST",
      headers: H,
      body: JSON.stringify({ username, password, name: "Test Deactivate Instructor" }),
    })
    console.log("[1] create instructor:", c.status)
    const inst = await prisma.user.findUnique({ where: { username }, select: { id: true } })
    instructorId = inst?.id ?? ""

    const l1 = await login()
    console.log("[2] login (active):", l1.status, "(expect 200)")

    const d = await fetch(`${BASE}/api/admin/instructors/${instructorId}`, {
      method: "PUT",
      headers: H,
      body: JSON.stringify({ accountStatus: "INACTIVE" }),
    })
    console.log("[3] deactivate:", d.status, (await d.json()).message)

    const l2 = await login()
    const l2j = await l2.json()
    console.log("[4] login (inactive):", l2.status, `"${l2j.message}"`, "(expect 403)")

    const list = await fetch(`${BASE}/api/admin/instructors`, { headers: H })
    const lj = await list.json()
    const found = (lj.instructors || []).find((i: { id: string; accountStatus: string }) => i.id === instructorId)
    console.log("[5] list accountStatus:", found?.accountStatus, "(expect INACTIVE)")

    const r = await fetch(`${BASE}/api/admin/instructors/${instructorId}`, {
      method: "PUT",
      headers: H,
      body: JSON.stringify({ accountStatus: "ACTIVE" }),
    })
    console.log("[6] reactivate:", r.status, (await r.json()).message)

    const l3 = await login()
    console.log("[7] login (reactivated):", l3.status, "(expect 200)")

    const pass =
      l1.status === 200 &&
      l2.status === 403 &&
      found?.accountStatus === "INACTIVE" &&
      r.status === 200 &&
      l3.status === 200
    console.log(pass ? "\n✅ DEACTIVATE E2E PASS" : "\n⚠️ Periksa hasil di atas")
  } finally {
    if (instructorId) await prisma.user.delete({ where: { id: instructorId } }).catch(() => {})
    await prisma.$disconnect().catch(() => {})
    console.log("(cleanup done)")
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
