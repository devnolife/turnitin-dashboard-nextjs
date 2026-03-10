import type { Metadata } from "next"
import { AdminFacultiesPage } from "@/components/dashboard/admin/faculties/faculties-page"

export const metadata: Metadata = {
  title: "Manajemen Fakultas - Dashboard Admin - Perpusmu",
  description: "Kelola fakultas dan program studi",
}

export default function AdminFaculties() {
  return <AdminFacultiesPage />
}

