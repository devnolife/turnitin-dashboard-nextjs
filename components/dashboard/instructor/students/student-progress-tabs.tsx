"use client"

import {
  FileText,
  CheckCircle,
  Eye,
  MessageSquare,
  AlertCircle,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { type Student, type ExamStage } from "@/lib/store/student-store"

interface StudentProgressTabsProps {
  student: Student
  formatExamStage: (stage: ExamStage) => string
  formatDate: (dateString: string | null) => string
}

export function StudentProgressTabs({
  student,
  formatExamStage,
  formatDate,
}: StudentProgressTabsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Progress & Feedback</CardTitle>
        <CardDescription>Track progress and provide feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="turnitin" className="space-y-4">
          <TabsList>
            <TabsTrigger value="turnitin">Perpusmu Results</TabsTrigger>
            <TabsTrigger value="feedback">Feedback History</TabsTrigger>
            <TabsTrigger value="notes">Instructor Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="turnitin" className="space-y-4">
            {student.turnitinResults.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <div className="p-4">
                  <h3 className="text-lg font-medium">Similarity Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Plagiarism check results for submitted documents
                  </p>
                </div>

                <div className="border-t">
                  <div className="divide-y">
                    {student.turnitinResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4">
                        <div>
                          <div className="font-medium">{result.documentTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatExamStage(result.examStage)} • Submitted on {formatDate(result.submittedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              result.similarityScore < 15
                                ? "outline"
                                : result.similarityScore < 30
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {result.similarityScore}% Similarity
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-3 w-3" />
                            View Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-md border p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-medium">No Perpusmu results</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No similarity reports are available for this student.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <div className="p-4">
                <h3 className="text-lg font-medium">Feedback History</h3>
                <p className="text-sm text-muted-foreground">Previous feedback provided to the student</p>
              </div>

              <div className="border-t">
                <div className="divide-y">
                  {student.turnitinResults
                    .filter((result) => result.comments)
                    .map((result) => (
                      <div key={result.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{result.documentTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.reviewedAt ? formatDate(result.reviewedAt) : "Not reviewed"}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">{result.comments}</div>
                      </div>
                    ))}

                  {student.turnitinResults.filter((result) => result.comments).length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
                      <h3 className="mt-4 text-lg font-medium">No Feedback Yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You haven't provided any feedback to this student yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="text-lg font-medium mb-4">Instructor Notes</h3>
              <div className="space-y-4">
                <div className="rounded-md border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Progress Note</span>
                    <span className="text-xs text-muted-foreground ml-auto">Added on April 10, 2025</span>
                  </div>
                  <p className="text-sm">
                    Student is making good progress on their thesis. The literature review section needs more
                    work, but the methodology is well-developed. Recommended additional sources for the
                    theoretical framework.
                  </p>
                </div>

                <div className="rounded-md border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Meeting Note</span>
                    <span className="text-xs text-muted-foreground ml-auto">Added on March 25, 2025</span>
                  </div>
                  <p className="text-sm">
                    Met with student to discuss research direction. Agreed on timeline for completing the first
                    draft by end of May. Student seems motivated and has a clear understanding of the research
                    objectives.
                  </p>
                </div>
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
