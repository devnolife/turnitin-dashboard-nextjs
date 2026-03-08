export interface Course {
  id: string
  title: string
  code: string
  description: string
  programId: string
  semester: string
  year: number
  status: "active" | "upcoming" | "archived"
  studentCount: number
  materialsCount: number
  assignmentsCount: number
  lastUpdated: string
}

export interface Material {
  id: string
  title: string
  type: "document" | "video" | "link" | "presentation"
  description: string
  uploadedAt: string
  fileSize?: string
  downloadUrl: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: "draft" | "published" | "closed"
  submissionCount: number
  maxScore: number
}

export interface Student {
  id: string
  name: string
  email: string
  studentId: string
  status: "active" | "inactive"
  lastActive: string
  submissionCount: number
  averageScore: number | null
}

export interface NewMaterialForm {
  title: string
  type: string
  description: string
  file: File | null
}

export interface NewAssignmentForm {
  title: string
  description: string
  dueDate: string
  maxScore: number
}
