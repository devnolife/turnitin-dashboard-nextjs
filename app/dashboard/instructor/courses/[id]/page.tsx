import type { Metadata } from "next"
import { CourseDetailPage } from "@/components/dashboard/instructor/courses/course-detail-page"

export const metadata: Metadata = {
  title: "Course Details - Instructor Dashboard - Turnitin Campus",
  description: "View and manage course details, materials, and assignments",
}

export default function CourseDetail({ params }: { params: { id: string } }) {
  return <CourseDetailPage courseId={params.id} />
}

