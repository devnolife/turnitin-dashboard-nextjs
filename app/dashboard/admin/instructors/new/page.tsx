import type { Metadata } from "next"
import { AddInstructorPage } from "@/components/dashboard/admin/instructors/add-instructor-page"

export const metadata: Metadata = {
  title: "Add Instructor - Admin Dashboard - Turnitin Campus",
  description: "Add a new instructor to the system",
}

export default function AddInstructor() {
  return <AddInstructorPage />
}

