"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Filter,
  X,
  FileText,
  MoreHorizontal,
  Download,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [studentFilter, setStudentFilter] = useState<string>("all")
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [feedbackText, setFeedbackText] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { getTurnitinResultsByInstructor } = useInstructorStore()

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true)

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Get submissions from instructor store
        const results = user?.id ? getTurnitinResultsByInstructor(user.id) : []

        // Add additional mock data
        const enhancedResults = results.map((result) => ({
          ...result,
          courseId: `course-${Math.floor(Math.random() * 3) + 1}`,
          courseName: ["Computer Science 101", "Data Science 202", "AI Ethics 301"][Math.floor(Math.random() * 3)],
          studentName: result.studentId.replace("student-", "Student "),
        }))

        setSubmissions(enhancedResults)

        // Check if there's a studentId in the URL params
        const studentId = searchParams.get("studentId")
        if (studentId) {
          setStudentFilter(studentId)
          setFilteredSubmissions(enhancedResults.filter((submission) => submission.studentId === studentId))
        } else {
          setFilteredSubmissions(enhancedResults)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load submissions. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubmissions()
  }, [user?.id, getTurnitinResultsByInstructor, searchParams, toast])

  // Apply filters
  useEffect(() => {
    let filtered = [...submissions]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (submission) =>
          submission.documentTitle.toLowerCase().includes(query) ||
          submission.studentName.toLowerCase().includes(query) ||
          submission.courseName.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((submission) => submission.status === statusFilter)
    }

    // Apply course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter((submission) => submission.courseId === courseFilter)
    }

    // Apply student filter
    if (studentFilter !== "all") {
      filtered = filtered.filter((submission) => submission.studentId === studentFilter)
    }

    setFilteredSubmissions(filtered)
  }, [searchQuery, statusFilter, courseFilter, studentFilter, submissions])

  // Get unique courses
  const getUniqueCourses = () => {
    const courses = new Map()
    submissions.forEach((submission) => {
      if (!courses.has(submission.courseId)) {
        courses.set(submission.courseId, submission.courseName)
      }
    })
    return Array.from(courses, ([id, name]) => ({ id, name }))
  }

  // Get unique students
  const getUniqueStudents = () => {
    const students = new Map()
    submissions.forEach((submission) => {
      if (!students.has(submission.studentId)) {
        students.set(submission.studentId, submission.studentName)
      }
    })
    return Array.from(students, ([id, name]) => ({ id, name }))
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Handle view submission
  const handleViewSubmission = (submissionId: string) => {
    router.push(`/dashboard/instructor/submissions/${submissionId}`)
  }

  // Handle provide feedback
  const handleProvideFeedback = (submission: any) => {
    setSelectedSubmission(submission)
    setFeedbackText(submission.comments || "")
    setFeedbackDialogOpen(true)
  }

  // Handle submit feedback
  const handleSubmitFeedback = () => {
    if (!selectedSubmission || !feedbackText.trim()) return

    // Update submission in state
    const updatedSubmissions = submissions.map((submission) =>
      submission.id === selectedSubmission.id
        ? {
            ...submission,
            comments: feedbackText,
            status: "reviewed",
            reviewedAt: new Date().toISOString(),
            reviewedBy: user?.id || "instructor-1",
          }
        : submission,
    )

    setSubmissions(updatedSubmissions)

    // Close dialog and reset state
    setFeedbackDialogOpen(false)
    setSelectedSubmission(null)
    setFeedbackText("")

    toast({
      title: "Feedback Submitted",
      description: "Your feedback has been submitted successfully.",
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Submissions</h1>
          <p className="text-muted-foreground">Review and grade student submissions</p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{submissions.length}</div>
                <p className="text-xs text-muted-foreground">All submissions</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((submission) => submission.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting your review</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((submission) => submission.status === "reviewed").length}
                </div>
                <p className="text-xs text-muted-foreground">Submissions reviewed</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Flagged</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((submission) => submission.status === "flagged").length}
                </div>
                <p className="text-xs text-muted-foreground">Submissions flagged</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search submissions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {getUniqueCourses().map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {getUniqueStudents().map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters */}
        {(statusFilter !== "all" || courseFilter !== "all" || studentFilter !== "all" || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active filters:</span>
            </div>

            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setStatusFilter("all")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove status filter</span>
                </Button>
              </Badge>
            )}

            {courseFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Course: {getUniqueCourses().find((c) => c.id === courseFilter)?.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setCourseFilter("all")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove course filter</span>
                </Button>
              </Badge>
            )}

            {studentFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Student: {getUniqueStudents().find((s) => s.id === studentFilter)?.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setStudentFilter("all")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove student filter</span>
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
                setStatusFilter("all")
                setCourseFilter("all")
                setStudentFilter("all")
                setSearchQuery("")
              }}
            >
              Clear all
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Review and provide feedback on student submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Similarity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <div>
                              <div className="font-medium">{submission.documentTitle}</div>
                              <div className="text-xs text-muted-foreground">
                                Submitted on {formatDate(submission.submittedAt)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {submission.studentName
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{submission.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{submission.courseName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <Progress
                                value={submission.similarityScore}
                                max={100}
                                className="h-2"
                                indicatorColor={
                                  submission.similarityScore < 15
                                    ? "bg-green-500"
                                    : submission.similarityScore < 30
                                      ? "bg-blue-500"
                                      : submission.similarityScore < 50
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                }
                              />
                            </div>
                            <span className="text-sm font-medium">{submission.similarityScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.status === "reviewed"
                                ? "default"
                                : submission.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewSubmission(submission.id)}>
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewSubmission(submission.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Report
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleProvideFeedback(submission)}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Provide Feedback
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className={
                                    submission.status !== "flagged"
                                      ? "text-amber-500 focus:text-amber-500"
                                      : "text-muted-foreground"
                                  }
                                  disabled={submission.status === "flagged"}
                                >
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Flag Submission
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground/60" />
                          <h3 className="mt-2 text-lg font-medium">No Submissions</h3>
                          <p className="text-sm text-muted-foreground">
                            {submissions.length === 0
                              ? "There are no submissions to review."
                              : "No submissions match your current filters."}
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

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Provide Feedback</DialogTitle>
              <DialogDescription>
                Add your feedback for this submission. The student will be able to view your comments.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedSubmission && (
                <div className="rounded-md border p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{selectedSubmission.documentTitle}</div>
                    <Badge
                      variant={
                        selectedSubmission.similarityScore < 15
                          ? "outline"
                          : selectedSubmission.similarityScore < 30
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {selectedSubmission.similarityScore}% Similarity
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Submitted by {selectedSubmission.studentName} on {formatDate(selectedSubmission.submittedAt)}
                  </div>
                </div>
              )}
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
              <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}

