import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const instructor = await prisma.user.findUnique({
      where: { id, role: "INSTRUCTOR" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        hp: true,
        prodi: true,
        whatsappNumber: true,
        createdAt: true,
      },
    })

    if (!instructor) {
      return NextResponse.json(
        { message: "Instruktur tidak ditemukan" },
        { status: 404 }
      )
    }

    // Get submissions reviewed by this instructor
    const reviewedSubmissions = await prisma.submission.findMany({
      where: { reviewedBy: instructor.id },
      select: {
        id: true,
        documentTitle: true,
        similarityScore: true,
        status: true,
        reviewedAt: true,
        reportUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            nim: true,
            prodi: true,
          },
        },
      },
      orderBy: { reviewedAt: "desc" },
    })

    const statusLabels: Record<string, string> = {
      PENDING: "Menunggu",
      REVIEWED: "Direview",
      FLAGGED: "Ditandai",
    }

    const totalReviewed = reviewedSubmissions.filter((s) => s.status === "REVIEWED").length
    const totalFlagged = reviewedSubmissions.filter((s) => s.status === "FLAGGED").length
    const scores = reviewedSubmissions
      .filter((s) => s.similarityScore !== null)
      .map((s) => s.similarityScore as number)
    const avgSimilarity = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0

    const formatted = {
      id: instructor.id,
      name: instructor.name,
      username: instructor.username,
      email: instructor.email || "-",
      hp: instructor.hp || instructor.whatsappNumber || "-",
      prodi: instructor.prodi || "-",
      createdAt: instructor.createdAt,
      reviewedSubmissions: reviewedSubmissions.map((s) => ({
        id: s.id,
        title: s.documentTitle,
        similarity: s.similarityScore,
        status: s.status,
        statusLabel: statusLabels[s.status] || s.status,
        feedback: s.reportUrl,
        reviewedAt: s.reviewedAt,
        createdAt: s.createdAt,
        student: {
          id: s.user.id,
          name: s.user.name,
          nim: s.user.nim,
          prodi: s.user.prodi,
        },
      })),
      stats: {
        totalReviewed,
        totalFlagged,
        totalSubmissions: reviewedSubmissions.length,
        avgSimilarity,
      },
    }

    return NextResponse.json({ instructor: formatted })
  } catch (error) {
    console.error("Admin instructor detail error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil detail instruktur" },
      { status: 500 }
    )
  }
}
