import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const { id } = await params

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { message: "ID mahasiswa tidak valid" },
        { status: 400 }
      )
    }

    const student = await prisma.user.findUnique({
      where: { id, role: "STUDENT" },
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
            id: true,
            thesisTitle: true,
            examType: true,
            approvalStatus: true,
            submittedAt: true,
            reviewedAt: true,
          },
        },
        submissions: {
          select: {
            id: true,
            documentTitle: true,
            documentUrl: true,
            similarityScore: true,
            status: true,
            reportUrl: true,
            reviewedBy: true,
            reviewedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            paidAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { message: "Mahasiswa tidak ditemukan" },
        { status: 404 }
      )
    }

    const submissionsCount = student.submissions.length
    const reviewedCount = student.submissions.filter((s) => s.status === "REVIEWED").length
    const flaggedCount = student.submissions.filter((s) => s.status === "FLAGGED").length
    const pendingCount = student.submissions.filter((s) => s.status === "PENDING").length
    const scores = student.submissions
      .filter((s) => s.similarityScore !== null)
      .map((s) => s.similarityScore as number)
    const avgSimilarity = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0

    const examTypeLabels: Record<string, string> = {
      PROPOSAL_DEFENSE: "Ujian Proposal",
      RESULTS_DEFENSE: "Ujian Hasil",
      FINAL_DEFENSE: "Ujian Tutup",
    }

    const statusLabels: Record<string, string> = {
      PENDING: "Menunggu",
      REVIEWED: "Direview",
      FLAGGED: "Ditandai",
    }

    const approvalLabels: Record<string, string> = {
      PENDING: "Menunggu Persetujuan",
      APPROVED: "Disetujui",
      REJECTED: "Ditolak",
    }

    const paymentLabels: Record<string, string> = {
      PENDING: "Menunggu",
      PROCESSING: "Diproses",
      COMPLETED: "Lunas",
      FAILED: "Gagal",
    }

    const formatted = {
      id: student.id,
      name: student.name,
      nim: student.nim || student.username,
      email: student.email || "-",
      hp: student.hp || student.whatsappNumber || "-",
      prodi: student.prodi || "-",
      hasCompletedPayment: student.hasCompletedPayment,
      createdAt: student.createdAt,
      examDetail: student.examDetails
        ? {
            ...student.examDetails,
            examTypeLabel: examTypeLabels[student.examDetails.examType] || student.examDetails.examType,
            approvalLabel: approvalLabels[student.examDetails.approvalStatus] || student.examDetails.approvalStatus,
          }
        : null,
      submissions: student.submissions.map((s) => ({
        id: s.id,
        title: s.documentTitle,
        documentUrl: s.documentUrl,
        similarity: s.similarityScore,
        status: s.status,
        statusLabel: statusLabels[s.status] || s.status,
        feedback: s.reportUrl,
        reviewedBy: s.reviewedBy,
        reviewedAt: s.reviewedAt,
        createdAt: s.createdAt,
      })),
      payments: student.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        statusLabel: paymentLabels[p.status] || p.status,
        method: p.paymentMethod,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      stats: {
        submissionsCount,
        reviewedCount,
        flaggedCount,
        pendingCount,
        avgSimilarity,
      },
    }

    return NextResponse.json({ student: formatted })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Admin student detail error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil detail mahasiswa" },
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
    const { instructorId } = body

    const student = await prisma.user.findUnique({
      where: { id, role: "STUDENT" },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ message: "Mahasiswa tidak ditemukan" }, { status: 404 })
    }

    if (instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId, role: "INSTRUCTOR" },
        select: { id: true, name: true },
      })
      if (!instructor) {
        return NextResponse.json({ message: "Instruktur tidak ditemukan" }, { status: 404 })
      }

      await prisma.user.update({
        where: { id },
        data: { instructorId },
      })

      return NextResponse.json({
        message: `Mahasiswa berhasil di-assign ke ${instructor.name}`,
        instructorId: instructor.id,
        instructorName: instructor.name,
      })
    } else {
      // Unassign
      await prisma.user.update({
        where: { id },
        data: { instructorId: null },
      })
      return NextResponse.json({ message: "Instruktur berhasil dilepas", instructorId: null, instructorName: null })
    }
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Assign instructor error:", error)
    return NextResponse.json({ message: "Gagal mengubah instruktur" }, { status: 500 })
  }
}
