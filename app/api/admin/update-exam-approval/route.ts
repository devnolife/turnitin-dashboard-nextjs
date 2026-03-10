import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, approvalStatus } = body

    if (!userId || !approvalStatus) {
      return NextResponse.json(
        { message: "userId dan approvalStatus harus diisi" },
        { status: 400 }
      )
    }

    const validStatuses = ["APPROVED", "REJECTED"]
    if (!validStatuses.includes(approvalStatus.toUpperCase())) {
      return NextResponse.json(
        { message: "Status tidak valid. Gunakan APPROVED atau REJECTED." },
        { status: 400 }
      )
    }

    const examDetail = await prisma.examDetail.update({
      where: { userId },
      data: {
        approvalStatus: approvalStatus.toUpperCase(),
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            nim: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: `Ujian berhasil ${approvalStatus.toUpperCase() === "APPROVED" ? "disetujui" : "ditolak"}`,
      examDetail,
    })
  } catch (error) {
    console.error("Update exam approval error:", error)
    return NextResponse.json(
      { message: "Gagal memperbarui status persetujuan ujian" },
      { status: 500 }
    )
  }
}
