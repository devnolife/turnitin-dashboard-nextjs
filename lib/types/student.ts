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
  email: string
  studentId: string
  facultyId: string
  programId: string
  instructorId: string | null
  examStage: ExamStage
  thesisTitle: string | null
  examDate: string | null
  submittedAt: string
  lastActive: string
  status: "active" | "inactive" | "suspended"
  whatsappNumber: string
  turnitinResults: TurnitinResult[]
}
