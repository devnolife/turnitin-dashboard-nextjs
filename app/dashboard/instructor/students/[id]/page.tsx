import type { Metadata } from "next"
import { StudentDetailPage } from "@/components/dashboard/instructor/students/student-detail-page"

export const metadata: Metadata = {
  title: "Student Details - Instructor Dashboard - Perpusmu",
  description: "View detailed information about a student under your supervision",
}

export default function StudentDetail({ params }: { params: { id: string } }) {
  return <StudentDetailPage studentId={params.id} />
}

