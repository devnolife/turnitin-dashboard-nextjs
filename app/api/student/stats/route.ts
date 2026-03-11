import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "perpusmu-secret-key-2024"
)

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { id: string; role: string }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const tokenUser = await getUserFromToken(request)
  if (!tokenUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const submissions = await prisma.submission.findMany({
    where: { userId: tokenUser.id },
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
    where: { userId: tokenUser.id },
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
}
