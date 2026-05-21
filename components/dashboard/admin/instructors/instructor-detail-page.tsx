"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, FileCheck, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ResetPasswordButton } from "@/components/dashboard/admin/reset-password-button"
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

interface ReviewedSubmission {
  id: string
  title: string
  similarity: number | null
  status: string
  statusLabel: string
  feedback: string | null
  reviewedAt: string | null
  createdAt: string
  student: {
    id: string
    name: string
    nim: string | null
    prodi: string | null
  }
}

interface InstructorDetail {
  id: string
  name: string
  username: string
  email: string
  hp: string
  prodi: string
  createdAt: string
  reviewedSubmissions: ReviewedSubmission[]
  stats: {
    totalReviewed: number
    totalFlagged: number
    totalSubmissions: number
    avgSimilarity: number
  }
}

interface InstructorDetailPageProps {
  instructorId: string
}

export function InstructorDetailPage({ instructorId }: InstructorDetailPageProps) {
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchInstructor = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get(`/admin/instructors/${instructorId}`)
        const data = res.data
        setInstructor(data.instructor)
      } catch {
        setError("Gagal mengambil detail instruktur")
      } finally {
        setIsLoading(false)
      }
    }
    fetchInstructor()
  }, [instructorId])

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

  if (error || !instructor) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Instruktur Tidak Ditemukan</h2>
        <p className="text-muted-foreground">{error || "Data tidak tersedia."}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/admin/instructors")}>
          <ArrowLeft className="mr-2 size-4" />
          Kembali ke Daftar Instruktur
        </Button>
      </div>
    )
  }

  const initials = instructor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

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
                <Link href="/dashboard/admin/instructors">Instruktur</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{instructor.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin/instructors")}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Detail Instruktur</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Info Card */}
          <FadeIn className="md:col-span-1">
            <Card className="rounded-3xl border border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="size-20 mb-4">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{instructor.name}</h2>
                  <p className="text-sm text-muted-foreground">@{instructor.username}</p>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-muted-foreground" />
                    <span>{instructor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>{instructor.hp}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Program Studi</span>
                    <span className="font-medium">{instructor.prodi}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bergabung</span>
                    <span className="font-medium">{formatDate(instructor.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-6 border-t pt-4 flex justify-center">
                  <ResetPasswordButton
                    userId={instructor.id}
                    userName={instructor.name}
                    username={instructor.username}
                  />
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Stats + Submissions */}
          <SlideUp className="md:col-span-2 space-y-4">
            <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StaggerItem>
                <Card className="rounded-2xl hover-lift">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <FileCheck className="size-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <p className="text-2xl font-bold mt-1"><AnimatedCounter value={instructor.stats.totalSubmissions} /></p>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="rounded-2xl hover-lift">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <FileCheck className="size-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Direview</span>
                    </div>
                    <p className="text-2xl font-bold mt-1"><AnimatedCounter value={instructor.stats.totalReviewed} /></p>
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
                    <p className="text-2xl font-bold mt-1"><AnimatedCounter value={instructor.stats.totalFlagged} /></p>
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
                    <p className="text-2xl font-bold mt-1">{instructor.stats.avgSimilarity}%</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>

            <Card className="rounded-3xl border border-border shadow-sm">
              <CardHeader>
                <CardTitle>Riwayat Review ({instructor.reviewedSubmissions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {instructor.reviewedSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="size-12 mx-auto mb-2 opacity-40" />
                    <p>Belum ada dokumen yang direview</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dokumen</TableHead>
                          <TableHead>Mahasiswa</TableHead>
                          <TableHead>Prodi</TableHead>
                          <TableHead>Similarity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tanggal Review</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {instructor.reviewedSubmissions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium max-w-[200px] truncate">{sub.title}</TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{sub.student.name}</p>
                                <p className="text-xs text-muted-foreground">{sub.student.nim || "-"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{sub.student.prodi || "-"}</TableCell>
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
                            <TableCell className="text-xs">{formatDateTime(sub.reviewedAt)}</TableCell>
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
