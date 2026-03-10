import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const where = status && status !== "all"
      ? { approvalStatus: status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" }
      : {}

    const examDetails = await prisma.examDetail.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            nim: true,
            prodi: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    })

    return NextResponse.json({ examDetails })
  } catch (error) {
    console.error("Exam approvals error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data persetujuan ujian" },
      { status: 500 }
    )
  }
}
