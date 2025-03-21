import type { Metadata } from "next"
import { InstructorDashboardClient } from "@/components/dashboard/instructor/instructor-dashboard-client"

export const metadata: Metadata = {
  title: "Instructor Dashboard - Turnitin Campus",
  description: "Manage your courses, students, and teaching activities",
}

export default function InstructorDashboardPage() {
  return <InstructorDashboardClient />
}

