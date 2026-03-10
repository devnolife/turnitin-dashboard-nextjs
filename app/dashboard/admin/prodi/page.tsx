import type { Metadata } from "next"
import { AdminProdiPage } from "@/components/dashboard/admin/prodi/prodi-page"

export const metadata: Metadata = {
  title: "Manajemen Program Studi - Dashboard Admin - Perpusmu",
  description: "Kelola program studi di seluruh fakultas",
}

export default function AdminProdi() {
  return <AdminProdiPage />
}
