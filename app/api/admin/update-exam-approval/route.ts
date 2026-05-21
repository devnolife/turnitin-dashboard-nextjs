import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

const examApprovalSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi"),
  approvalStatus: z.enum(["APPROVED", "REJECTED"], {
    message: "Status harus APPROVED atau REJECTED",
  }),
})

// Pilih instruktur dengan beban mahasiswa paling sedikit (load-balanced).
// Jika seri, ambil yang paling lama belum dapat mahasiswa (atau terbaru kalau belum punya sama sekali).
async function pickInstructorForNewStudent(): Promise<string | null> {
  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    select: {
      id: true,
      createdAt: true,
      _count: { select: { students: true } },
    },
  })
  if (instructors.length === 0) return null
  instructors.sort((a, b) => {
    if (a._count.students !== b._count.students) {
      return a._count.students - b._count.students
    }
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
  return instructors[0].id
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const body = await request.json()
    const parsed = examApprovalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }
    const { userId, approvalStatus } = parsed.data

    const examDetail = await prisma.examDetail.update({
      where: { userId },
      data: {
        approvalStatus,
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

    // Jika disetujui, otomatis assign ke instruktur terakhir
    let assignedInstructor = null
    if (approvalStatus === "APPROVED") {
      const instructorId = await pickInstructorForNewStudent()
      if (instructorId) {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { instructorId },
          select: {
            instructor: {
              select: { id: true, name: true },
            },
          },
        })
        assignedInstructor = updated.instructor
      }
    }

    return NextResponse.json({
      message: `Akun berhasil ${approvalStatus === "APPROVED" ? "disetujui" : "ditolak"}`,
      examDetail,
      assignedInstructor,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Update exam approval error:", error)
    return NextResponse.json(
      { message: "Gagal memperbarui status persetujuan akun" },
      { status: 500 }
    )
  }
}
