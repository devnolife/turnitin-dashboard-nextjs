"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  MessageSquare,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
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
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4 text-center">{student.name}</CardTitle>
                  <CardDescription className="text-center">{student.studentId}</CardDescription>
                  <Badge variant={getExamStageBadgeVariant(student.examStage)} className="mt-2">
                    {formatExamStage(student.examStage)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.whatsappNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{getFacultyName(student.facultyId)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{getProgramName(student.facultyId, student.programId)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last active: {student.lastActive}</span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Academic Progress</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-medium">
                            {student.examStage === "applicant"
                              ? "0%"
                              : student.examStage === "proposal_exam"
                                ? "25%"
                                : student.examStage === "results_exam"
                                  ? "50%"
                                  : student.examStage === "final_exam"
                                    ? "75%"
                                    : "100%"}
                          </span>
                        </div>
                        <Progress
                          value={
                            student.examStage === "applicant"
                              ? 0
                              : student.examStage === "proposal_exam"
                                ? 25
                                : student.examStage === "results_exam"
                                  ? 50
                                  : student.examStage === "final_exam"
                                    ? 75
                                    : 100
                          }
                          className="h-2 bg-turnitin-mint/30"
                          indicatorColor="bg-gradient-to-r from-turnitin-blue to-turnitin-teal"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Proposal</span>
                          <span className="font-medium">
                            {student.examStage === "applicant" ? "Not Started" : "Completed"}
                          </span>
                        </div>
                        <Progress
                          value={student.examStage === "applicant" ? 0 : 100}
                          className="h-1.5 bg-turnitin-mint/30"
                          indicatorColor="bg-turnitin-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Results</span>
                          <span className="font-medium">
                            {student.examStage === "applicant" || student.examStage === "proposal_exam"
                              ? "Not Started"
                              : "Completed"}
                          </span>
                        </div>
                        <Progress
                          value={student.examStage === "applicant" || student.examStage === "proposal_exam" ? 0 : 100}
                          className="h-1.5 bg-turnitin-mint/30"
                          indicatorColor="bg-turnitin-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Final</span>
                          <span className="font-medium">
                            {student.examStage === "final_exam" || student.examStage === "graduated"
                              ? "Completed"
                              : "Not Started"}
                          </span>
                        </div>
                        <Progress
                          value={student.examStage === "final_exam" || student.examStage === "graduated" ? 100 : 0}
                          className="h-1.5 bg-turnitin-mint/30"
                          indicatorColor="bg-turnitin-blue"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-center w-full border-t pt-4">
                  <Badge
                    variant={
                      student.status === "active"
                        ? "success"
                        : student.status === "inactive"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </Badge>
                </div>
              </CardFooter>
            </Card>
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
            <Card>
              <CardHeader>
                <CardTitle>Student Progress & Feedback</CardTitle>
                <CardDescription>Track progress and provide feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="turnitin" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="turnitin">Turnitin Results</TabsTrigger>
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
                        <h3 className="mt-4 text-lg font-medium">No Turnitin Results</h3>
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

