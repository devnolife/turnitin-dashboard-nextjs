import type { Metadata } from "next"
import { StudentDetailPage } from "@/components/dashboard/admin/students/student-detail-page"

export const metadata: Metadata = {
  title: "Detail Mahasiswa - Dashboard Admin - Perpusmu",
  description: "Lihat dan kelola informasi detail mahasiswa",
}

export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <StudentDetailPage studentId={id} />
}

