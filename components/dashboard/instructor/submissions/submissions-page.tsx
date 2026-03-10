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
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { SubmissionsTable } from "./submissions-table"
import { SubmissionDetailDialog } from "./submission-detail-dialog"

interface SubmissionData {
  id: string
  userId: string
  documentTitle: string
  documentUrl: string
  similarityScore: number | null
  status: string
  reportUrl: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    username: string
    nim: string | null
    prodi: string | null
  }
  // Computed fields
  studentId: string
  studentName: string
  comments: string | null
}

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [studentFilter, setStudentFilter] = useState<string>("all")
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null)
  const [feedbackText, setFeedbackText] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/instructor/submissions")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()

        const enhanced: SubmissionData[] = (data.submissions || []).map((s: any) => ({
          ...s,
          studentId: s.user.id,
          studentName: s.user.name || s.user.username,
          comments: s.reportUrl,
          status: s.status.toLowerCase(),
        }))

        setSubmissions(enhanced)

        const studentId = searchParams.get("studentId")
        if (studentId) {
          setStudentFilter(studentId)
        }
      } catch {
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
  }, [searchParams, toast])

  // Apply filters
  useEffect(() => {
    let filtered = [...submissions]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.documentTitle.toLowerCase().includes(query) ||
          s.studentName.toLowerCase().includes(query),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    if (studentFilter !== "all") {
      filtered = filtered.filter((s) => s.studentId === studentFilter)
    }

    setFilteredSubmissions(filtered)
  }, [searchQuery, statusFilter, studentFilter, submissions])

  const getUniqueStudents = () => {
    const students = new Map()
    submissions.forEach((s) => {
      if (!students.has(s.studentId)) {
        students.set(s.studentId, s.studentName)
      }
    })
    return Array.from(students, ([id, name]) => ({ id, name }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/dashboard/instructor/submissions/${submissionId}`)
  }

  const handleProvideFeedback = (submission: SubmissionData) => {
    setSelectedSubmission(submission)
    setFeedbackText(submission.comments || "")
    setFeedbackDialogOpen(true)
  }

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission || !feedbackText.trim()) return

    try {
      const res = await fetch(`/api/instructor/submissions/${selectedSubmission.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: feedbackText,
          status: "REVIEWED",
        }),
      })

      if (!res.ok) throw new Error("Failed")

      // Update local state
      const updatedSubmissions = submissions.map((s) =>
        s.id === selectedSubmission.id
          ? {
              ...s,
              comments: feedbackText,
              status: "reviewed",
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.id || "",
            }
          : s,
      )

      setSubmissions(updatedSubmissions)
      setFeedbackDialogOpen(false)
      setSelectedSubmission(null)
      setFeedbackText("")

      toast({
        title: "Feedback Terkirim",
        description: "Feedback Anda telah berhasil disimpan ke database.",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menyimpan feedback. Silakan coba lagi.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <PageTransition>
      <DashboardMainCard title="Pengiriman" subtitle="Kelola dan tinjau pengiriman dokumen mahasiswa 📄" icon={FileText}>
      <div className="flex flex-col gap-6">
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
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
            <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Menunggu Upload</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((s) => s.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Perlu di-upload ke Perpusmu</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sudah Ditinjau</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((s) => s.status === "reviewed").length}
                </div>
                <p className="text-xs text-muted-foreground">Hasil sudah dikirim</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ditandai</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {submissions.filter((s) => s.status === "flagged").length}
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
      </DashboardMainCard>
    </PageTransition>
  )
}

