import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "perpusmu-secret-key-2024"
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "semester"

    // Calculate date range
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

    // Total stats
    const [totalSubmissions, pendingSubmissions, reviewedSubmissions, flaggedSubmissions] =
      await Promise.all([
        prisma.submission.count(),
        prisma.submission.count({ where: { status: "PENDING" } }),
        prisma.submission.count({ where: { status: "REVIEWED" } }),
        prisma.submission.count({ where: { status: "FLAGGED" } }),
      ])

    // Average similarity
    const avgSimilarity = await prisma.submission.aggregate({
      where: { similarityScore: { not: null } },
      _avg: { similarityScore: true },
    })

    // Similarity distribution
    const allScores = await prisma.submission.findMany({
      where: { similarityScore: { not: null } },
      select: { similarityScore: true },
    })

    const distribution = [
      { name: "0-24%", value: 0, color: "#22c55e" },
      { name: "25-49%", value: 0, color: "#eab308" },
      { name: "50-74%", value: 0, color: "#f97316" },
      { name: "75-100%", value: 0, color: "#ef4444" },
    ]

    for (const s of allScores) {
      const score = s.similarityScore!
      if (score < 25) distribution[0].value++
      else if (score < 50) distribution[1].value++
      else if (score < 75) distribution[2].value++
      else distribution[3].value++
    }

    // Monthly trends
    const submissions = await prisma.submission.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, similarityScore: true },
      orderBy: { createdAt: "asc" },
    })

    const monthlyMap = new Map<string, { count: number; totalScore: number; scored: number }>()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

    for (const sub of submissions) {
      const key = `${sub.createdAt.getFullYear()}-${sub.createdAt.getMonth()}`
      const label = `${monthNames[sub.createdAt.getMonth()]} ${sub.createdAt.getFullYear()}`
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { count: 0, totalScore: 0, scored: 0 })
      }
      const entry = monthlyMap.get(key)!
      entry.count++
      if (sub.similarityScore !== null) {
        entry.totalScore += sub.similarityScore
        entry.scored++
      }
    }

    const monthlyData = Array.from(monthlyMap.entries()).map(([key, val]) => {
      const [year, month] = key.split("-").map(Number)
      return {
        month: `${monthNames[month]}`,
        submissions: val.count,
        avgSimilarity: val.scored > 0 ? Math.round(val.totalScore / val.scored) : 0,
      }
    })

    // Active students count
    const activeStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    })

    return NextResponse.json({
      totalSubmissions,
      pendingSubmissions,
      reviewedSubmissions,
      flaggedSubmissions,
      avgSimilarity: Math.round(avgSimilarity._avg.similarityScore || 0),
      activeStudents,
      distribution,
      monthlyData,
    })
  } catch (error) {
    console.error("Instructor analytics error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data analitik" },
      { status: 500 }
    )
  }
}
