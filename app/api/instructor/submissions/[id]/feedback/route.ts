import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "perpusmu-secret-key-2024"
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }

    const { id: submissionId } = await params
    const body = await request.json()
    const { feedback, status, similarityScore } = body

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return NextResponse.json({ message: "Pengiriman tidak ditemukan" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      reviewedBy: userId,
      reviewedAt: new Date(),
    }

    if (status) updateData.status = status
    if (similarityScore !== undefined) updateData.similarityScore = Number(similarityScore)
    if (feedback) updateData.reportUrl = feedback // Store feedback in reportUrl field

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, username: true, nim: true },
        },
      },
    })

    return NextResponse.json({
      message: "Feedback berhasil disimpan",
      submission: updated,
    })
  } catch (error) {
    console.error("Submission feedback error:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan feedback" },
      { status: 500 }
    )
  }
}
