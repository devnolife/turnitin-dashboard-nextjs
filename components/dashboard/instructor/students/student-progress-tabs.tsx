"use client"

import {
  FileText,
  CheckCircle,
  MessageSquare,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Student } from "@/lib/store/student-store"

interface StudentProgressTabsProps {
  student: Student
  formatExamStage?: (stage: string) => string
  formatDate?: (dateString: string | null) => string
}

export function StudentProgressTabs({
  student,
  formatExamStage,
  formatDate,
}: StudentProgressTabsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Progress & Info</CardTitle>
        <CardDescription>Track progress and submission data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Submission Info</TabsTrigger>
            <TabsTrigger value="notes">Instructor Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="rounded-md border p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{student.submissionsCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reviewed</p>
                  <p className="text-2xl font-bold">{student.reviewedCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Flagged</p>
                  <p className="text-2xl font-bold">{student.flaggedCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Similarity</p>
                  <p className="text-2xl font-bold">{student.avgSimilarity}%</p>
                </div>
              </div>

              {student.examDetail && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Thesis Title</h3>
                  <p className="font-medium">{student.examDetail.thesisTitle}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Type: {student.examDetail.examType}</span>
                    <span>Status: {student.examDetail.approvalStatus}</span>
                  </div>
                </div>
              )}

              {!student.examDetail && student.submissionsCount === 0 && (
                <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">No Submissions Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No similarity reports are available for this student.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="text-lg font-medium mb-4">Instructor Notes</h3>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-medium">No Notes Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add notes to track student progress.
                </p>
              </div>

              <div className="mt-6">
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Add New Note
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
