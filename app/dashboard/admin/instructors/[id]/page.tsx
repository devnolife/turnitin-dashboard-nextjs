import type { Metadata } from "next"
import { InstructorDetailPage } from "@/components/dashboard/admin/instructors/instructor-detail-page"

export const metadata: Metadata = {
  title: "Instructor Details - Admin Dashboard - Perpusmu",
  description: "View detailed instructor information and supervised students",
}

export default function InstructorDetail({ params }: { params: { id: string } }) {
  return <InstructorDetailPage instructorId={params.id} />
}

