import type { Metadata } from "next"
import { InstructorDashboardClient } from "@/components/dashboard/instructor/instructor-dashboard-client"

export const metadata: Metadata = {
  title: "Instructor Dashboard - Perpusmu",
  description: "Pantau pengiriman Perpusmu dan awasi mahasiswa",
}

export default function InstructorDashboardPage() {
  return <InstructorDashboardClient />
}

