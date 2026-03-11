"use client"

import { useState, useEffect } from "react"
import { FileText, Clock, CheckCircle, AlertTriangle, Search, Eye, Download, BarChart3, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { useAuthStore } from "@/lib/store/auth-store"

interface SubmissionData {
  id: string
  title: string
  date: string
  status: string
  rawStatus: string
  similarity: number
  feedback: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  documentUrl: string
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Hasil Diterima":
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />{status}</Badge>
    case "Perlu Revisi":
      return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />{status}</Badge>
    case "Menunggu Hasil":
      return <Badge variant="outline" className="border-blue-300 text-blue-600"><Clock className="mr-1 h-3 w-3" />{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getSimilarityBadge(similarity: number) {
  if (similarity === 0) return <span className="text-sm text-muted-foreground">—</span>
  const variant = similarity < 15 ? "outline" : similarity < 30 ? "secondary" : "destructive"
  return <Badge variant={variant}>{similarity}%</Badge>
}

export default function StudentSubmissionsPage() {
  const { user } = useAuthStore()
  const [submissions, setSubmissions] = useState<SubmissionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchSubmissions() {
      if (!user?.id) return
      try {
        setIsLoading(true)
        const res = await fetch(`/api/submissions?userId=${user.id}`)
        if (!res.ok) throw new Error("Gagal memuat data")
        const data = await res.json()
        setSubmissions(data.submissions || [])
      } catch {
        setError("Gagal memuat data pengiriman. Silakan coba lagi.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubmissions()
  }, [user?.id])

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = sub.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" ||
      (activeTab === "completed" && sub.status === "Hasil Diterima") ||
      (activeTab === "processing" && sub.status === "Menunggu Hasil") ||
      (activeTab === "revision" && sub.status === "Perlu Revisi")
    return matchesSearch && matchesTab
  })

  const totalSubmissions = submissions.length
  const completedCount = submissions.filter(s => s.status === "Hasil Diterima").length
  const processingCount = submissions.filter(s => s.status === "Menunggu Hasil").length
  const revisionCount = submissions.filter(s => s.status === "Perlu Revisi").length
  const withScore = submissions.filter(s => s.similarity > 0)
  const avgSimilarity = withScore.length > 0
    ? Math.round(withScore.reduce((sum, s) => sum + s.similarity, 0) / withScore.length)
    : 0

  if (isLoading) {
    return (
      <DashboardMainCard
        title="Pengiriman Dokumen"
        subtitle="Kelola dan pantau semua dokumen yang telah Anda kirimkan 📄"
        icon={FileText}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Memuat data pengiriman...</span>
        </div>
      </DashboardMainCard>
    )
  }

  if (error) {
    return (
      <DashboardMainCard
        title="Pengiriman Dokumen"
        subtitle="Kelola dan pantau semua dokumen yang telah Anda kirimkan 📄"
        icon={FileText}
      >
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950 text-center">
          <p className="text-red-800 dark:text-red-300">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </DashboardMainCard>
    )
  }

  return (
    <DashboardMainCard
      title="Pengiriman Dokumen"
      subtitle="Kelola dan pantau semua dokumen yang telah Anda kirimkan 📄"
      icon={FileText}
    >
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pengiriman</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><AnimatedCounter value={totalSubmissions} /></div>
              <p className="text-xs text-muted-foreground">Dokumen terkirim</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600"><AnimatedCounter value={completedCount} /></div>
              <p className="text-xs text-muted-foreground">Hasil sudah diterima</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
              <Clock className="h-4 w-4 text-blue-500 shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600"><AnimatedCounter value={processingCount} /></div>
              <p className="text-xs text-muted-foreground">Menunggu hasil</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Similarity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><AnimatedCounter value={avgSimilarity} />%</div>
              <p className="text-xs text-muted-foreground">{revisionCount} perlu revisi</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Daftar Pengiriman</CardTitle>
            <CardDescription>Semua dokumen yang telah Anda kirim untuk dicek Perpusmu</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dokumen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full w-full sm:w-auto">
              <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Semua ({totalSubmissions})
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Selesai ({completedCount})
              </TabsTrigger>
              <TabsTrigger value="processing" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Proses ({processingCount})
              </TabsTrigger>
              <TabsTrigger value="revision" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Revisi ({revisionCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="rounded-xl border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dokumen</TableHead>
                      <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Similarity</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                          <p className="text-muted-foreground">
                            {submissions.length === 0
                              ? "Anda belum memiliki pengiriman dokumen."
                              : "Tidak ada dokumen yang ditemukan."}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div>
                                <div className="font-medium">{submission.title}</div>
                                {submission.reviewedBy && (
                                  <div className="text-xs text-muted-foreground">Direview oleh: {submission.reviewedBy}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{submission.date}</TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                          <TableCell>{getSimilarityBadge(submission.similarity)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {submission.documentUrl && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                  <a href={submission.documentUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {submission.status === "Hasil Diterima" && submission.feedback && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                  <a href={submission.feedback} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardMainCard>
  )
}
