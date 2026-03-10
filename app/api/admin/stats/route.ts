import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data statistik" },
      { status: 500 }
    )
  }
}
