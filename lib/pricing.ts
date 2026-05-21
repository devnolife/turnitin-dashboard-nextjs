import { prisma } from "@/lib/prisma"

export type Degree = "S1" | "S2" | "S3"

export type PricingRecord = {
  degree: Degree
  studentRate: number
  instructorRate: number
}

export type PricingMap = Record<Degree, PricingRecord>

const FALLBACK_PRICING: PricingMap = {
  S1: { degree: "S1", studentRate: 100_000, instructorRate: 50_000 },
  S2: { degree: "S2", studentRate: 150_000, instructorRate: 75_000 },
  S3: { degree: "S3", studentRate: 200_000, instructorRate: 100_000 },
}

/**
 * Ambil tarif aktif dari DB, fallback ke konstanta default kalau belum di-seed.
 * Hasil di-cache per-request lewat React cache jika dibutuhkan di future.
 */
export async function getPricingMap(): Promise<PricingMap> {
  const tiers = await prisma.pricingTier.findMany()
  if (tiers.length === 0) return FALLBACK_PRICING
  const map: PricingMap = { ...FALLBACK_PRICING }
  for (const t of tiers) {
    const degree = t.degree as Degree
    if (degree === "S1" || degree === "S2" || degree === "S3") {
      map[degree] = {
        degree,
        studentRate: t.studentRate,
        instructorRate: t.instructorRate,
      }
    }
  }
  return map
}

export async function getPricingList(): Promise<PricingRecord[]> {
  const map = await getPricingMap()
  return [map.S1, map.S2, map.S3]
}

export function normalizeDegreeKey(raw?: string | null): Degree {
  const d = (raw || "").toUpperCase()
  if (d.includes("S3") || d.includes("DOKTOR")) return "S3"
  if (d.includes("S2") || d.includes("MAGISTER")) return "S2"
  return "S1"
}
