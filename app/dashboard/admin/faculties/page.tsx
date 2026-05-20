import type { Metadata } from "next"
import { AcademicManagementPage } from "@/components/dashboard/admin/faculties/academic-management-page"

export const metadata: Metadata = {
  title: "Fakultas & Program Studi - Dashboard Admin - Perpusmu",
  description: "Kelola fakultas, program studi, dan aturan similarity",
}

export default function AdminFaculties() {
  return <AcademicManagementPage />
}

