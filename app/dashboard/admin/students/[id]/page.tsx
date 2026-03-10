import type { Metadata } from "next"
import { StudentDetailPage } from "@/components/dashboard/admin/students/student-detail-page"

export const metadata: Metadata = {
  title: "Detail Mahasiswa - Dashboard Admin - Perpusmu",
  description: "Lihat dan kelola informasi detail mahasiswa",
}

export default function StudentDetail({ params }: { params: { id: string } }) {
  return <StudentDetailPage studentId={params.id} />
}

