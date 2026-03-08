"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { type Student, type ExamStage, useStudentStore } from "@/lib/store/student-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition, FadeIn, SlideUp } from "@/components/ui/motion"
import { StudentInfoCard } from "./student-info-card"
import { TurnitinResultsContent, SubmissionsContent, FeedbackContent, ExamInfoCard } from "./student-submissions-tab"
import { StudentActivityTab } from "./student-activity-tab"

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
    const fetchStudent = async () => {
      setIsLoading(true)
      try {
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

  const getFacultyName = (facultyId: string) => {
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown Faculty"
  }

  const getProgramName = (facultyId: string, programId: string) => {
    const faculty = faculties.find((f) => f.id === facultyId)
    return faculty?.programs.find((p) => p.id === programId)?.name || "Unknown Program"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInstructorDetails = (instructorId: string | null) => {
    if (!instructorId) return null
    return getInstructorById(instructorId)
  }

  const handleAssignInstructor = () => {
    if (!student || !selectedInstructorId) return
    assignInstructorToStudent(student.id, selectedInstructorId)
    setStudent({ ...student, instructorId: selectedInstructorId })
    toast({ title: "Instructor Assigned", description: "The instructor has been assigned to this student successfully." })
    setInstructorDialogOpen(false)
  }

  const handleRemoveInstructor = () => {
    if (!student || !student.instructorId) return
    removeInstructorFromStudent(student.id)
    setStudent({ ...student, instructorId: null })
    toast({ title: "Instructor Removed", description: "The instructor has been removed from this student." })
  }

  const handleApproveExam = () => {
    toast({ title: "Exam Approved", description: "The student's exam has been approved successfully." })
  }

  const handleRejectExam = () => {
    toast({ variant: "destructive", title: "Exam Rejected", description: "The student's exam has been rejected." })
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

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
            <StudentInfoCard
              student={student}
              instructor={instructor ? { id: instructor.id, name: instructor.name, email: instructor.email } : null}
              instructors={instructors}
              instructorDialogOpen={instructorDialogOpen}
              onInstructorDialogOpenChange={setInstructorDialogOpen}
              selectedInstructorId={selectedInstructorId}
              onSelectedInstructorIdChange={setSelectedInstructorId}
              onAssignInstructor={handleAssignInstructor}
              onRemoveInstructor={handleRemoveInstructor}
              onViewInstructor={(id) => router.push(`/dashboard/admin/instructors/${id}`)}
              formatExamStage={formatExamStage}
              getExamStageBadgeVariant={getExamStageBadgeVariant}
              getFacultyName={getFacultyName}
              getProgramName={getProgramName}
            />
          </FadeIn>

          <SlideUp className="md:col-span-2">
            <ExamInfoCard
              student={student}
              formatExamStage={formatExamStage}
              getExamStageBadgeVariant={getExamStageBadgeVariant}
              formatDate={formatDate}
            />
          </SlideUp>

          <SlideUp className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Turnitin Results & Submissions</CardTitle>
                <CardDescription>View the student&apos;s Turnitin results and submissions</CardDescription>
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
                    <TurnitinResultsContent
                      student={student}
                      formatExamStage={formatExamStage}
                      formatDate={formatDate}
                    />
                  </TabsContent>

                  <TabsContent value="submissions" className="space-y-4">
                    <SubmissionsContent student={student} />
                  </TabsContent>

                  <TabsContent value="feedback" className="space-y-4">
                    <FeedbackContent student={student} formatDate={formatDate} />
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <StudentActivityTab />
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

