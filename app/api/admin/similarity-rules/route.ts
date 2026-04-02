import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const body = await request.json()
    const { studyProgramId, ruleType, rules } = body

    if (!studyProgramId || !ruleType || !Array.isArray(rules)) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      )
    }

    // Delete existing rules for this program with this type
    await prisma.similarityRule.deleteMany({
      where: { studyProgramId, ruleType },
    })

    // Create new rules
    if (rules.length > 0) {
      await prisma.similarityRule.createMany({
        data: rules.map((rule: { label: string; maxPercentage: number }, index: number) => ({
          studyProgramId,
          ruleType,
          label: rule.label,
          maxPercentage: rule.maxPercentage,
          orderIndex: index,
        })),
      })
    }

    const updatedProgram = await prisma.studyProgram.findUnique({
      where: { id: studyProgramId },
      include: {
        similarityRules: {
          orderBy: { orderIndex: "asc" },
        },
      },
    })

    return NextResponse.json({
      message: "Aturan similarity berhasil disimpan",
      program: updatedProgram,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    console.error("Similarity rules error:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan aturan similarity" },
      { status: 500 }
    )
  }
}
