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
  nim?: string
  hp?: string
  email?: string
  prodi?: string
  hasCompletedPayment: boolean
  whatsappNumber?: string
  mustChangePassword?: boolean
  accountStatus?: "ACTIVE" | "INACTIVE" | "GRADUATED"
  graduatedAt?: string | null
  tourCompletedAt?: string | null
  examDetails?: ExamDetails | null
  createdAt?: string
}
