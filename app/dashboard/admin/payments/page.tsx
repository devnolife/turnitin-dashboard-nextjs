"use client"

import { CreditCard } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { AdminPayments } from "@/components/dashboard/admin/payments"

export default function AdminPaymentsPage() {
  return (
    <DashboardMainCard
      title="Pembayaran"
      subtitle="Kelola transaksi dan pembayaran mahasiswa 💳"
      icon={CreditCard}
    >
      <AdminPayments />
    </DashboardMainCard>
  )
}
