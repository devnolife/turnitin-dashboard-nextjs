import type { Metadata } from "next"
import { AnalyticsPage } from "@/components/dashboard/instructor/analytics/analytics-page"

export const metadata: Metadata = {
  title: "Analytics - Instructor Dashboard - Turnitin Campus",
  description: "View analytics and insights about your courses and students",
}

export default function InstructorAnalyticsPage() {
  return <AnalyticsPage />
}

