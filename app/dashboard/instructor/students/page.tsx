import type { Metadata } from "next"
import { InstructorStudentsPage } from "@/components/dashboard/instructor/students/students-page"

export const metadata: Metadata = {
  title: "Student Management - Instructor Dashboard - Perpusmu",
  description: "View and manage students under your supervision",
}

export default function InstructorStudents() {
  return <InstructorStudentsPage />
}

