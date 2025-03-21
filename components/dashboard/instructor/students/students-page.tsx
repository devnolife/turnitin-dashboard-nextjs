"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, X, Mail, FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import type { ExamStage } from "@/lib/store/student-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import React from "react"

export function InstructorStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [programFilter, setProgramFilter] = useState<string | null>(null)
  const [examStageFilter, setExamStageFilter] = useState<ExamStage | "all">("all")
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { getStudentsByInstructor, getStudentsByInstructorAndProgram, getStudentsByInstructorAndExamStage } =
    useInstructorStore()
  const { faculties } = useFacultyStore()

  // Get instructor ID from auth store
  const instructorId = user?.id

  // Memoize the store functions to prevent recreation on each render
  const memoizedGetStudentsByInstructor = React.useCallback(
    (id: string) => getStudentsByInstructor(id),
    [getStudentsByInstructor],
  )

  const memoizedGetStudentsByInstructorAndProgram = React.useCallback(
    (id: string, programId: string) => getStudentsByInstructorAndProgram(id, programId),
    [getStudentsByInstructorAndProgram],
  )

  const memoizedGetStudentsByInstructorAndExamStage = React.useCallback(
    (id: string, stage: ExamStage) => getStudentsByInstructorAndExamStage(id, stage),
    [getStudentsByInstructorAndExamStage],
  )

  // Get all students supervised by the instructor
  const allStudents = React.useMemo(
    () => (instructorId ? memoizedGetStudentsByInstructor(instructorId) : []),
    [instructorId, memoizedGetStudentsByInstructor],
  )

  // Apply filters
  useEffect(() => {
    if (!instructorId) {
      setFilteredStudents([])
      return
    }

    let students = [...allStudents]

    // Apply program filter
    if (programFilter) {
      students = memoizedGetStudentsByInstructorAndProgram(instructorId, programFilter)
    }

    // Apply exam stage filter
    if (examStageFilter !== "all") {
      students = memoizedGetStudentsByInstructorAndExamStage(instructorId, examStageFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      students = students.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query) ||
          (student.thesisTitle && student.thesisTitle.toLowerCase().includes(query)),
      )
    }

    setFilteredStudents(students)
  }, [
    searchQuery,
    programFilter,
    examStageFilter,
    allStudents,
    instructorId,
    memoizedGetStudentsByInstructorAndProgram,
    memoizedGetStudentsByInstructorAndExamStage,
  ])

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

  // Get available programs for the instructor
  const getAvailablePrograms = React.useCallback(() => {
    if (!instructorId) return []

    const instructorStore = useInstructorStore.getState()
    const instructor = instructorStore.getInstructorById(instructorId)
    if (!instructor) return []

    return instructor.programIds
      .map((programId) => {
        for (const faculty of faculties) {
          const program = faculty.programs.find((p) => p.id === programId)
          if (program) {
            return {
              id: program.id,
              name: program.name,
              facultyId: faculty.id,
            }
          }
        }
        return null
      })
      .filter(Boolean) as { id: string; name: string; facultyId: string }[]
  }, [instructorId, faculties])

  // Memoize the available programs
  const availablePrograms = React.useMemo(() => getAvailablePrograms(), [getAvailablePrograms])

  // Count students by exam stage
  const countStudentsByExamStage = (stage: ExamStage) => {
    return allStudents.filter((student) => student.examStage === stage).length
  }

  // Handle view student details
  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/instructor/students/${studentId}`)
  }

  // Handle email student
  const handleEmailStudent = (email: string) => {
    toast({
      title: "Email Sent",
      description: `An email has been sent to ${email}`,
    })
  }

  // Handle view submissions
  const handleViewSubmissions = (studentId: string) => {
    router.push(`/dashboard/instructor/submissions?studentId=${studentId}`)
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Student Management</h1>
          <p className="text-muted-foreground">View and manage students under your supervision</p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={allStudents.length} />
                </div>
                <p className="text-xs text-muted-foreground">Under your supervision</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Proposal Exam</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={countStudentsByExamStage("proposal_exam")} />
                </div>
                <p className="text-xs text-muted-foreground">Students in proposal stage</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Results Exam</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={countStudentsByExamStage("results_exam")} />
                </div>
                <p className="text-xs text-muted-foreground">Students in results stage</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Final Exam</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={countStudentsByExamStage("final_exam")} />
                </div>
                <p className="text-xs text-muted-foreground">Students in final stage</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Manage students under your supervision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={programFilter || ""} onValueChange={(value) => setProgramFilter(value || null)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_programs">All Programs</SelectItem>
                    {availablePrograms.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={examStageFilter}
                  onValueChange={(value) => setExamStageFilter(value as ExamStage | "all")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="proposal_exam">Proposal Exam</SelectItem>
                    <SelectItem value="results_exam">Results Exam</SelectItem>
                    <SelectItem value="final_exam">Final Exam</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters */}
            {(programFilter || examStageFilter !== "all" || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                </div>

                {programFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Program: {availablePrograms.find((p) => p.id === programFilter)?.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setProgramFilter(null)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove program filter</span>
                    </Button>
                  </Badge>
                )}

                {examStageFilter !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Stage: {formatExamStage(examStageFilter)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setExamStageFilter("all")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove stage filter</span>
                    </Button>
                  </Badge>
                )}

                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove search filter</span>
                    </Button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    setProgramFilter(null)
                    setExamStageFilter("all")
                    setSearchQuery("")
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Exam Stage</TableHead>
                    <TableHead>Thesis Title</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.studentId}</div>
                        </TableCell>
                        <TableCell>{getProgramName(student.facultyId, student.programId)}</TableCell>
                        <TableCell>
                          <Badge variant={getExamStageBadgeVariant(student.examStage)}>
                            {formatExamStage(student.examStage)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{student.thesisTitle || "No thesis title yet"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewStudent(student.id)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEmailStudent(student.email)}>
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Email</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleViewSubmissions(student.id)}>
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Submissions</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-lg font-medium">No students found</p>
                          <p className="text-sm text-muted-foreground">
                            {allStudents.length === 0
                              ? "You don't have any students assigned to you yet."
                              : "Try adjusting your filters to find students."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}

