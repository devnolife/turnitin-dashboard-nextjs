"use client"

import { BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { CourseCard } from "./course-card"
import type { Course } from "./instructor-courses-page"

export interface CoursesGridProps {
  filteredCourses: Course[]
  totalCourses: number
  getProgramName: (programId: string) => string
  onViewCourse: (courseId: string) => void
  onEditCourse: (courseId: string) => void
  onDeleteCourse: (courseId: string) => void
  onCreateCourse: () => void
}

export function CoursesGrid({
  filteredCourses,
  totalCourses,
  getProgramName,
  onViewCourse,
  onEditCourse,
  onDeleteCourse,
  onCreateCourse,
}: CoursesGridProps) {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredCourses.length > 0 ? (
        filteredCourses.map((course) => (
          <StaggerItem key={course.id}>
            <CourseCard
              course={course}
              getProgramName={getProgramName}
              onView={onViewCourse}
              onEdit={onEditCourse}
              onDelete={onDeleteCourse}
            />
          </StaggerItem>
        ))
      ) : (
        <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-medium">No Courses Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {totalCourses === 0
              ? "You haven't created any courses yet."
              : "No courses match your current filters."}
          </p>
          {totalCourses === 0 && (
            <Button className="mt-4" onClick={onCreateCourse}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Course
            </Button>
          )}
        </div>
      )}
    </StaggerContainer>
  )
}
