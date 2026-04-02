import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    const { thesisTitle, examType } = await request.json()

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
