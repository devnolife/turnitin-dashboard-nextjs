"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Clock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
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

interface PaymentItem {
  id: string
  amount: number
  status: string
  statusLabel: string
  method: string | null
  paidAt: string | null
  createdAt: string
}

interface StudentDetail {
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
  payments: PaymentItem[]
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
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchStudent = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get(`/admin/students/${studentId}`)
        const data = res.data
        setStudent(data.student)
      } catch {
        setError("Gagal mengambil detail mahasiswa")
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudent()
  }, [studentId])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
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
        <p className="text-muted-foreground">{error || "Data tidak tersedia."}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/admin/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
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
                <Link href="/dashboard/admin">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/admin/students">Mahasiswa</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{student.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin/students")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Detail Mahasiswa</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Student Info Card */}
          <FadeIn className="md:col-span-1">
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
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
                    <span className="font-medium">{student.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">No. HP</span>
                    <span className="font-medium">{student.hp}</span>
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

            {/* Exam Info */}
            {student.examDetail && (
              <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 mt-4">
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

          {/* Stats + Tabs */}
          <SlideUp className="md:col-span-2 space-y-4">
            <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StaggerItem>
                <Card className="rounded-2xl hover-lift">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
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
                      <CheckCircle className="h-4 w-4 text-green-500" />
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
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
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
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">Rata-rata</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{student.stats.avgSimilarity}%</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>

            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardContent className="pt-6">
                <Tabs defaultValue="submissions" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="submissions">Pengajuan ({student.submissions.length})</TabsTrigger>
                    <TabsTrigger value="payments">Pembayaran ({student.payments.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="submissions" className="space-y-4">
                    {student.submissions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-40" />
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
                                          ? "warning"
                                          : "success"
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
                  </TabsContent>

                  <TabsContent value="payments" className="space-y-4">
                    {student.payments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-40" />
                        <p>Belum ada riwayat pembayaran</p>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Jumlah</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Metode</TableHead>
                              <TableHead>Tanggal Bayar</TableHead>
                              <TableHead>Dibuat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {student.payments.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell className="font-medium">
                                  Rp {p.amount.toLocaleString("id-ID")}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      p.status === "COMPLETED"
                                        ? "success"
                                        : p.status === "FAILED"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {p.statusLabel}
                                  </Badge>
                                </TableCell>
                                <TableCell>{p.method || "-"}</TableCell>
                                <TableCell className="text-xs">{formatDateTime(p.paidAt)}</TableCell>
                                <TableCell className="text-xs">{formatDateTime(p.createdAt)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
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

