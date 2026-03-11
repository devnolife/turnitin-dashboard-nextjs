import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const prodi = searchParams.get("prodi")

    const where: Record<string, unknown> = { role: "STUDENT" }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nim: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { prodi: { contains: search, mode: "insensitive" } },
      ]
    }

    if (prodi && prodi !== "all") {
      where.prodi = { contains: prodi, mode: "insensitive" }
    }

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        nim: true,
        email: true,
        hp: true,
        prodi: true,
        hasCompletedPayment: true,
        whatsappNumber: true,
        createdAt: true,
        examDetails: {
          select: {
            thesisTitle: true,
            examType: true,
            approvalStatus: true,
            submittedAt: true,
          },
        },
        submissions: {
          select: {
            id: true,
            similarityScore: true,
            status: true,
            createdAt: true,
          },
        },
        payments: {
          select: {
            status: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formatted = students.map((s) => {
      const submissionsCount = s.submissions.length
      const reviewedCount = s.submissions.filter((sub) => sub.status === "REVIEWED").length
      const flaggedCount = s.submissions.filter((sub) => sub.status === "FLAGGED").length
      const scores = s.submissions
        .filter((sub) => sub.similarityScore !== null)
        .map((sub) => sub.similarityScore as number)
      const avgSimilarity = scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0
      const lastSubmission = s.submissions.length > 0
        ? s.submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null

      return {
        id: s.id,
        name: s.name,
        nim: s.nim || s.username,
        email: s.email,
        hp: s.hp || s.whatsappNumber,
        prodi: s.prodi || "-",
        hasCompletedPayment: s.hasCompletedPayment,
        createdAt: s.createdAt,
        examDetail: s.examDetails || null,
        submissionsCount,
        reviewedCount,
        flaggedCount,
        avgSimilarity,
        lastSubmissionAt: lastSubmission?.createdAt || null,
        paymentStatus: s.payments[0]?.status || (s.hasCompletedPayment ? "COMPLETED" : "PENDING"),
      }
    })

    return NextResponse.json({ students: formatted })
  } catch (error) {
    console.error("Admin students error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data mahasiswa" },
      { status: 500 }
    )
  }
}
