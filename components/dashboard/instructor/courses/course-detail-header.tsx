"use client"

import { ArrowLeft, Edit, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Course } from "./course-detail-types"

interface CourseDetailHeaderProps {
  course: Course
  onBack: () => void
  onEdit: () => void
  onSettings: () => void
}

export function CourseDetailHeader({ course, onBack, onEdit, onSettings }: CourseDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">{course.title}</h1>
          <p className="text-muted-foreground">
            {course.code} • {course.semester} {course.year}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Course
        </Button>
        <Button variant="outline" onClick={onSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}
