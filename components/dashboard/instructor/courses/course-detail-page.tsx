"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Users,
  FileText,
  Edit,
  Clock,
  Download,
  Upload,
  Plus,
  MoreHorizontal,
  Trash,
  CheckCircle,
  MessageSquare,
  Eye,
  FileCheck,
  Settings,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CourseDetailPageProps {
  courseId: string
}

// Mock course data
interface Course {
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

// Mock material data
interface Material {
  id: string
  title: string
  type: "document" | "video" | "link" | "presentation"
  description: string
  uploadedAt: string
  fileSize?: string
  downloadUrl: string
}

// Mock assignment data
interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: "draft" | "published" | "closed"
  submissionCount: number
  maxScore: number
}

// Mock student data
interface Student {
  id: string
  name: string
  email: string
  studentId: string
  status: "active" | "inactive"
  lastActive: string
  submissionCount: number
  averageScore: number | null
}

export function CourseDetailPage({ courseId }: CourseDetailPageProps) {
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMaterialDialogOpen, setNewMaterialDialogOpen] = useState(false)
  const [newAssignmentDialogOpen, setNewAssignmentDialogOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    type: "document",
    description: "",
    file: null as File | null,
  })
  const [newAssignment, setNewAssignment] = useState({
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
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Generate mock course data
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

  // Generate mock course
  const generateMockCourse = (id: string): Course | null => {
    const courses = [
      {
        id: "course-1",
        title: "Computer Science 101",
        code: "CS101",
        description:
          "Introduction to Computer Science and Programming. This course covers the basics of programming, algorithms, and computational thinking. Students will learn fundamental concepts and problem-solving techniques.",
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
        description:
          "Intermediate Data Science and Analysis. This course explores statistical methods, data visualization, and machine learning techniques for analyzing complex datasets.",
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
        description:
          "Ethical Considerations in Artificial Intelligence. This course examines the ethical implications of AI technologies and their impact on society.",
        programId: "prog-9",
        semester: "Spring",
        year: 2025,
        status: "active",
        studentCount: 28,
        materialsCount: 10,
        assignmentsCount: 5,
        lastUpdated: "3 days ago",
      },
    ]

    return courses.find((course) => course.id === id) || null
  }

  // Generate mock materials
  const generateMockMaterials = (): Material[] => {
    return [
      {
        id: "material-1",
        title: "Course Syllabus",
        type: "document",
        description: "Complete course syllabus with schedule and requirements",
        uploadedAt: "2 weeks ago",
        fileSize: "245 KB",
        downloadUrl: "#",
      },
      {
        id: "material-2",
        title: "Introduction to Programming Lecture Slides",
        type: "presentation",
        description: "Slides from the first lecture covering programming basics",
        uploadedAt: "2 weeks ago",
        fileSize: "3.2 MB",
        downloadUrl: "#",
      },
      {
        id: "material-3",
        title: "Algorithms and Data Structures Overview",
        type: "document",
        description: "Comprehensive guide to common algorithms and data structures",
        uploadedAt: "1 week ago",
        fileSize: "1.8 MB",
        downloadUrl: "#",
      },
      {
        id: "material-4",
        title: "Introduction to Python Programming",
        type: "video",
        description: "Video tutorial on Python basics for beginners",
        uploadedAt: "1 week ago",
        fileSize: "128 MB",
        downloadUrl: "#",
      },
      {
        id: "material-5",
        title: "Additional Resources and References",
        type: "link",
        description: "Collection of useful external resources and references",
        uploadedAt: "5 days ago",
        downloadUrl: "#",
      },
    ]
  }

  // Generate mock assignments
  const generateMockAssignments = (): Assignment[] => {
    return [
      {
        id: "assignment-1",
        title: "Programming Fundamentals Quiz",
        description: "Quiz covering basic programming concepts and syntax",
        dueDate: "March 15, 2025",
        status: "closed",
        submissionCount: 40,
        maxScore: 100,
      },
      {
        id: "assignment-2",
        title: "Algorithm Implementation Project",
        description: "Implement and analyze common sorting algorithms",
        dueDate: "April 5, 2025",
        status: "published",
        submissionCount: 35,
        maxScore: 100,
      },
      {
        id: "assignment-3",
        title: "Data Structures Assignment",
        description: "Implement and use various data structures to solve problems",
        dueDate: "April 20, 2025",
        status: "published",
        submissionCount: 0,
        maxScore: 100,
      },
      {
        id: "assignment-4",
        title: "Final Project Proposal",
        description: "Submit a proposal for your final course project",
        dueDate: "May 1, 2025",
        status: "draft",
        submissionCount: 0,
        maxScore: 50,
      },
    ]
  }

  // Generate mock students
  const generateMockStudents = (): Student[] => {
    return [
      {
        id: "student-1",
        name: "John Doe",
        email: "john.doe@university.edu",
        studentId: "S1001",
        status: "active",
        lastActive: "Today",
        submissionCount: 2,
        averageScore: 92,
      },
      {
        id: "student-2",
        name: "Jane Smith",
        email: "jane.smith@university.edu",
        studentId: "S1002",
        status: "active",
        lastActive: "Yesterday",
        submissionCount: 2,
        averageScore: 88,
      },
      {
        id: "student-3",
        name: "Michael Johnson",
        email: "michael.johnson@university.edu",
        studentId: "S1003",
        status: "active",
        lastActive: "2 days ago",
        submissionCount: 1,
        averageScore: 75,
      },
      {
        id: "student-4",
        name: "Emily Davis",
        email: "emily.davis@university.edu",
        studentId: "S1004",
        status: "inactive",
        lastActive: "2 weeks ago",
        submissionCount: 0,
        averageScore: null,
      },
      {
        id: "student-5",
        name: "Robert Wilson",
        email: "robert.wilson@university.edu",
        studentId: "S1005",
        status: "active",
        lastActive: "Today",
        submissionCount: 2,
        averageScore: 95,
      },
    ]
  }

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

  // Handle upload material
  const handleUploadMaterial = () => {
    if (!newMaterial.title || !newMaterial.type) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Create new material
    const newMaterialId = `material-${materials.length + 1}`
    const createdMaterial: Material = {
      id: newMaterialId,
      title: newMaterial.title,
      type: newMaterial.type as any,
      description: newMaterial.description,
      uploadedAt: "Just now",
      fileSize: newMaterial.file ? `${Math.round(newMaterial.file.size / 1024)} KB` : undefined,
      downloadUrl: "#",
    }

    // Add material to state
    setMaterials([createdMaterial, ...materials])

    // Reset form and close dialog
    setNewMaterial({
      title: "",
      type: "document",
      description: "",
      file: null,
    })
    setNewMaterialDialogOpen(false)

    toast({
      title: "Material Uploaded",
      description: "The new material has been uploaded successfully.",
    })
  }

  // Handle create assignment
  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.dueDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Create new assignment
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

    // Add assignment to state
    setAssignments([createdAssignment, ...assignments])

    // Reset form and close dialog
    setNewAssignment({
      title: "",
      description: "",
      dueDate: "",
      maxScore: 100,
    })
    setNewAssignmentDialogOpen(false)

    toast({
      title: "Assignment Created",
      description: "The new assignment has been created successfully.",
    })
  }

  // Handle delete material
  const handleDeleteMaterial = (materialId: string) => {
    setMaterials(materials.filter((material) => material.id !== materialId))

    toast({
      title: "Material Deleted",
      description: "The material has been deleted successfully.",
    })
  }

  // Handle delete assignment
  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId))

    toast({
      title: "Assignment Deleted",
      description: "The assignment has been deleted successfully.",
    })
  }

  // Handle publish assignment
  const handlePublishAssignment = (assignmentId: string) => {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, status: "published" } : assignment,
      ),
    )

    toast({
      title: "Assignment Published",
      description: "The assignment has been published successfully.",
    })
  }

  // Handle view student
  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/instructor/students/${studentId}`)
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/instructor/courses")}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight gradient-text">{course.title}</h1>
              <p className="text-muted-foreground">
                {course.code} • {course.semester} {course.year}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/settings`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Course Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
                <CardDescription>Details and statistics about this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="mt-1">{course.description}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Program</h3>
                      <p className="mt-1">{getProgramName(course.programId)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <div className="mt-1">
                        <Badge
                          variant={
                            course.status === "active"
                              ? "default"
                              : course.status === "upcoming"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-2xl font-bold">{course.studentCount}</div>
                      <div className="text-sm text-muted-foreground">Students</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-2xl font-bold">{course.materialsCount}</div>
                      <div className="text-sm text-muted-foreground">Materials</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-2xl font-bold">{course.assignmentsCount}</div>
                      <div className="text-sm text-muted-foreground">Assignments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  Last updated {course.lastUpdated}
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" onClick={() => setNewMaterialDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
                <Button className="w-full justify-start" onClick={() => setNewAssignmentDialogOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/students`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Students
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/grades`)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Grade Submissions
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/announcements`)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Post Announcement
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content Tabs */}
        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Course Materials</h2>
              <Dialog open={newMaterialDialogOpen} onOpenChange={setNewMaterialDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Upload Course Material</DialogTitle>
                    <DialogDescription>
                      Add new material to your course. Students will be able to access this material.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Lecture Slides Week 1"
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newMaterial.type}
                        onValueChange={(value) => setNewMaterial({ ...newMaterial, type: value })}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select material type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="link">External Link</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the material"
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewMaterial({ ...newMaterial, file: e.target.files[0] })
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewMaterialDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUploadMaterial}>Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.length > 0 ? (
                    materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="font-medium">{material.title}</div>
                          <div className="text-sm text-muted-foreground">{material.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{material.uploadedAt}</TableCell>
                        <TableCell>{material.fileSize || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteMaterial(material.id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground/60" />
                          <h3 className="mt-2 text-lg font-medium">No Materials</h3>
                          <p className="text-sm text-muted-foreground">
                            You haven't uploaded any materials to this course yet.
                          </p>
                          <Button className="mt-4" onClick={() => setNewMaterialDialogOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Material
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Assignments</h2>
              <Dialog open={newAssignmentDialogOpen} onOpenChange={setNewAssignmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Create Assignment</DialogTitle>
                    <DialogDescription>Create a new assignment for your students.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Midterm Project"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Assignment instructions and requirements"
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="text"
                          placeholder="e.g. May 15, 2025"
                          value={newAssignment.dueDate}
                          onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxScore">Maximum Score</Label>
                        <Input
                          id="maxScore"
                          type="number"
                          value={newAssignment.maxScore}
                          onChange={(e) =>
                            setNewAssignment({ ...newAssignment, maxScore: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewAssignmentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssignment}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="font-medium">{assignment.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{assignment.description}</div>
                        </TableCell>
                        <TableCell>{assignment.dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assignment.status === "published"
                                ? "default"
                                : assignment.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.submissionCount} / {course.studentCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/instructor/courses/${course.id}/assignments/${assignment.id}`)
                              }
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            {assignment.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublishAssignment(assignment.id)}
                              >
                                <FileCheck className="mr-1 h-3 w-3" />
                                Publish
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Grade
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground/60" />
                          <h3 className="mt-2 text-lg font-medium">No Assignments</h3>
                          <p className="text-sm text-muted-foreground">
                            You haven't created any assignments for this course yet.
                          </p>
                          <Button className="mt-4" onClick={() => setNewAssignmentDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Assignment
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Enrolled Students</h2>
              <Button onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/students/manage`)}>
                <Users className="mr-2 h-4 w-4" />
                Manage Students
              </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.lastActive}</TableCell>
                        <TableCell>
                          {student.submissionCount} / {assignments.length}
                        </TableCell>
                        <TableCell>{student.averageScore !== null ? `${student.averageScore}%` : "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewStudent(student.id)}>
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => (window.location.href = `mailto:${student.email}`)}
                            >
                              <Mail className="mr-1 h-3 w-3" />
                              Email
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-8 w-8 text-muted-foreground/60" />
                          <h3 className="mt-2 text-lg font-medium">No Students</h3>
                          <p className="text-sm text-muted-foreground">
                            There are no students enrolled in this course yet.
                          </p>
                          <Button
                            className="mt-4"
                            onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/students/manage`)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Students
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}

