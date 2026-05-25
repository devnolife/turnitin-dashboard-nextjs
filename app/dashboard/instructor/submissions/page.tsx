import type { Metadata } from "next"
import InstructorSubmissionsClient from "@/components/dashboard/instructor/submissions-client"

export const metadata: Metadata = {
  title: "Antrian Pengiriman - Instruktur - Perpusmu",
}

export default function Page() {
  return <InstructorSubmissionsClient />
}
