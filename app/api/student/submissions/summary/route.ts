import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "STUDENT")

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        studyProgram: {
          include: {
            similarityRules: { orderBy: { orderIndex: "asc" } },
          },
        },
      },
    })

    const rules = user?.studyProgram?.similarityRules ?? []
    const ruleType = rules[0]?.ruleType ?? null // PER_CHAPTER or PER_EXAM or null

    const submissions = await prisma.submission.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, documentTitle: true, examType: true, chapter: true,
        status: true, similarityScore: true, rejectionReason: true,
        version: true, parentSubmissionId: true,
        createdAt: true, reviewedAt: true,
      },
    })

    // Group latest per (examType, chapter)
    const latest = new Map<string, typeof submissions[number]>()
    for (const s of submissions) {
      const key = `${s.examType ?? "_"}|${s.chapter ?? "_"}`
      if (!latest.has(key)) latest.set(key, s)
    }

    return NextResponse.json({
      ruleType,
      rules: rules.map((r) => ({
        id: r.id, ruleType: r.ruleType, label: r.label, maxPercentage: r.maxPercentage,
      })),
      submissions,
      latestByKey: Array.from(latest.entries()).map(([key, s]) => ({ key, ...s })),
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
