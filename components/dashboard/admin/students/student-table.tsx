"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, MoreHorizontal, Eye, Edit, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { type Student, type ExamStage, useStudentStore } from "@/lib/store/student-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function StudentTable() {
  const [sortColumn, setSortColumn] = useState<keyof Student>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const router = useRouter()
  const { toast } = useToast()
  const { filteredStudents, isLoading } = useStudentStore()
  const { faculties } = useFacultyStore()
  const { getInstructorById } = useInstructorStore()

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

  // Get instructor details
  const getInstructorDetails = (instructorId: string | null) => {
    if (!instructorId) return null
    return getInstructorById(instructorId)
  }

  // Handle sort
  const handleSort = (column: keyof Student) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue: any = a[sortColumn]
    let bValue: any = b[sortColumn]

    // Special case for sorting by faculty or program
    if (sortColumn === "facultyId") {
      aValue = getFacultyName(a.facultyId)
      bValue = getFacultyName(b.facultyId)
    } else if (sortColumn === "programId") {
      aValue = getProgramName(a.facultyId, a.programId)
      bValue = getProgramName(b.facultyId, b.programId)
    } else if (sortColumn === "instructorId") {
      const aInstructor = getInstructorDetails(a.instructorId)
      const bInstructor = getInstructorDetails(b.instructorId)
      aValue = aInstructor ? aInstructor.name : ""
      bValue = bInstructor ? bInstructor.name : ""
    }

    if (aValue === null) aValue = ""
    if (bValue === null) bValue = ""

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : aValue > bValue ? -1 : 1
  })

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle view student
  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/admin/students/${studentId}`)
  }

  // Handle edit student
  const handleEditStudent = (studentId: string) => {
    toast({
      title: "Edit Student",
      description: "This feature is not implemented yet.",
    })
  }

  // Handle delete student
  const handleDeleteStudent = (studentId: string) => {
    toast({
      variant: "destructive",
      title: "Delete Student",
      description: "This feature is not implemented yet.",
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Loading student data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (filteredStudents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>No students found matching the current filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 flex-col items-center justify-center">
            <User className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-xl font-medium">No Students Found</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Try adjusting your filters or search query to find students.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <CardDescription>
          Showing {paginatedStudents.length} of {filteredStudents.length} students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  <div className="flex items-center">
                    Student
                    {sortColumn === "name" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("facultyId")}>
                  <div className="flex items-center">
                    Faculty
                    {sortColumn === "facultyId" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("programId")}>
                  <div className="flex items-center">
                    Program
                    {sortColumn === "programId" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("instructorId")}>
                  <div className="flex items-center">
                    Instructor
                    {sortColumn === "instructorId" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("examStage")}>
                  <div className="flex items-center">
                    Exam Stage
                    {sortColumn === "examStage" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center">
                    Status
                    {sortColumn === "status" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => {
                const instructor = getInstructorDetails(student.instructorId)

                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.studentId}</div>
                    </TableCell>
                    <TableCell>{getFacultyName(student.facultyId)}</TableCell>
                    <TableCell>{getProgramName(student.facultyId, student.programId)}</TableCell>
                    <TableCell>
                      {instructor ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {instructor.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate max-w-[120px]">{instructor.name}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <div>{instructor.name}</div>
                                <div className="text-xs text-muted-foreground">{instructor.email}</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getExamStageBadgeVariant(student.examStage)}>
                        {formatExamStage(student.examStage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStudent(student.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredStudents.length)} of{" "}
              {filteredStudents.length} students
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

