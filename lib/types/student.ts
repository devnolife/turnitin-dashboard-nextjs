export type ExamStage = "applicant" | "proposal_exam" | "results_exam" | "final_exam" | "graduated"

export interface TurnitinResult {
  id: string
  studentId: string
  examStage: ExamStage
  documentTitle: string
  similarityScore: number
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  status: "pending" | "reviewed" | "flagged"
  reportUrl: string
  documentUrl: string
  comments: string | null
}

export interface Student {
  id: string
  name: string
  nim: string
  email: string | null
  hp: string | null
  prodi: string
  hasCompletedPayment: boolean
  createdAt: string
  examDetail: { thesisTitle: string; examType: string; approvalStatus: string } | null
  submissionsCount: number
  reviewedCount: number
  flaggedCount: number
  avgSimilarity: number
  lastSubmissionAt: string | null
  paymentStatus: string
}
