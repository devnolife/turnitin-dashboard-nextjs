import type { Metadata } from "next"
import { AddCourseForm } from "@/components/dashboard/instructor/courses/add-course-form"

export const metadata: Metadata = {
  title: "Add New Course | Turnitin Campus",
  description: "Create a new course for your students",
}

export default function NewCoursePage() {
  return <AddCourseForm />
}

