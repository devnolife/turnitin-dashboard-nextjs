import type { Metadata } from "next"
import { AdminComplaintsPage } from "@/components/dashboard/admin/complaints-page"

export const metadata: Metadata = {
  title: "Pengaduan - Dashboard Admin - Perpusmu",
  description: "Kelola pengaduan dari mahasiswa",
}

export default function Page() {
  return <AdminComplaintsPage />
}
