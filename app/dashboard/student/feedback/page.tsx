"use client"

import { MessageSquare } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StudentFeedback } from "@/components/dashboard/student/feedback"

export default function StudentFeedbackPage() {
  return (
    <DashboardMainCard
      title="Umpan Balik"
      subtitle="Lihat feedback dari instruktur untuk pengiriman Anda 💬"
      icon={MessageSquare}
    >
      <StudentFeedback />
    </DashboardMainCard>
  )
}
