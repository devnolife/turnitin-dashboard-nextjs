"use client"

import { FileBarChart } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { RekapPage } from "@/components/dashboard/admin/rekap/rekap-page"

export default function AdminRekapPage() {
  return (
    <DashboardMainCard
      title="Rekap Plagiasi"
      subtitle="Daftar hasil pengecekan Turnitin & rekap per instruktur 📈"
      icon={FileBarChart}
    >
      <RekapPage />
    </DashboardMainCard>
  )
}
