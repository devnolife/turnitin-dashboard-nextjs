import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    const submissions = await prisma.submission.findMany({
      where: { userId: auth.userId },
    })

    const total = submissions.length
    const reviewed = submissions.filter((s) => s.status === "REVIEWED").length
    const pending = submissions.filter((s) => s.status === "PENDING").length
    const flagged = submissions.filter((s) => s.status === "FLAGGED").length

    const withScore = submissions.filter((s) => s.similarityScore !== null)
    const avgSimilarity =
      withScore.length > 0
        ? Math.round(
            withScore.reduce((sum, s) => sum + (s.similarityScore || 0), 0) /
              withScore.length
          )
        : 0

    const payment = await prisma.payment.findFirst({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      total,
      reviewed,
      pending,
      flagged,
      avgSimilarity,
      paymentStatus: payment?.status || "PENDING",
      paymentDate: payment?.createdAt || null,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

