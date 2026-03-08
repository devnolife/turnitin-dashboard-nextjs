"use client"

import { Clock, Upload, FileText, Users, CheckCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Course } from "./course-detail-types"

interface CourseDetailOverviewProps {
  course: Course
  programName: string
  onUploadMaterial: () => void
  onCreateAssignment: () => void
  onManageStudents: () => void
  onGradeSubmissions: () => void
  onPostAnnouncement: () => void
}

export function CourseDetailOverview({
  course,
  programName,
  onUploadMaterial,
  onCreateAssignment,
  onManageStudents,
  onGradeSubmissions,
  onPostAnnouncement,
}: CourseDetailOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
            <CardDescription>Details and statistics about this course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{course.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Program</h3>
                  <p className="mt-1">{programName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1">
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
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{course.studentCount}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{course.materialsCount}</div>
                  <div className="text-sm text-muted-foreground">Materials</div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{course.assignmentsCount}</div>
                  <div className="text-sm text-muted-foreground">Assignments</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              Last updated {course.lastUpdated}
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" onClick={onUploadMaterial}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Material
            </Button>
            <Button className="w-full justify-start" onClick={onCreateAssignment}>
              <FileText className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
            <Button className="w-full justify-start" onClick={onManageStudents}>
              <Users className="mr-2 h-4 w-4" />
              Manage Students
            </Button>
            <Button className="w-full justify-start" onClick={onGradeSubmissions}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Grade Submissions
            </Button>
            <Button className="w-full justify-start" onClick={onPostAnnouncement}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Post Announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
