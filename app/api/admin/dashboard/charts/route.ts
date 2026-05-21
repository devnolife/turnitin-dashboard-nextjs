import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
]

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const now = new Date()
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1))

    const [students, submissionsByStatus, submissionsByProgram] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "STUDENT",
          createdAt: { gte: start },
        },
        select: { createdAt: true },
      }),
      prisma.submission.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.submission.findMany({
        where: { status: { in: ["REVIEWED", "FLAGGED"] } },
        select: {
          user: {
            select: {
              studyProgram: { select: { name: true, degree: true } },
              prodi: true,
            },
          },
        },
      }),
    ])

    const monthlyBuckets: { key: string; label: string; count: number }[] = []
    for (let i = 0; i < 12; i++) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1))
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      monthlyBuckets.push({
        key,
        label: `${MONTH_NAMES[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`,
        count: 0,
      })
    }
    const bucketMap = new Map(monthlyBuckets.map((b) => [b.key, b]))
    for (const s of students) {
      const d = new Date(s.createdAt)
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      const bucket = bucketMap.get(key)
      if (bucket) bucket.count += 1
    }

    const statusData = submissionsByStatus.map((s) => ({
      status: s.status,
      count: s._count._all,
    }))

    const programCounts = new Map<string, number>()
    for (const sub of submissionsByProgram) {
      const name = sub.user.studyProgram?.name || sub.user.prodi || "Lainnya"
      programCounts.set(name, (programCounts.get(name) || 0) + 1)
    }
    const programData = Array.from(programCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    return NextResponse.json({
      monthlyRegistrations: monthlyBuckets,
      submissionStatus: statusData,
      submissionsByProgram: programData,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.dashboard.charts_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat data chart" }, { status: 500 })
  }
}
