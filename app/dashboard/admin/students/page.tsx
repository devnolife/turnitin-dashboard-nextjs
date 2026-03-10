import type { Metadata } from "next"
import { AdminStudentsPage } from "@/components/dashboard/admin/students/students-page"

export const metadata: Metadata = {
  title: "Student Management - Admin Dashboard - Perpusmu",
  description: "Manage and monitor student accounts, exam stages, and submissions",
}

export default function AdminStudents() {
  return <AdminStudentsPage />
}

