"use client"

import { FileText } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StudentSubmissions } from "@/components/dashboard/student/submissions"

export default function StudentSubmissionsPage() {
  return (
    <DashboardMainCard
      title="Pengiriman Saya"
      subtitle="Lihat semua dokumen yang telah Anda kirimkan 📄"
      icon={FileText}
    >
      <StudentSubmissions />
    </DashboardMainCard>
  )
}
