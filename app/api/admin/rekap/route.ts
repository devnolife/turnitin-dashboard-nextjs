import { NextRequest, NextResponse } from "next/server"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"
import { buildRekap } from "@/lib/rekap/build-rekap"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const params = request.nextUrl.searchParams
    const now = new Date()
    const month = Math.max(1, Math.min(12, parseInt(params.get("month") || String(now.getMonth() + 1))))
    const year = Math.max(2000, Math.min(2100, parseInt(params.get("year") || String(now.getFullYear()))))
    const studyProgramId = params.get("studyProgramId")
    const instructorId = params.get("instructorId")

    const bundle = await buildRekap({
      month,
      year,
      studyProgramId: studyProgramId || null,
      instructorId: instructorId || null,
    })

    const [studyPrograms, instructors] = await Promise.all([
      prisma.studyProgram.findMany({
        select: { id: true, name: true, degree: true },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "INSTRUCTOR" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ])

    return NextResponse.json({
      ...bundle,
      filters: { studyPrograms, instructors },
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.rekap.fetch_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat rekap" }, { status: 500 })
  }
}
