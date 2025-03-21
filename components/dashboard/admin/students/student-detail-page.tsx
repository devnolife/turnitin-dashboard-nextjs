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
  Edit,
  Download,
  Clock,
  Eye,
  MessageSquare,
  User,
  UserPlus,
  UserMinus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { type Student, type ExamStage, useStudentStore } from "@/lib/store/student-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition, FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface StudentDetailPageProps {
  studentId: string
}

export function StudentDetailPage({ studentId }: StudentDetailPageProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false)
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("")

  const router = useRouter()
  const { toast } = useToast()
  const { getStudentById, assignInstructorToStudent, removeInstructorFromStudent } = useStudentStore()
  const { instructors, getInstructorById } = useInstructorStore()
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
          setStudent(foundStudent)
          if (foundStudent.instructorId) {
            setSelectedInstructorId(foundStudent.instructorId)
          }
        } else {
          toast({
            variant: "destructive",
            title: "Student not found",
            description: "The requested student could not be found.",
          })
          router.push("/dashboard/admin/students")
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

    fetchStudent()
  }, [studentId, getStudentById, router, toast])

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

  // Get instructor details
  const getInstructorDetails = (instructorId: string | null) => {
    if (!instructorId) return null
    return getInstructorById(instructorId)
  }

  // Handle assign instructor
  const handleAssignInstructor = () => {
    if (!student || !selectedInstructorId) return

    assignInstructorToStudent(student.id, selectedInstructorId)
    setStudent({
      ...student,
      instructorId: selectedInstructorId,
    })

    toast({
      title: "Instructor Assigned",
      description: "The instructor has been assigned to this student successfully.",
    })

    setInstructorDialogOpen(false)
  }

  // Handle remove instructor
  const handleRemoveInstructor = () => {
    if (!student || !student.instructorId) return

    removeInstructorFromStudent(student.id)
    setStudent({
      ...student,
      instructorId: null,
    })

    toast({
      title: "Instructor Removed",
      description: "The instructor has been removed from this student.",
    })
  }

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
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/admin/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
    )
  }

  const instructor = getInstructorDetails(student.instructorId)

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin/students")}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Student Details</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Assigned Instructor</h3>

                      {instructor ? (
                        <div className="flex gap-2">
                          <Dialog open={instructorDialogOpen} onOpenChange={setInstructorDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserPlus className="mr-2 h-3 w-3" />
                                Change
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Instructor</DialogTitle>
                                <DialogDescription>Select an instructor to assign to this student.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="instructor">Instructor</Label>
                                  <Select value={selectedInstructorId} onValueChange={setSelectedInstructorId}>
                                    <SelectTrigger id="instructor">
                                      <SelectValue placeholder="Select an instructor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {instructors
                                        .filter((i) => i.status === "active")
                                        .map((instructor) => (
                                          <SelectItem key={instructor.id} value={instructor.id}>
                                            {instructor.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setInstructorDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAssignInstructor}>Assign</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" size="sm" onClick={handleRemoveInstructor}>
                            <UserMinus className="mr-2 h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Dialog open={instructorDialogOpen} onOpenChange={setInstructorDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserPlus className="mr-2 h-3 w-3" />
                              Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Instructor</DialogTitle>
                              <DialogDescription>Select an instructor to assign to this student.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="instructor">Instructor</Label>
                                <Select value={selectedInstructorId} onValueChange={setSelectedInstructorId}>
                                  <SelectTrigger id="instructor">
                                    <SelectValue placeholder="Select an instructor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {instructors
                                      .filter((i) => i.status === "active")
                                      .map((instructor) => (
                                        <SelectItem key={instructor.id} value={instructor.id}>
                                          {instructor.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setInstructorDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAssignInstructor}>Assign</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {instructor ? (
                      <div className="flex items-center gap-2 rounded-md border p-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {instructor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium">{instructor.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{instructor.email}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/admin/instructors/${instructor.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-md border p-3 text-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">No instructor assigned</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
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
              </CardFooter>
            </Card>
          </FadeIn>

          <SlideUp className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Exam Information</CardTitle>
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
          </SlideUp>

          <SlideUp className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Turnitin Results & Submissions</CardTitle>
                <CardDescription>View the student's Turnitin results and submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="turnitin" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="turnitin">Turnitin Results</TabsTrigger>
                    <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  </TabsList>

                  <TabsContent value="turnitin" className="space-y-4">
                    {student.turnitinResults.length > 0 ? (
                      <div className="rounded-md border">
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

                                  {/* Transfer button for initial exam results */}
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
                        <h3 className="mt-4 text-lg font-medium">No Turnitin Results</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          No similarity reports are available for this student.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="submissions" className="space-y-4">
                    {student.examStage !== "applicant" ? (
                      <div className="rounded-md border">
                        <div className="p-4">
                          <h3 className="text-lg font-medium">Recent Submissions</h3>
                          <p className="text-sm text-muted-foreground">
                            The student's most recent document submissions
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
                                  <Badge variant={["success", "secondary", "outline"][i]}>
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
                  </TabsContent>

                  <TabsContent value="feedback" className="space-y-4">
                    <div className="rounded-md border">
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
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <div className="rounded-md border">
                      <div className="p-4">
                        <h3 className="text-lg font-medium">Activity Log</h3>
                        <p className="text-sm text-muted-foreground">Recent activity and system interactions</p>
                      </div>

                      <div className="border-t">
                        <div className="divide-y">
                          {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4">
                              <div>
                                <div className="font-medium">
                                  {
                                    [
                                      "Logged in",
                                      "Viewed submission guidelines",
                                      "Downloaded feedback",
                                      "Updated profile information",
                                    ][i]
                                  }
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {
                                    [
                                      "Today, 10:23 AM",
                                      "Yesterday, 3:45 PM",
                                      "3 days ago, 11:30 AM",
                                      "1 week ago, 2:15 PM",
                                    ][i]
                                  }
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </div>
    </PageTransition>
  )
}

