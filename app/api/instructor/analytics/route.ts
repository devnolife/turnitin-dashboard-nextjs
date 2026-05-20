import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR")

    const { searchParams } = new URL(request.url)
    const rawPeriod = searchParams.get("period")
    const allowedPeriods = ["month", "semester", "year"]
    const period = rawPeriod && allowedPeriods.includes(rawPeriod) ? rawPeriod : "semester"

    const now = new Date()
    let startDate: Date
    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        break
      case "semester":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
    }

    // Filter by instructor's assigned students
    const myStudentFilter = { user: { instructorId: auth.userId } }

    const [statusCounts, avgSimilarity, activeStudents, submissions] = await Promise.all([
      prisma.submission.groupBy({
        by: ["status"],
        where: myStudentFilter,
        _count: true,
      }),
      prisma.submission.aggregate({
        where: { similarityScore: { not: null }, ...myStudentFilter },
        _avg: { similarityScore: true },
      }),
      prisma.user.count({ where: { role: "STUDENT", instructorId: auth.userId } }),
      prisma.submission.findMany({
        where: { createdAt: { gte: startDate }, ...myStudentFilter },
        select: { createdAt: true, similarityScore: true },
        orderBy: { createdAt: "asc" },
      }),
    ])

    // Parse status counts
    const countMap: Record<string, number> = {}
    let totalSubmissions = 0
    for (const row of statusCounts) {
      countMap[row.status] = row._count
      totalSubmissions += row._count
    }

    // Similarity distribution dari submissions yang sudah di-fetch
    const distribution = [
      { name: "0-24%", value: 0, color: "#22c55e" },
      { name: "25-49%", value: 0, color: "#eab308" },
      { name: "50-74%", value: 0, color: "#f97316" },
      { name: "75-100%", value: 0, color: "#ef4444" },
    ]

    // Monthly trends + distribution in satu loop
    const monthlyMap = new Map<string, { count: number; totalScore: number; scored: number }>()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

    for (const sub of submissions) {
      const key = `${sub.createdAt.getFullYear()}-${sub.createdAt.getMonth()}`
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { count: 0, totalScore: 0, scored: 0 })
      }
      const entry = monthlyMap.get(key)!
      entry.count++

      if (sub.similarityScore !== null) {
        entry.totalScore += sub.similarityScore
        entry.scored++
        const score = sub.similarityScore
        if (score < 25) distribution[0].value++
        else if (score < 50) distribution[1].value++
        else if (score < 75) distribution[2].value++
        else distribution[3].value++
      }
    }

    const monthlyData = Array.from(monthlyMap.entries()).map(([key, val]) => {
      const [, month] = key.split("-").map(Number)
      return {
        month: monthNames[month],
        submissions: val.count,
        avgSimilarity: val.scored > 0 ? Math.round(val.totalScore / val.scored) : 0,
      }
    })

    return NextResponse.json({
      totalSubmissions,
      pendingSubmissions: countMap["PENDING"] || 0,
      reviewedSubmissions: countMap["REVIEWED"] || 0,
      flaggedSubmissions: countMap["FLAGGED"] || 0,
      avgSimilarity: Math.round(avgSimilarity._avg.similarityScore || 0),
      activeStudents,
      distribution,
      monthlyData,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Instructor analytics error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data analitik" },
      { status: 500 }
    )
  }
}
