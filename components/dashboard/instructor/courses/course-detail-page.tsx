"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition } from "@/components/ui/motion"
import type { Course, Material, Assignment, Student, NewMaterialForm, NewAssignmentForm } from "./course-detail-types"
import { generateMockCourse, generateMockMaterials, generateMockAssignments, generateMockStudents } from "./course-detail-mock-data"
import { CourseDetailHeader } from "./course-detail-header"
import { CourseDetailOverview } from "./course-detail-overview"
import { CourseDetailTabs } from "./course-detail-tabs"

interface CourseDetailPageProps {
  courseId: string
}

export function CourseDetailPage({ courseId }: CourseDetailPageProps) {
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMaterialDialogOpen, setNewMaterialDialogOpen] = useState(false)
  const [newAssignmentDialogOpen, setNewAssignmentDialogOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState<NewMaterialForm>({
    title: "",
    type: "document",
    description: "",
    file: null,
  })
  const [newAssignment, setNewAssignment] = useState<NewAssignmentForm>({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
  })

  const router = useRouter()
  const { toast } = useToast()
  const { faculties } = useFacultyStore()

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true)

      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        const mockCourse = generateMockCourse(courseId)
        if (!mockCourse) {
          toast({
            variant: "destructive",
            title: "Course Not Found",
            description: "The requested course could not be found.",
          })
          router.push("/dashboard/instructor/courses")
          return
        }

        setCourse(mockCourse)
        setMaterials(generateMockMaterials())
        setAssignments(generateMockAssignments())
        setStudents(generateMockStudents())
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, router, toast])

  const getProgramName = (programId: string) => {
    for (const faculty of faculties) {
      const program = faculty.programs.find((p) => p.id === programId)
      if (program) {
        return program.name
      }
    }
    return "Unknown Program"
  }

  const handleUploadMaterial = () => {
    if (!newMaterial.title || !newMaterial.type) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    const newMaterialId = `material-${materials.length + 1}`
    const createdMaterial: Material = {
      id: newMaterialId,
      title: newMaterial.title,
      type: newMaterial.type as Material["type"],
      description: newMaterial.description,
      uploadedAt: "Just now",
      fileSize: newMaterial.file ? `${Math.round(newMaterial.file.size / 1024)} KB` : undefined,
      downloadUrl: "#",
    }

    setMaterials([createdMaterial, ...materials])
    setNewMaterial({ title: "", type: "document", description: "", file: null })
    setNewMaterialDialogOpen(false)

    toast({
      title: "Material Uploaded",
      description: "The new material has been uploaded successfully.",
    })
  }

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.dueDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    const newAssignmentId = `assignment-${assignments.length + 1}`
    const createdAssignment: Assignment = {
      id: newAssignmentId,
      title: newAssignment.title,
      description: newAssignment.description,
      dueDate: newAssignment.dueDate,
      status: "draft",
      submissionCount: 0,
      maxScore: newAssignment.maxScore,
    }

    setAssignments([createdAssignment, ...assignments])
    setNewAssignment({ title: "", description: "", dueDate: "", maxScore: 100 })
    setNewAssignmentDialogOpen(false)

    toast({
      title: "Assignment Created",
      description: "The new assignment has been created successfully.",
    })
  }

  const handleDeleteMaterial = (materialId: string) => {
    setMaterials(materials.filter((material) => material.id !== materialId))
    toast({
      title: "Material Deleted",
      description: "The material has been deleted successfully.",
    })
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId))
    toast({
      title: "Assignment Deleted",
      description: "The assignment has been deleted successfully.",
    })
  }

  const handlePublishAssignment = (assignmentId: string) => {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, status: "published" as const } : assignment,
      ),
    )
    toast({
      title: "Assignment Published",
      description: "The assignment has been published successfully.",
    })
  }

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/instructor/students/${studentId}`)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Course Not Found</h2>
        <p className="text-muted-foreground">The requested course could not be found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/instructor/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <CourseDetailHeader
          course={course}
          onBack={() => router.push("/dashboard/instructor/courses")}
          onEdit={() => router.push(`/dashboard/instructor/courses/${course.id}/edit`)}
          onSettings={() => router.push(`/dashboard/instructor/courses/${course.id}/settings`)}
        />

        <CourseDetailOverview
          course={course}
          programName={getProgramName(course.programId)}
          onUploadMaterial={() => setNewMaterialDialogOpen(true)}
          onCreateAssignment={() => setNewAssignmentDialogOpen(true)}
          onManageStudents={() => router.push(`/dashboard/instructor/courses/${course.id}/students`)}
          onGradeSubmissions={() => router.push(`/dashboard/instructor/courses/${course.id}/grades`)}
          onPostAnnouncement={() => router.push(`/dashboard/instructor/courses/${course.id}/announcements`)}
        />

        <CourseDetailTabs
          course={course}
          materials={materials}
          assignments={assignments}
          students={students}
          newMaterialDialogOpen={newMaterialDialogOpen}
          onNewMaterialDialogOpenChange={setNewMaterialDialogOpen}
          newMaterial={newMaterial}
          onNewMaterialChange={setNewMaterial}
          onUploadMaterial={handleUploadMaterial}
          onDeleteMaterial={handleDeleteMaterial}
          newAssignmentDialogOpen={newAssignmentDialogOpen}
          onNewAssignmentDialogOpenChange={setNewAssignmentDialogOpen}
          newAssignment={newAssignment}
          onNewAssignmentChange={setNewAssignment}
          onCreateAssignment={handleCreateAssignment}
          onDeleteAssignment={handleDeleteAssignment}
          onPublishAssignment={handlePublishAssignment}
          onViewStudent={handleViewStudent}
          onViewAssignment={(assignmentId) =>
            router.push(`/dashboard/instructor/courses/${course.id}/assignments/${assignmentId}`)
          }
          onManageStudents={() => router.push(`/dashboard/instructor/courses/${course.id}/students/manage`)}
        />
      </div>
    </PageTransition>
  )
}

