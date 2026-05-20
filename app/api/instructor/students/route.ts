import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR")
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {
      role: "STUDENT",
      instructorId: auth.userId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nim: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { prodi: { contains: search, mode: "insensitive" } },
      ]
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
      }
    })

    return NextResponse.json({ students: formatted })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Instructor students error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data mahasiswa" },
      { status: 500 }
    )
  }
}
