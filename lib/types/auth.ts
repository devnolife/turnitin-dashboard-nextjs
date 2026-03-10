export type ExamType = "proposal_defense" | "results_defense" | "final_defense" | null

export interface ExamDetails {
  thesisTitle: string
  examType: ExamType
  submittedAt: string | null
  approvalStatus: "pending" | "approved" | "rejected" | null
}

export interface User {
  id: string
  username: string
  role: string
  name: string
  hasCompletedPayment: boolean
  whatsappNumber?: string
  examDetails?: ExamDetails | null
}
