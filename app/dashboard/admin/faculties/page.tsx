import type { Metadata } from "next"
import { AdminFacultiesPage } from "@/components/dashboard/admin/faculties/faculties-page"

export const metadata: Metadata = {
  title: "Faculty Management - Admin Dashboard - Turnitin Campus",
  description: "Manage faculties and study programs",
}

export default function AdminFaculties() {
  return <AdminFacultiesPage />
}

