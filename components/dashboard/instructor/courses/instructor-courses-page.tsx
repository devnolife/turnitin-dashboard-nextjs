"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition } from "@/components/ui/motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CoursesFilters } from "./courses-filters"
import { CoursesGrid } from "./courses-grid"

// Mock course data
export interface Course {
  id: string
  title: string
  code: string
  description: string
  programId: string
  semester: string
  year: number
  status: "active" | "upcoming" | "archived"
  studentCount: number
  materialsCount: number
  assignmentsCount: number
  lastUpdated: string
}

export function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [programFilter, setProgramFilter] = useState<string>("all")
  const [newCourseDialogOpen, setNewCourseDialogOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    description: "",
    programId: "",
    semester: "Spring",
    year: new Date().getFullYear(),
  })

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { faculties } = useFacultyStore()

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Generate mock courses
        const mockCourses = generateMockCourses()
        setCourses(mockCourses)
        setFilteredCourses(mockCourses)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load courses. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [toast])

  // Generate mock courses
  const generateMockCourses = (): Course[] => {
    return [
      {
        id: "course-1",
        title: "Computer Science 101",
        code: "CS101",
        description: "Introduction to Computer Science and Programming",
        programId: "prog-1",
        semester: "Spring",
        year: 2025,
        status: "active",
        studentCount: 42,
        materialsCount: 15,
        assignmentsCount: 8,
        lastUpdated: "2 days ago",
      },
      {
        id: "course-2",
        title: "Data Science 202",
        code: "DS202",
        description: "Intermediate Data Science and Analysis",
        programId: "prog-5",
        semester: "Spring",
        year: 2025,
        status: "active",
        studentCount: 38,
        materialsCount: 12,
        assignmentsCount: 6,
        lastUpdated: "1 week ago",
      },
      {
        id: "course-3",
        title: "AI Ethics 301",
        code: "AI301",
        description: "Ethical Considerations in Artificial Intelligence",
        programId: "prog-9",
        semester: "Spring",
        year: 2025,
        status: "active",
        studentCount: 28,
        materialsCount: 10,
        assignmentsCount: 5,
        lastUpdated: "3 days ago",
      },
      {
        id: "course-4",
        title: "Machine Learning Fundamentals",
        code: "ML201",
        description: "Introduction to Machine Learning Algorithms",
        programId: "prog-5",
        semester: "Fall",
        year: 2025,
        status: "upcoming",
        studentCount: 0,
        materialsCount: 3,
        assignmentsCount: 0,
        lastUpdated: "1 day ago",
      },
      {
        id: "course-5",
        title: "Database Systems",
        code: "DB301",
        description: "Advanced Database Design and Implementation",
        programId: "prog-1",
        semester: "Fall",
        year: 2024,
        status: "archived",
        studentCount: 35,
        materialsCount: 18,
        assignmentsCount: 10,
        lastUpdated: "3 months ago",
      },
      {
        id: "course-6",
        title: "Web Development",
        code: "WD202",
        description: "Modern Web Development Techniques",
        programId: "prog-1",
        semester: "Fall",
        year: 2024,
        status: "archived",
        studentCount: 40,
        materialsCount: 22,
        assignmentsCount: 12,
        lastUpdated: "4 months ago",
      },
    ]
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...courses]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((course) => course.status === statusFilter)
    }

    // Apply program filter
    if (programFilter !== "all") {
      filtered = filtered.filter((course) => course.programId === programFilter)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, statusFilter, programFilter, courses])

  // Get program name
  const getProgramName = (programId: string) => {
    for (const faculty of faculties) {
      const program = faculty.programs.find((p) => p.id === programId)
      if (program) {
        return program.name
      }
    }
    return "Unknown Program"
  }

  // Get available programs
  const getAvailablePrograms = () => {
    const programs: { id: string; name: string; facultyId: string }[] = []

    faculties.forEach((faculty) => {
      faculty.programs.forEach((program) => {
        programs.push({
          id: program.id,
          name: program.name,
          facultyId: faculty.id,
        })
      })
    })

    return programs
  }

  // Handle view course
  const handleViewCourse = (courseId: string) => {
    router.push(`/dashboard/instructor/courses/${courseId}`)
  }

  // Handle edit course
  const handleEditCourse = (courseId: string) => {
    router.push(`/dashboard/instructor/courses/${courseId}/edit`)
  }

  // Handle delete course
  const handleDeleteCourse = (courseId: string) => {
    toast({
      title: "Course Deleted",
      description: "The course has been deleted successfully.",
    })

    // Remove course from state
    setCourses(courses.filter((course) => course.id !== courseId))
  }

  // Handle create course
  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.code || !newCourse.programId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Create new course
    const newCourseId = `course-${courses.length + 1}`
    const createdCourse: Course = {
      id: newCourseId,
      title: newCourse.title,
      code: newCourse.code,
      description: newCourse.description,
      programId: newCourse.programId,
      semester: newCourse.semester,
      year: newCourse.year,
      status: "upcoming",
      studentCount: 0,
      materialsCount: 0,
      assignmentsCount: 0,
      lastUpdated: "Just now",
    }

    // Add course to state
    setCourses([createdCourse, ...courses])

    // Reset form and close dialog
    setNewCourse({
      title: "",
      code: "",
      description: "",
      programId: "",
      semester: "Spring",
      year: new Date().getFullYear(),
    })
    setNewCourseDialogOpen(false)

    toast({
      title: "Course Created",
      description: "The new course has been created successfully.",
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

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Course Management</h1>
            <p className="text-muted-foreground">Manage your courses, materials, and assignments</p>
          </div>
          <Dialog open={newCourseDialogOpen} onOpenChange={setNewCourseDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your teaching portfolio. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Introduction to Computer Science"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g. CS101"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the course"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Select
                    value={newCourse.programId}
                    onValueChange={(value) => setNewCourse({ ...newCourse, programId: value })}
                  >
                    <SelectTrigger id="program">
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePrograms().map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={newCourse.semester}
                      onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}
                    >
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newCourse.year}
                      onChange={(e) => setNewCourse({ ...newCourse, year: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewCourseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCourse}>Create Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <CoursesFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          programFilter={programFilter}
          onProgramFilterChange={setProgramFilter}
          availablePrograms={getAvailablePrograms()}
          getProgramName={getProgramName}
        />

        <CoursesGrid
          filteredCourses={filteredCourses}
          totalCourses={courses.length}
          getProgramName={getProgramName}
          onViewCourse={handleViewCourse}
          onEditCourse={handleEditCourse}
          onDeleteCourse={handleDeleteCourse}
          onCreateCourse={() => setNewCourseDialogOpen(true)}
        />
      </div>
    </PageTransition>
  )
}

