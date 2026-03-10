"use client"

import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  MessageSquare,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { type Student, type TurnitinResult, type ExamStage } from "@/lib/store/student-store"

export interface StudentSubmissionsTabProps {
  student: Student
  formatExamStage: (stage: ExamStage) => string
  formatDate: (dateString: string | null) => string
}

export function TurnitinResultsContent({ student, formatExamStage, formatDate }: StudentSubmissionsTabProps) {
  return (
    <>
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

                    {result.examStage === "proposal_exam" && student.examStage === "final_exam" && (
                      <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-3 w-3" />
                        Transfer to Final
                      </Button>
                    )}
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
    </>
  )
}

export function SubmissionsContent({ student }: { student: Student }) {
  return (
    <>
      {student.examStage !== "applicant" ? (
        <div className="rounded-md border overflow-x-auto">
          <div className="p-4">
            <h3 className="text-lg font-medium">Recent Submissions</h3>
            <p className="text-sm text-muted-foreground">
              The student&apos;s most recent document submissions
            </p>
          </div>

          <div className="border-t">
            <div className="divide-y">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">
                      {["Chapter Draft", "Literature Review", "Methodology Section"][i]}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Submitted {["2 days ago", "1 week ago", "2 weeks ago"][i]}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={["success", "secondary", "outline"][i] as any}>
                      {["Graded", "Pending", "Draft"][i]}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-3 w-3" />
                      Download
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
          <h3 className="mt-4 text-lg font-medium">No Submissions Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This student has not submitted any documents yet.
          </p>
        </div>
      )}
    </>
  )
}

export interface FeedbackContentProps {
  student: Student
  formatDate: (dateString: string | null) => string
}

export function FeedbackContent({ student, formatDate }: FeedbackContentProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <div className="p-4">
        <h3 className="text-lg font-medium">Instructor Feedback</h3>
        <p className="text-sm text-muted-foreground">Feedback provided to the student</p>
      </div>

      {student.examStage !== "applicant" ? (
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
                  No feedback has been provided to this student yet.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium">No Feedback Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No feedback has been provided to this student yet.
          </p>
        </div>
      )}
    </div>
  )
}

export interface ExamInfoCardProps {
  student: Student
  formatExamStage: (stage: ExamStage) => string
  getExamStageBadgeVariant: (stage: ExamStage) => string
  formatDate: (dateString: string | null) => string
}

export function ExamInfoCard({ student, formatExamStage, getExamStageBadgeVariant, formatDate }: ExamInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Information</CardTitle>
        <CardDescription>Details about the student&apos;s thesis and exam</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Thesis Title</h3>
          <p className="text-lg font-medium">{student.thesisTitle || "No thesis title submitted yet"}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Exam Stage</h3>
            <div className="flex items-center gap-2">
              <Badge variant={getExamStageBadgeVariant(student.examStage) as any}>
                {formatExamStage(student.examStage)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Exam Date</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(student.examDate)}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Submission History</h3>
          <div className="rounded-md border p-4">
            <StaggerContainer className="space-y-4">
              {student.examStage !== "applicant" ? (
                <>
                  <StaggerItem>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">Thesis Draft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Submitted on {formatDate(student.submittedAt)}
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">Research Proposal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Submitted on {formatDate(student.submittedAt)}
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </StaggerItem>

                  {(student.examStage === "results_exam" ||
                    student.examStage === "final_exam" ||
                    student.examStage === "graduated") && (
                    <StaggerItem>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">Research Results</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Submitted on {formatDate(student.submittedAt)}
                          </span>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </StaggerItem>
                  )}

                  {(student.examStage === "final_exam" || student.examStage === "graduated") && (
                    <StaggerItem>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">Final Thesis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Submitted on {formatDate(student.submittedAt)}
                          </span>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </StaggerItem>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">No Submissions Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This student has not submitted any documents yet.
                  </p>
                </div>
              )}
            </StaggerContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
