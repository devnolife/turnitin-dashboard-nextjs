"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useStudentStore } from "@/lib/store/student-store"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { useAuthStore } from "@/lib/store/auth-store"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import api from "@/lib/api/client"
import React from "react"

interface InstructorStudent {
  id: string
  name: string
  nim: string
  email: string | null
  prodi: string
  submissionsCount: number
  avgSimilarity: number
  examDetail: { thesisTitle: string; examType: string; approvalStatus: string } | null
}

export function InstructorStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<InstructorStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true)
      try {
        const res = await api.get("/instructor/students")
        setStudents(res.data.students || [])
      } catch {
        setStudents([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const filteredStudents = React.useMemo(() => {
    if (!searchQuery) return students
    const q = searchQuery.toLowerCase()
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nim.toLowerCase().includes(q) ||
        (s.examDetail?.thesisTitle && s.examDetail.thesisTitle.toLowerCase().includes(q)),
    )
  }, [students, searchQuery])

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/instructor/students/${studentId}`)
  }

  const handleEmailStudent = (email: string | null) => {
    if (!email) return
    toast({
      title: "Email Terkirim",
      description: `Email telah dikirim ke ${email}`,
    })
  }

  return (
    <PageTransition>
      <DashboardMainCard title="Daftar Mahasiswa" subtitle="Kelola dan pantau mahasiswa 👥" icon={Users}>
      <div className="flex flex-col gap-6">
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="hover-lift rounded-3xl border border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={students.length} />
                </div>
                <p className="text-xs text-muted-foreground">Mahasiswa terdaftar</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift rounded-3xl border border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Pengajuan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={students.reduce((a, s) => a + s.submissionsCount, 0)} />
                </div>
                <p className="text-xs text-muted-foreground">Dokumen diajukan</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift rounded-3xl border border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ujian Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={students.filter((s) => s.examDetail != null).length} />
                </div>
                <p className="text-xs text-muted-foreground">Mahasiswa dengan ujian</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift rounded-3xl border border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Similarity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.length > 0
                    ? Math.round(students.reduce((a, s) => a + s.avgSimilarity, 0) / students.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Seluruh mahasiswa</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card className="rounded-3xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Mahasiswa</CardTitle>
            <CardDescription>Daftar mahasiswa dalam sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari mahasiswa..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahasiswa</TableHead>
                    <TableHead>Program Studi</TableHead>
                    <TableHead>Pengajuan</TableHead>
                    <TableHead>Similarity</TableHead>
                    <TableHead>Judul Skripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span className="ml-2">Memuat data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.nim}</div>
                        </TableCell>
                        <TableCell>{student.prodi}</TableCell>
                        <TableCell>{student.submissionsCount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.avgSimilarity > 30
                                ? "destructive"
                                : student.avgSimilarity > 20
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {student.avgSimilarity}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {student.examDetail?.thesisTitle || "Belum ada judul skripsi"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewStudent(student.id)}>
                              <Eye className="size-4" />
                              <span className="sr-only">Lihat</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-lg font-medium">Tidak ada mahasiswa ditemukan</p>
                          <p className="text-sm text-muted-foreground">
                            {students.length === 0
                              ? "Belum ada mahasiswa terdaftar."
                              : "Coba sesuaikan pencarian Anda."}
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

