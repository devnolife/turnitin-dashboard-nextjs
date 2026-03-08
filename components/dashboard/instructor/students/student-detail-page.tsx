"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Download,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { type Student, type ExamStage, useStudentStore } from "@/lib/store/student-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { PageTransition, FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import React from "react"
import { StudentOverviewCard } from "./student-overview-card"
import { StudentProgressTabs } from "./student-progress-tabs"

interface StudentDetailPageProps {
  studentId: string
}

export function StudentDetailPage({ studentId }: StudentDetailPageProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { getStudentById } = useStudentStore()
  const { faculties } = useFacultyStore()

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we're using the mock data from the store
    const fetchStudent = async () => {
      setIsLoading(true)

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        const foundStudent = getStudentById(studentId)

        if (foundStudent) {
          // Check if this student is assigned to the current instructor
          if (foundStudent.instructorId === user?.id) {
            setStudent(foundStudent)
          } else {
            toast({
              variant: "destructive",
              title: "Access denied",
              description: "You don't have permission to view this student's details.",
            })
            router.push("/dashboard/instructor/students")
          }
        } else {
          toast({
            variant: "destructive",
            title: "Student not found",
            description: "The requested student could not be found.",
          })
          router.push("/dashboard/instructor/students")
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch student details. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if we have a studentId and we're not already loading
    if (studentId && !isLoading) {
      fetchStudent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]) // Only depend on studentId to prevent infinite loops

  // Format exam stage for display
  const formatExamStage = (stage: ExamStage) => {
    switch (stage) {
      case "applicant":
        return "Applicant"
      case "proposal_exam":
        return "Proposal Exam"
      case "results_exam":
        return "Results Exam"
      case "final_exam":
        return "Final Exam"
      case "graduated":
        return "Graduated"
      default:
        return stage
    }
  }

  // Get badge variant based on exam stage
  const getExamStageBadgeVariant = (stage: ExamStage) => {
    switch (stage) {
      case "applicant":
        return "outline"
      case "proposal_exam":
        return "secondary"
      case "results_exam":
        return "default"
      case "final_exam":
        return "success"
      case "graduated":
        return "gradient"
      default:
        return "outline"
    }
  }

  // Get faculty and program names
  const getFacultyName = (facultyId: string) => {
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown Faculty"
  }

  const getProgramName = (facultyId: string, programId: string) => {
    const faculty = faculties.find((f) => f.id === facultyId)
    return faculty?.programs.find((p) => p.id === programId)?.name || "Unknown Program"
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled"

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Handle providing feedback
  const handleProvideFeedback = React.useCallback(() => {
    if (!selectedSubmissionId || !feedbackText.trim()) return

    // In a real app, this would be an API call to save the feedback
    toast({
      title: "Feedback Submitted",
      description: "Your feedback has been submitted successfully.",
    })

    setFeedbackDialogOpen(false)
    setFeedbackText("")
    setSelectedSubmissionId(null)
  }, [selectedSubmissionId, feedbackText, toast])

  // Handle approve exam
  const handleApproveExam = () => {
    toast({
      title: "Exam Approved",
      description: "The student's exam has been approved successfully.",
    })
  }

  // Handle reject exam
  const handleRejectExam = () => {
    toast({
      variant: "destructive",
      title: "Exam Rejected",
      description: "The student's exam has been rejected.",
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Not found state
  if (!student) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Student Not Found</h2>
        <p className="text-muted-foreground">The requested student could not be found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/instructor/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/instructor/students")}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Student Details</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => (window.location.href = `mailto:${student.email}`)}>
              <Mail className="mr-2 h-4 w-4" />
              Email Student
            </Button>
            {student.examStage !== "applicant" && student.examStage !== "graduated" && (
              <>
                <Button variant="success" onClick={handleApproveExam}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Exam
                </Button>
                <Button variant="destructive" onClick={handleRejectExam}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Exam
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FadeIn className="md:col-span-1">
            <StudentOverviewCard
              student={student}
              facultyName={getFacultyName(student.facultyId)}
              programName={getProgramName(student.facultyId, student.programId)}
              formatExamStage={formatExamStage}
              getExamStageBadgeVariant={getExamStageBadgeVariant}
            />
          </FadeIn>

          <SlideUp className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thesis Information</CardTitle>
                <CardDescription>Details about the student's thesis and exam</CardDescription>
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
                      <Badge variant={getExamStageBadgeVariant(student.examStage)}>
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
                          {student.turnitinResults.map((result) => (
                            <StaggerItem key={result.id}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{result.documentTitle}</span>
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
                                  <span className="text-sm text-muted-foreground">
                                    Submitted on {formatDate(result.submittedAt)}
                                  </span>
                                  <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-3 w-3" />
                                    Download
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSubmissionId(result.id)
                                      setFeedbackDialogOpen(true)
                                    }}
                                  >
                                    <MessageSquare className="mr-2 h-3 w-3" />
                                    Feedback
                                  </Button>
                                </div>
                              </div>
                            </StaggerItem>
                          ))}
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
          </SlideUp>

          <SlideUp className="md:col-span-3">
            <StudentProgressTabs
              student={student}
              formatExamStage={formatExamStage}
              formatDate={formatDate}
            />
          </SlideUp>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Add your feedback for this submission. The student will be able to view your comments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Enter your feedback here..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProvideFeedback}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

