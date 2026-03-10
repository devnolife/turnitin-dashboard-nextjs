import type { Metadata } from "next"
import StudentDashboardClientPage from "./StudentDashboardClientPage"

export const metadata: Metadata = {
  title: "Student Dashboard - Perpusmu",
  description: "Kelola pengiriman Perpusmu dan lihat umpan balik",
}

export default function StudentDashboardPage() {
  return <StudentDashboardClientPage />
}

