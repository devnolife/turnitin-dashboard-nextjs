import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

const similarityRuleSchema = z.object({
  studyProgramId: z.string().min(1, "Study program ID wajib diisi"),
  ruleType: z.string().min(1, "Rule type wajib diisi").max(50),
  rules: z.array(z.object({
    label: z.string().min(1, "Label wajib diisi").max(100, "Label maksimal 100 karakter"),
    maxPercentage: z.number().min(0, "Persentase minimal 0").max(100, "Persentase maksimal 100"),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const body = await request.json()
    const parsed = similarityRuleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      )
    }
    const { studyProgramId, ruleType, rules } = parsed.data

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
    logger.error("Similarity rules error:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan aturan similarity" },
      { status: 500 }
    )
  }
}
