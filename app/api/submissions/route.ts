import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"

export const runtime = "nodejs"

function mapStatus(status: string) {
  switch (status) {
    case "REVIEWED": return "Hasil Diterima"
    case "FLAGGED": return "Perlu Revisi"
    case "PROCESSING": return "Sedang Diperiksa"
    case "PENDING": return "Menunggu Diproses"
    default: return status
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    const rawSubmissions = await prisma.submission.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    })

    const submissions = rawSubmissions.map((s) => ({
      id: s.id,
      title: s.documentTitle,
      fileName: s.fileName,
      examType: s.examType,
      chapter: s.chapter,
      similarity: s.similarityScore ?? 0,
      status: mapStatus(s.status),
      rawStatus: s.status,
      hasFile: Boolean(s.documentUrl),
      hasReport: Boolean(s.reportUrl),
      rejectionReason: s.rejectionReason,
      version: s.version,
      parentSubmissionId: s.parentSubmissionId,
      reviewedAt: s.reviewedAt
        ? new Date(s.reviewedAt).toLocaleDateString("id-ID", {
          day: "numeric", month: "short", year: "numeric",
        })
        : null,
      date: new Date(s.createdAt).toLocaleDateString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
      }),
      createdAt: s.createdAt,
    }))

    return NextResponse.json({ submissions })
  } catch (error) {
    return handleAuthError(error)
  }
}
