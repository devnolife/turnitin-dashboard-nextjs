"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Filter,
  X,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { SubmissionsTable } from "./submissions-table"
import { SubmissionDetailDialog } from "./submission-detail-dialog"

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
          studentName: result.studentId.replace("student-", "Mahasiswa "),
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
          description: "Gagal memuat pengiriman. Silakan coba lagi.",
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
          submission.studentName.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((submission) => submission.status === statusFilter)
    }

    // Apply student filter
    if (studentFilter !== "all") {
      filtered = filtered.filter((submission) => submission.studentId === studentFilter)
    }

    setFilteredSubmissions(filtered)
  }, [searchQuery, statusFilter, studentFilter, submissions])

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
    return new Date(dateString).toLocaleDateString("id-ID", {
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
      title: "Feedback Terkirim",
      description: "Feedback Anda telah berhasil dikirim.",
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
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Pengiriman</h1>
          <p className="text-muted-foreground">Tinjau dan berikan feedback pada pengiriman mahasiswa</p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Pengiriman</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{submissions.length}</div>
                <p className="text-xs text-muted-foreground">Semua pengiriman</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Menunggu Upload</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((submission) => submission.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Perlu di-upload ke Turnitin</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sudah Ditinjau</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((submission) => submission.status === "reviewed").length}
                </div>
                <p className="text-xs text-muted-foreground">Hasil sudah dikirim</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ditandai</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((submission) => submission.status === "flagged").length}
                </div>
                <p className="text-xs text-muted-foreground">Perlu perhatian</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari pengiriman..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="reviewed">Ditinjau</SelectItem>
                <SelectItem value="flagged">Ditandai</SelectItem>
              </SelectContent>
            </Select>

            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Mahasiswa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mahasiswa</SelectItem>
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
        {(statusFilter !== "all" || studentFilter !== "all" || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter aktif:</span>
            </div>

            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter === "pending" ? "Menunggu" : statusFilter === "reviewed" ? "Ditinjau" : "Ditandai"}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setStatusFilter("all")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Hapus filter status</span>
                </Button>
              </Badge>
            )}

            {studentFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Mahasiswa: {getUniqueStudents().find((s) => s.id === studentFilter)?.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setStudentFilter("all")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Hapus filter mahasiswa</span>
                </Button>
              </Badge>
            )}

            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Cari: {searchQuery}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Hapus pencarian</span>
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
              Hapus semua
            </Button>
          </div>
        )}

        <SubmissionsTable
          filteredSubmissions={filteredSubmissions}
          totalSubmissions={submissions.length}
          formatDate={formatDate}
          onViewSubmission={handleViewSubmission}
          onProvideFeedback={handleProvideFeedback}
        />

        <SubmissionDetailDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          selectedSubmission={selectedSubmission}
          feedbackText={feedbackText}
          onFeedbackTextChange={setFeedbackText}
          onSubmitFeedback={handleSubmitFeedback}
          formatDate={formatDate}
        />
      </div>
    </PageTransition>
  )
}

