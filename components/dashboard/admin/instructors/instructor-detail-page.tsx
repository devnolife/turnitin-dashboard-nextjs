"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  Award,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { type Instructor, useInstructorStore } from "@/lib/store/instructor-store"
import type { Student, ExamStage } from "@/lib/store/student-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition, FadeIn, SlideUp, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { TurnitinResultsManager } from "./turnitin-results-manager"

interface InstructorDetailPageProps {
  instructorId: string
}

export function InstructorDetailPage({ instructorId }: InstructorDetailPageProps) {
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const router = useRouter()
  const { toast } = useToast()

  const { getInstructorById, getStudentsByInstructor, getStudentsByInstructorAndProgram } = useInstructorStore()

  const { faculties } = useFacultyStore()

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we're using the mock data from the store
    const fetchInstructor = async () => {
      setIsLoading(true)

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        const foundInstructor = getInstructorById(instructorId)

        if (foundInstructor) {
          setInstructor(foundInstructor)
          setStudents(getStudentsByInstructor(instructorId))
        } else {
          toast({
            variant: "destructive",
            title: "Instructor not found",
            description: "The requested instructor could not be found.",
          })
          router.push("/dashboard/admin/instructors")
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch instructor details. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstructor()
  }, [instructorId, getInstructorById, getStudentsByInstructor, router, toast])

  // Format position for display
  const formatPosition = (position: string) => {
    return position
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "inactive":
        return "secondary"
      case "on_leave":
        return "warning"
      default:
        return "outline"
    }
  }

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

  const getProgramName = (programId: string) => {
    for (const faculty of faculties) {
      const program = faculty.programs.find((p) => p.id === programId)
      if (program) return program.name
    }
    return "Unknown Program"
  }

  // Group students by program
  const getStudentsByProgram = () => {
    if (!instructor) return []

    return instructor.programIds.map((programId) => {
      const programStudents = getStudentsByInstructorAndProgram(instructorId, programId)
      return {
        programId,
        programName: getProgramName(programId),
        students: programStudents,
      }
    })
  }

  // Count students by exam stage
  const countStudentsByExamStage = (stage: ExamStage) => {
    return students.filter((student) => student.examStage === stage).length
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
  if (!instructor) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Instructor Not Found</h2>
        <p className="text-muted-foreground">The requested instructor could not be found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/admin/instructors")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Instructors
        </Button>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin/instructors")}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Instructor Details</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FadeIn className="md:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">
                      {instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4 text-center">{instructor.name}</CardTitle>
                  <CardDescription className="text-center">{instructor.employeeId}</CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {formatPosition(instructor.position)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{instructor.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{instructor.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{getFacultyName(instructor.facultyId)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{instructor.specialization}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined: {instructor.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{instructor.officeLocation}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{instructor.officeHours}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <Badge variant={getStatusBadgeVariant(instructor.status)}>
                  {instructor.status.charAt(0).toUpperCase() + instructor.status.slice(1).replace("_", " ")}
                </Badge>
              </CardFooter>
            </Card>
          </FadeIn>

          <SlideUp className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Instructor Overview</CardTitle>
                <CardDescription>Summary of supervised students and programs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        <AnimatedCounter value={students.length} />
                      </div>
                      <p className="text-xs text-muted-foreground">Supervised students</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Programs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        <AnimatedCounter value={instructor.programIds.length} />
                      </div>
                      <p className="text-xs text-muted-foreground">Study programs</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Proposal Exams</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        <AnimatedCounter value={countStudentsByExamStage("proposal_exam")} />
                      </div>
                      <p className="text-xs text-muted-foreground">Students in proposal stage</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Final Exams</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        <AnimatedCounter value={countStudentsByExamStage("final_exam")} />
                      </div>
                      <p className="text-xs text-muted-foreground">Students in final stage</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
                  <p className="text-sm">{instructor.bio}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Programs</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructor.programIds.map((programId) => (
                      <Badge key={programId} variant="outline">
                        {getProgramName(programId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideUp>

          <SlideUp className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Instructor Management</CardTitle>
                <CardDescription>Manage students and Perpusmu results</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="students">Supervised Students</TabsTrigger>
                    <TabsTrigger value="turnitin">Perpusmu Results</TabsTrigger>
                    <TabsTrigger value="programs">By Program</TabsTrigger>
                    <TabsTrigger value="exams">By Exam Stage</TabsTrigger>
                  </TabsList>

                  <TabsContent value="students" className="space-y-4">
                    {students.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-md border p-8 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/40" />
                        <h3 className="mt-4 text-lg font-medium">No Students Found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This instructor doesn't have any supervised students yet.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Program</TableHead>
                              <TableHead>Exam Stage</TableHead>
                              <TableHead>Thesis Title</TableHead>
                              <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {students.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>
                                  <div className="font-medium">{student.name}</div>
                                  <div className="text-sm text-muted-foreground">{student.studentId}</div>
                                </TableCell>
                                <TableCell>{getProgramName(student.programId)}</TableCell>
                                <TableCell>
                                  <Badge variant={getExamStageBadgeVariant(student.examStage)}>
                                    {formatExamStage(student.examStage)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs truncate">
                                    {student.thesisTitle || "No thesis title yet"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(`/dashboard/admin/students/${student.id}`)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="turnitin">
                    <TurnitinResultsManager instructorId={instructorId} />
                  </TabsContent>

                  <TabsContent value="programs" className="space-y-4">
                    {instructor.programIds.map((programId) => {
                      const programStudents = getStudentsByInstructorAndProgram(instructorId, programId)

                      return (
                        <Card key={programId}>
                          <CardHeader>
                            <CardTitle>{getProgramName(programId)}</CardTitle>
                            <CardDescription>{programStudents.length} students</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {programStudents.length === 0 ? (
                              <div className="flex flex-col items-center justify-center rounded-md border p-8 text-center">
                                <Users className="h-12 w-12 text-muted-foreground/40" />
                                <h3 className="mt-4 text-lg font-medium">No Students Found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  This instructor doesn't have any supervised students in this program.
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-md border overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Student</TableHead>
                                      <TableHead>Exam Stage</TableHead>
                                      <TableHead>Thesis Title</TableHead>
                                      <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {programStudents.map((student) => (
                                      <TableRow key={student.id}>
                                        <TableCell>
                                          <div className="font-medium">{student.name}</div>
                                          <div className="text-sm text-muted-foreground">{student.studentId}</div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={getExamStageBadgeVariant(student.examStage)}>
                                            {formatExamStage(student.examStage)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="max-w-xs truncate">
                                            {student.thesisTitle || "No thesis title yet"}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push(`/dashboard/admin/students/${student.id}`)}
                                          >
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View</span>
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </TabsContent>

                  <TabsContent value="exams" className="space-y-4">
                    <StaggerContainer className="grid gap-4 md:grid-cols-2">
                      {["proposal_exam", "results_exam", "final_exam", "graduated"].map((stage) => (
                        <StaggerItem key={stage}>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">{formatExamStage(stage as ExamStage)}</CardTitle>
                              <CardDescription>{countStudentsByExamStage(stage as ExamStage)} students</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {(() => {
                                const stageStudents = students.filter((s) => s.examStage === stage)

                                return stageStudents.length === 0 ? (
                                  <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">No students in this stage</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {stageStudents.slice(0, 3).map((student) => (
                                      <div
                                        key={student.id}
                                        className="flex items-center justify-between rounded-md border p-2"
                                      >
                                        <div>
                                          <div className="font-medium">{student.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {getProgramName(student.programId)}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {student.turnitinResults.length > 0 && (
                                            <Badge variant="outline" className="mr-2">
                                              <FileText className="mr-1 h-3 w-3" />
                                              {student.turnitinResults.length}
                                            </Badge>
                                          )}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push(`/dashboard/admin/students/${student.id}`)}
                                          >
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View</span>
                                          </Button>
                                        </div>
                                      </div>
                                    ))}

                                    {stageStudents.length > 3 && (
                                      <Button
                                        variant="outline"
                                        className="w-full mt-2"
                                        onClick={() => {
                                          setActiveTab("students")
                                        }}
                                      >
                                        View All {stageStudents.length} Students
                                      </Button>
                                    )}
                                  </div>
                                )
                              })()}
                            </CardContent>
                          </Card>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
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

