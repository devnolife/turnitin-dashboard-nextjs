import type { Metadata } from "next"
import { SubmissionsPage } from "@/components/dashboard/instructor/submissions/submissions-page"

export const metadata: Metadata = {
  title: "Submissions - Instructor Dashboard - Perpusmu",
  description: "Tinjau dan berikan feedback pada pengiriman mahasiswa",
}

export default function InstructorSubmissionsPage() {
  return <SubmissionsPage />
}

