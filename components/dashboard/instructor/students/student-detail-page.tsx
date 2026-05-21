"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { PageTransition, FadeIn, SlideUp, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import api from "@/lib/api/client"
import React from "react"

interface Submission {
  id: string
  title: string
  documentUrl: string
  similarity: number | null
  status: string
  statusLabel: string
  feedback: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

interface StudentDetailData {
  id: string
  name: string
  nim: string
  email: string
  hp: string
  prodi: string
  hasCompletedPayment: boolean
  createdAt: string
  examDetail: {
    id: string
    thesisTitle: string
    examType: string
    examTypeLabel: string
    approvalStatus: string
    approvalLabel: string
    submittedAt: string
    reviewedAt: string | null
  } | null
  submissions: Submission[]
  stats: {
    submissionsCount: number
    reviewedCount: number
    flaggedCount: number
    pendingCount: number
    avgSimilarity: number
  }
}

interface StudentDetailPageProps {
  studentId: string
}

export function StudentDetailPage({ studentId }: StudentDetailPageProps) {
  const [student, setStudent] = useState<StudentDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchStudent = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get(`/instructor/students/${studentId}`)
        setStudent(res.data.student)
      } catch {
        setError("Gagal mengambil detail mahasiswa")
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudent()
  }, [studentId])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Belum dijadwalkan"
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleApproveExam = () => {
    toast({
      title: "Ujian Disetujui",
      description: "Ujian mahasiswa telah berhasil disetujui.",
    })
  }

  const handleRejectExam = () => {
    toast({
      variant: "destructive",
      title: "Ujian Ditolak",
      description: "Ujian mahasiswa telah ditolak.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="size-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Mahasiswa Tidak Ditemukan</h2>
        <p className="text-muted-foreground">{error || "Mahasiswa yang diminta tidak dapat ditemukan."}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/instructor/students")}>
          <ArrowLeft className="mr-2 size-4" />
          Kembali ke Daftar Mahasiswa
        </Button>
      </div>
    )
  }

  const initials = student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/instructor">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/instructor/students">Mahasiswa</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{student.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/instructor/students")}>
              <ArrowLeft className="size-4" />
              <span className="sr-only">Kembali</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Detail Mahasiswa</h1>
          </div>

          <div className="flex gap-2">
            {student.email && (
              <Button variant="outline" onClick={() => (window.location.href = `mailto:${student.email}`)}>
                <Mail className="mr-2 size-4" />
                Email Mahasiswa
              </Button>
            )}
            {student.examDetail && student.examDetail.approvalStatus === "PENDING" && (
              <>
                <Button variant="success" onClick={handleApproveExam}>
                  <CheckCircle className="mr-2 size-4" />
                  Setujui
                </Button>
                <Button variant="destructive" onClick={handleRejectExam}>
                  <XCircle className="mr-2 size-4" />
                  Tolak
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FadeIn className="md:col-span-1">
            <Card className="rounded-3xl border border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="size-20 mb-4">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{student.name}</h2>
                  <p className="text-sm text-muted-foreground">{student.nim}</p>
                  <Badge variant={student.hasCompletedPayment ? "success" : "secondary"} className="mt-2">
                    {student.hasCompletedPayment ? "Pembayaran Lunas" : "Belum Bayar"}
                  </Badge>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{student.email || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">No. HP</span>
                    <span className="font-medium">{student.hp || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Program Studi</span>
                    <span className="font-medium">{student.prodi}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Terdaftar</span>
                    <span className="font-medium">{formatDate(student.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {student.examDetail && (
              <Card className="rounded-3xl border border-border shadow-sm mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Info Ujian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Judul Skripsi</p>
                    <p className="text-sm font-medium">{student.examDetail.thesisTitle}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jenis Ujian</span>
                    <span className="font-medium">{student.examDetail.examTypeLabel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        student.examDetail.approvalStatus === "APPROVED"
                          ? "success"
                          : student.examDetail.approvalStatus === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {student.examDetail.approvalLabel}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diajukan</span>
                    <span className="font-medium">{formatDate(student.examDetail.submittedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </FadeIn>

          <SlideUp className="md:col-span-2 space-y-4">
            <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StaggerItem>
                <Card className="rounded-2xl hover-lift">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Pengajuan</span>
                    </div>
                    <p className="text-2xl font-bold mt-1"><AnimatedCounter value={student.stats.submissionsCount} /></p>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="rounded-2xl hover-lift">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Direview</span>
                    </div>
                    <p className="text-2xl font-bold mt-1"><AnimatedCounter value={student.stats.reviewedCount} /></p>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="rounded-2xl hover-lift">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-orange-500" />
                      <span className="text-xs text-muted-foreground">Ditandai</span>
                    </div>
                    <p className="text-2xl font-bold mt-1"><AnimatedCounter value={student.stats.flaggedCount} /></p>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="rounded-2xl hover-lift">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">Rata-rata</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{student.stats.avgSimilarity}%</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>

            <Card className="rounded-3xl border border-border shadow-sm">
              <CardHeader>
                <CardTitle>Riwayat Pengajuan</CardTitle>
                <CardDescription>Dokumen yang telah diajukan oleh mahasiswa</CardDescription>
              </CardHeader>
              <CardContent>
                {student.submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="size-12 mx-auto mb-2 opacity-40" />
                    <p>Belum ada pengajuan</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dokumen</TableHead>
                          <TableHead>Similarity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Feedback</TableHead>
                          <TableHead>Tanggal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.submissions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium max-w-[200px] truncate">{sub.title}</TableCell>
                            <TableCell>
                              {sub.similarity !== null ? (
                                <Badge
                                  variant={
                                    sub.similarity > 30
                                      ? "destructive"
                                      : sub.similarity > 20
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {sub.similarity}%
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  sub.status === "REVIEWED"
                                    ? "success"
                                    : sub.status === "FLAGGED"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {sub.statusLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-xs">
                              {sub.feedback || "-"}
                            </TableCell>
                            <TableCell className="text-xs">{formatDateTime(sub.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </div>
    </PageTransition>
  )
}

