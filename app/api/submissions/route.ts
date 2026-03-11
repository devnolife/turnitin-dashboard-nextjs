import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function mapStatus(status: string) {
  switch (status) {
    case "REVIEWED": return "Hasil Diterima"
    case "FLAGGED": return "Perlu Revisi"
    case "PENDING": return "Menunggu Hasil"
    default: return status
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 })
  }

  const rawSubmissions = await prisma.submission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
  })

  const submissions = rawSubmissions.map((s) => ({
    id: s.id,
    userId: s.userId,
    title: s.documentTitle,
    documentUrl: s.documentUrl,
    date: new Date(s.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    similarity: s.similarityScore ?? 0,
    status: mapStatus(s.status),
    rawStatus: s.status,
    feedback: s.reportUrl || null,
    reviewedBy: s.reviewedBy || null,
    reviewedAt: s.reviewedAt
      ? new Date(s.reviewedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null,
    createdAt: s.createdAt,
  }))

  return NextResponse.json({ submissions })
}
