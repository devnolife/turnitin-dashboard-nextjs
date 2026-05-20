import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const [totalUsers, totalStudents, totalInstructors, totalSubmissions, totalPayments, completedPayments] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "INSTRUCTOR" } }),
        prisma.submission.count(),
        prisma.payment.count(),
        prisma.payment.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
      ])

    const pendingExamApprovals = await prisma.examDetail.count({
      where: { approvalStatus: "PENDING" },
    })

    return NextResponse.json({
      totalUsers,
      totalStudents,
      totalInstructors,
      totalSubmissions,
      totalPayments,
      totalRevenue: completedPayments._sum.amount ?? 0,
      pendingExamApprovals,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Admin stats error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data statistik" },
      { status: 500 }
    )
  }
}
