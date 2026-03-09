"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, X, Mail, FileText, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import type { ExamStage } from "@/lib/store/student-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { DashboardMainCard } from "@/components/dashboard/main-card"
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
        return "Pendaftar"
      case "proposal_exam":
        return "Ujian Proposal"
      case "results_exam":
        return "Ujian Hasil"
      case "final_exam":
        return "Ujian Akhir"
      case "graduated":
        return "Lulus"
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

  // Get program name from student data
  const getProgramName = (programId: string) => {
    return programId || "Program Tidak Diketahui"
  }

  // Get available programs from student data
  const getAvailablePrograms = React.useCallback(() => {
    const programMap = new Map<string, string>()
    allStudents.forEach((student: any) => {
      if (student.programId && !programMap.has(student.programId)) {
        programMap.set(student.programId, student.programId)
      }
    })
    return Array.from(programMap, ([id, name]) => ({ id, name }))
  }, [allStudents])

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
      title: "Email Terkirim",
      description: `Email telah dikirim ke ${email}`,
    })
  }

  // Handle view submissions
  const handleViewSubmissions = (studentId: string) => {
    router.push(`/dashboard/instructor/submissions?studentId=${studentId}`)
  }

  return (
    <PageTransition>
      <DashboardMainCard title="Daftar Mahasiswa" subtitle="Kelola dan pantau mahasiswa di bawah pengawasan Anda 👥" icon={Users}>
      <div className="flex flex-col gap-6">
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={allStudents.length} />
                </div>
                <p className="text-xs text-muted-foreground">Di bawah pengawasan Anda</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ujian Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={countStudentsByExamStage("proposal_exam")} />
                </div>
                <p className="text-xs text-muted-foreground">Mahasiswa tahap proposal</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ujian Hasil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={countStudentsByExamStage("results_exam")} />
                </div>
                <p className="text-xs text-muted-foreground">Mahasiswa tahap hasil</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ujian Akhir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={countStudentsByExamStage("final_exam")} />
                </div>
                <p className="text-xs text-muted-foreground">Mahasiswa tahap akhir</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Mahasiswa</CardTitle>
            <CardDescription>Kelola mahasiswa di bawah pengawasan Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari mahasiswa..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={programFilter || ""} onValueChange={(value) => setProgramFilter(value || null)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Semua Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_programs">Semua Program</SelectItem>
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
                    <SelectValue placeholder="Semua Tahap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahap</SelectItem>
                    <SelectItem value="proposal_exam">Ujian Proposal</SelectItem>
                    <SelectItem value="results_exam">Ujian Hasil</SelectItem>
                    <SelectItem value="final_exam">Ujian Akhir</SelectItem>
                    <SelectItem value="graduated">Lulus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters */}
            {(programFilter || examStageFilter !== "all" || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filter aktif:</span>
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
                      <span className="sr-only">Hapus filter program</span>
                    </Button>
                  </Badge>
                )}

                {examStageFilter !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Tahap: {formatExamStage(examStageFilter)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setExamStageFilter("all")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Hapus filter tahap</span>
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
                    setProgramFilter(null)
                    setExamStageFilter("all")
                    setSearchQuery("")
                  }}
                >
                  Hapus semua
                </Button>
              </div>
            )}

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahasiswa</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Tahap Ujian</TableHead>
                    <TableHead>Judul Skripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
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
                        <TableCell>{getProgramName(student.programId)}</TableCell>
                        <TableCell>
                          <Badge variant={getExamStageBadgeVariant(student.examStage)}>
                            {formatExamStage(student.examStage)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{student.thesisTitle || "Belum ada judul skripsi"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewStudent(student.id)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Lihat</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEmailStudent(student.email)}>
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Email</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleViewSubmissions(student.id)}>
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Pengiriman</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-lg font-medium">Tidak ada mahasiswa ditemukan</p>
                          <p className="text-sm text-muted-foreground">
                            {allStudents.length === 0
                              ? "Anda belum memiliki mahasiswa yang ditugaskan."
                              : "Coba sesuaikan filter Anda untuk menemukan mahasiswa."}
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
      </DashboardMainCard>
    </PageTransition>
  )
}

