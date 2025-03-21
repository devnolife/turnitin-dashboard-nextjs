import type { Metadata } from "next"
import StudentDashboardClientPage from "./StudentDashboardClientPage"

export const metadata: Metadata = {
  title: "Student Dashboard - Turnitin Campus",
  description: "Manage your Turnitin submissions and view feedback",
}

export default function StudentDashboardPage() {
  return <StudentDashboardClientPage />
}

