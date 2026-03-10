import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const { userId, thesisTitle, examType } = await request.json()

  if (!userId) {
    return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 })
  }

  const examTypeMap: Record<string, string> = {
    proposal_defense: "PROPOSAL_DEFENSE",
    results_defense: "RESULTS_DEFENSE",
    final_defense: "FINAL_DEFENSE",
  }

  const examDetail = await prisma.examDetail.upsert({
    where: { userId },
    update: {
      thesisTitle,
      examType: examTypeMap[examType] as "PROPOSAL_DEFENSE" | "RESULTS_DEFENSE" | "FINAL_DEFENSE",
    },
    create: {
      userId,
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
}
