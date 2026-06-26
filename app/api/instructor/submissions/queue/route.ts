import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR", "ADMIN")

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // PENDING | PROCESSING | REVIEWED | FLAGGED | all
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))

    const baseWhere =
      auth.role === "INSTRUCTOR"
        ? { user: { instructorId: auth.userId } }
        : {}

    const where = status && status !== "all"
      ? { ...baseWhere, status: status as "PENDING" | "PROCESSING" | "REVIEWED" | "FLAGGED" }
      : baseWhere

    const [items, counts] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          user: {
            select: {
              id: true, name: true, username: true, nim: true, prodi: true,
              studyProgram: {
                select: {
                  name: true,
                  code: true,
                  similarityRules: {
                    select: { id: true, ruleType: true, label: true, maxPercentage: true },
                    orderBy: { orderIndex: "asc" },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.submission.groupBy({
        by: ["status"],
        where: baseWhere,
        _count: { _all: true },
      }),
    ])

    const countsMap = {
      PENDING: 0,
      PROCESSING: 0,
      REVIEWED: 0,
      FLAGGED: 0,
    } as Record<string, number>
    for (const c of counts) countsMap[c.status] = c._count._all

    // Total diturunkan dari groupBy (hindari query COUNT terpisah):
    // - status spesifik  -> jumlah pada status itu
    // - "all"/kosong      -> jumlah semua status dalam scope
    const total = status && status !== "all"
      ? countsMap[status] ?? 0
      : countsMap.PENDING + countsMap.PROCESSING + countsMap.REVIEWED + countsMap.FLAGGED

    return NextResponse.json({
      submissions: items,
      counts: countsMap,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
