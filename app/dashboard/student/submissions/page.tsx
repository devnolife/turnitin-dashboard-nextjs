import type { Metadata } from "next"
import StudentSubmissionsClient from "@/components/dashboard/student/submissions-client"

export const metadata: Metadata = {
  title: "Pengiriman Dokumen - Perpusmu",
}

export default function Page() {
  return <StudentSubmissionsClient />
}
