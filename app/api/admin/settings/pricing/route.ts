import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"
import { audit } from "@/lib/audit"
import { getPricingList } from "@/lib/pricing"

const ALLOWED_DEGREES = ["S1", "S2", "S3"] as const
type Degree = (typeof ALLOWED_DEGREES)[number]

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const tiers = await getPricingList()
    return NextResponse.json({ tiers })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.settings.pricing.fetch_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat tarif" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const body = await request.json()
    const tiers: unknown = body?.tiers
    if (!Array.isArray(tiers)) {
      return NextResponse.json({ message: "Format payload tidak valid" }, { status: 400 })
    }

    const sanitized: Array<{ degree: Degree; studentRate: number; instructorRate: number }> = []
    for (const t of tiers) {
      if (!t || typeof t !== "object") continue
      const degree = String((t as Record<string, unknown>).degree || "").toUpperCase() as Degree
      if (!ALLOWED_DEGREES.includes(degree)) continue
      const studentRate = Number((t as Record<string, unknown>).studentRate)
      const instructorRate = Number((t as Record<string, unknown>).instructorRate)
      if (!Number.isFinite(studentRate) || studentRate < 0 || studentRate > 100_000_000) {
        return NextResponse.json(
          { message: `Tarif mahasiswa ${degree} tidak valid` },
          { status: 400 },
        )
      }
      if (!Number.isFinite(instructorRate) || instructorRate < 0 || instructorRate > 100_000_000) {
        return NextResponse.json(
          { message: `Honor instruktur ${degree} tidak valid` },
          { status: 400 },
        )
      }
      sanitized.push({
        degree,
        studentRate: Math.round(studentRate),
        instructorRate: Math.round(instructorRate),
      })
    }

    if (sanitized.length === 0) {
      return NextResponse.json({ message: "Tidak ada tarif yang valid untuk disimpan" }, { status: 400 })
    }

    await prisma.$transaction(
      sanitized.map((t) =>
        prisma.pricingTier.upsert({
          where: { degree: t.degree },
          update: { studentRate: t.studentRate, instructorRate: t.instructorRate },
          create: t,
        }),
      ),
    )

    const updated = await getPricingList()
    void audit("admin.pricing_changed", {
      request,
      actorId: auth.userId,
      actorRole: "ADMIN",
      targetType: "pricing",
      metadata: { tiers: sanitized },
    })
    return NextResponse.json({ message: "Tarif berhasil diperbarui", tiers: updated })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.settings.pricing.update_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal menyimpan tarif" }, { status: 500 })
  }
}
