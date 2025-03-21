import type { Metadata } from "next"
import { InstructorCoursesPage } from "@/components/dashboard/instructor/courses/instructor-courses-page"

export const metadata: Metadata = {
  title: "Course Management - Instructor Dashboard - Turnitin Campus",
  description: "Manage your courses, materials, and assignments",
}

export default function CoursesPage() {
  return <InstructorCoursesPage />
}

