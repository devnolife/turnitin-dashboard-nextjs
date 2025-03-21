import type { Metadata } from "next"
import { StudentDetailPage } from "@/components/dashboard/admin/students/student-detail-page"

export const metadata: Metadata = {
  title: "Student Details - Admin Dashboard - Turnitin Campus",
  description: "View and manage detailed student information",
}

export default function StudentDetail({ params }: { params: { id: string } }) {
  return <StudentDetailPage studentId={params.id} />
}

