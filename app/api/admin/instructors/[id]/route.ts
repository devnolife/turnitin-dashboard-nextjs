import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { hashPassword, md5 } from "@/lib/auth/password"
import { logger } from "@/lib/logger"
import { z } from "zod"

const updateInstructorSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  hp: z.string().optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
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
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Admin instructor detail error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil detail instruktur" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const { id } = await params

    const body = await request.json()
    const parsed = updateInstructorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { id, role: "INSTRUCTOR" },
    })
    if (!existing) {
      return NextResponse.json(
        { message: "Instruktur tidak ditemukan" },
        { status: 404 }
      )
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.name) data.name = parsed.data.name
    if (parsed.data.email !== undefined) data.email = parsed.data.email || null
    if (parsed.data.hp !== undefined) {
      data.hp = parsed.data.hp || null
      data.whatsappNumber = parsed.data.hp || null
    }
    if (parsed.data.password) {
      data.password = md5(parsed.data.password)
      data.passwordHash = await hashPassword(parsed.data.password)
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, username: true, email: true, hp: true },
    })

    return NextResponse.json({
      message: "Instruktur berhasil diperbarui",
      instructor: updated,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Update instructor error:", error)
    return NextResponse.json(
      { message: "Gagal memperbarui instruktur" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const { id } = await params

    const existing = await prisma.user.findUnique({
      where: { id, role: "INSTRUCTOR" },
    })
    if (!existing) {
      return NextResponse.json(
        { message: "Instruktur tidak ditemukan" },
        { status: 404 }
      )
    }

    // Lepas semua mahasiswa yang di-assign ke instruktur ini
    await prisma.user.updateMany({
      where: { instructorId: id },
      data: { instructorId: null },
    })

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({
      message: "Instruktur berhasil dihapus",
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Delete instructor error:", error)
    return NextResponse.json(
      { message: "Gagal menghapus instruktur" },
      { status: 500 }
    )
  }
}
