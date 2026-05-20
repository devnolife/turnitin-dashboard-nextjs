import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"
import { z } from "zod"

const examDetailSchema = z.object({
  thesisTitle: z.string().min(5, "Judul skripsi minimal 5 karakter").max(300, "Judul skripsi maksimal 300 karakter"),
  examType: z.enum(["proposal_defense", "results_defense", "final_defense"], {
    message: "Tipe ujian tidak valid",
  }),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "STUDENT")
    const body = await request.json()

    const parsed = examDetailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { thesisTitle, examType } = parsed.data

    const examTypeMap: Record<string, string> = {
      proposal_defense: "PROPOSAL_DEFENSE",
      results_defense: "RESULTS_DEFENSE",
      final_defense: "FINAL_DEFENSE",
    }

    const examDetail = await prisma.examDetail.upsert({
      where: { userId: auth.userId },
      update: {
        thesisTitle,
        examType: examTypeMap[examType] as "PROPOSAL_DEFENSE" | "RESULTS_DEFENSE" | "FINAL_DEFENSE",
      },
      create: {
        userId: auth.userId,
        thesisTitle,
        examType: examTypeMap[examType] as "PROPOSAL_DEFENSE" | "RESULTS_DEFENSE" | "FINAL_DEFENSE",
      },
    })

    return NextResponse.json({
      success: true,
      examDetails: {
        thesisTitle: examDetail.thesisTitle,
        examType: examDetail.examType.toLowerCase(),
        submittedAt: examDetail.submittedAt.toISOString(),
        approvalStatus: examDetail.approvalStatus.toLowerCase(),
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
