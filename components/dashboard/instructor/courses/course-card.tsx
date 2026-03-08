"use client"

import { BookOpen, MoreHorizontal, Edit, Trash, Eye, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { Course } from "./instructor-courses-page"

export interface CourseCardProps {
  course: Course
  getProgramName: (programId: string) => string
  onView: (courseId: string) => void
  onEdit: (courseId: string) => void
  onDelete: (courseId: string) => void
}

export function CourseCard({ course, getProgramName, onView, onEdit, onDelete }: CourseCardProps) {
  return (
    <Card className="hover-lift">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{course.title}</CardTitle>
            <CardDescription>{course.code}</CardDescription>
          </div>
          <Badge
            variant={
              course.status === "active"
                ? "default"
                : course.status === "upcoming"
                  ? "secondary"
                  : "outline"
            }
          >
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <BookOpen className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>{getProgramName(course.programId)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>
                {course.semester} {course.year}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-muted p-2">
              <div className="text-lg font-medium">{course.studentCount}</div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="text-lg font-medium">{course.materialsCount}</div>
              <div className="text-xs text-muted-foreground">Materials</div>
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="text-lg font-medium">{course.assignmentsCount}</div>
              <div className="text-xs text-muted-foreground">Assignments</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          Updated {course.lastUpdated}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(course.id)}>
            <Eye className="mr-1 h-3 w-3" />
            View
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(course.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Course
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(course.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(course.id)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
}
