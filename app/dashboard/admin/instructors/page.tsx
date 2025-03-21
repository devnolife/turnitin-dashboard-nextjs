import type { Metadata } from "next"
import { AdminInstructorsPage } from "@/components/dashboard/admin/instructors/instructors-page"

export const metadata: Metadata = {
  title: "Instructor Management - Admin Dashboard - Turnitin Campus",
  description: "Manage instructors and view their supervised students",
}

export default function AdminInstructors() {
  return <AdminInstructorsPage />
}

