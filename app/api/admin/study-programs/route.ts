import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get("facultyId")

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
    console.error("Study programs error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data program studi" },
      { status: 500 }
    )
  }
}
