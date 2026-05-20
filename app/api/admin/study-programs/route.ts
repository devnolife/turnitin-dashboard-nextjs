import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const { searchParams } = new URL(request.url)
    const rawFacultyId = searchParams.get("facultyId")
    const facultyId = rawFacultyId ? rawFacultyId.trim().slice(0, 200) : null

    if (rawFacultyId !== null && (!facultyId || facultyId.length === 0)) {
      return NextResponse.json(
        { message: "facultyId tidak valid" },
        { status: 400 }
      )
    }

    const where = facultyId ? { facultyId } : {}

    const programs = await prisma.studyProgram.findMany({
      where,
      include: {
        faculty: true,
        similarityRules: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
    })

    const faculties = await prisma.faculty.findMany({
      include: {
        _count: {
          select: { programs: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ programs, faculties })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Study programs error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data program studi" },
      { status: 500 }
    )
  }
}
