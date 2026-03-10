import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "perpusmu-secret-key-2024"
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { prodi: true, studyProgramId: true },
    })

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }

    let rules: unknown[] = []
    let programName: string | null = null
    let ruleType: string | null = null

    if (user.studyProgramId) {
      // User already linked to a study program
      const program = await prisma.studyProgram.findUnique({
        where: { id: user.studyProgramId },
        include: {
          similarityRules: { orderBy: { orderIndex: "asc" } },
          faculty: true,
        },
      })

      if (program) {
        rules = program.similarityRules
        programName = program.name
        ruleType = program.similarityRules[0]?.ruleType || null
      }
    } else if (user.prodi) {
      // Try to match by prodi name
      const program = await prisma.studyProgram.findFirst({
        where: {
          OR: [
            { name: { contains: user.prodi, mode: "insensitive" } },
            { name: { equals: user.prodi, mode: "insensitive" } },
          ],
        },
        include: {
          similarityRules: { orderBy: { orderIndex: "asc" } },
          faculty: true,
        },
      })

      if (program) {
        // Link user to this study program
        await prisma.user.update({
          where: { id: userId },
          data: { studyProgramId: program.id },
        })

        rules = program.similarityRules
        programName = program.name
        ruleType = program.similarityRules[0]?.ruleType || null
      }
    }

    return NextResponse.json({
      programName,
      ruleType,
      rules,
    })
  } catch (error) {
    console.error("My rules error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil aturan similarity" },
      { status: 500 }
    )
  }
}
