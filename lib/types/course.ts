export interface Course {
  id: string
  title: string
  code: string
  description: string
  startDate: string
  endDate: string
  enrolledStudents: number
  assignments: Assignment[]
  materials: Material[]
  announcements: Announcement[]
}

export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  points: number
  status: "draft" | "published" | "closed"
  submissions: number
  graded: number
}

export interface Material {
  id: string
  title: string
  type: "document" | "video" | "link" | "other"
  url: string
  uploadDate: string
  size?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
}
