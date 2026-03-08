"use client"

import { Users, BookOpen, FileCheck, CheckCircle, BarChart, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardQuickActionsProps {
  onNavigate: (path: string) => void
}

export function DashboardQuickActions({ onNavigate }: DashboardQuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used actions and tools</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/students")}
          >
            <Users className="h-6 w-6 text-primary-dark" />
            <span>Manage Students</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/courses")}
          >
            <BookOpen className="h-6 w-6 text-primary-dark" />
            <span>Manage Courses</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/submissions")}
          >
            <FileCheck className="h-6 w-6 text-primary-dark" />
            <span>Review Submissions</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/grades")}
          >
            <CheckCircle className="h-6 w-6 text-primary-dark" />
            <span>Grade Assignments</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/analytics")}
          >
            <BarChart className="h-6 w-6 text-primary-dark" />
            <span>View Analytics</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/messages")}
          >
            <MessageSquare className="h-6 w-6 text-primary-dark" />
            <span>Send Messages</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
