import type { Metadata } from "next"
import { StudentComplaintPage } from "@/components/dashboard/student/complaint-page"

export const metadata: Metadata = {
  title: "Pengaduan - Perpusmu",
  description: "Kirim pengaduan atau saran kepada admin",
}

export default function Page() {
  return <StudentComplaintPage />
}
