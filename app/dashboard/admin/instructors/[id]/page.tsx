import type { Metadata } from "next"
import { InstructorDetailPage } from "@/components/dashboard/admin/instructors/instructor-detail-page"

export const metadata: Metadata = {
  title: "Instructor Details - Admin Dashboard - Perpusmu",
  description: "View detailed instructor information and supervised students",
}

export default async function InstructorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InstructorDetailPage instructorId={id} />
}

