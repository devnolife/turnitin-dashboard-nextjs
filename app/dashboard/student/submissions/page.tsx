"use client"

import { useState } from "react"
import { FileText, Upload, Clock, CheckCircle, AlertTriangle, Search, Filter, Eye, Download, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import Link from "next/link"

const mockSubmissions = [
  {
    id: "SUB-001",
    title: "Skripsi Bab 1 - Pendahuluan",
    date: "12 Apr 2025",
    status: "Hasil Diterima",
    similarity: 12,
    instructor: "Instruktur Ahmad",
    fileSize: "2.4 MB",
  },
  {
    id: "SUB-002",
    title: "Skripsi Bab 2 - Tinjauan Pustaka",
    date: "7 Apr 2025",
    status: "Perlu Revisi",
    similarity: 35,
    instructor: "Instruktur Ahmad",
    fileSize: "3.1 MB",
  },
  {
    id: "SUB-003",
    title: "Proposal Penelitian",
    date: "18 Mar 2025",
    status: "Hasil Diterima",
    similarity: 8,
    instructor: "Instruktur Budi",
    fileSize: "1.8 MB",
  },
  {
    id: "SUB-004",
    title: "Skripsi Bab 3 - Metodologi Penelitian",
    date: "15 Apr 2025",
    status: "Menunggu Upload",
    similarity: 0,
    instructor: "Instruktur Ahmad",
    fileSize: "2.7 MB",
  },
  {
    id: "SUB-005",
    title: "Skripsi Bab 4 - Hasil dan Pembahasan",
    date: "20 Apr 2025",
    status: "Diproses Instruktur",
    similarity: 0,
    instructor: "Instruktur Ahmad",
    fileSize: "4.2 MB",
  },
  {
    id: "SUB-006",
    title: "Skripsi Bab 5 - Penutup",
    date: "22 Apr 2025",
    status: "Menunggu Upload",
    similarity: 0,
    instructor: "Instruktur Ahmad",
    fileSize: "1.5 MB",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Hasil Diterima":
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />{status}</Badge>
    case "Perlu Revisi":
      return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />{status}</Badge>
    case "Diproses Instruktur":
      return <Badge variant="outline" className="border-blue-300 text-blue-600"><Clock className="mr-1 h-3 w-3" />{status}</Badge>
    case "Menunggu Upload":
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />{status}</Badge>
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
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredSubmissions = mockSubmissions.filter((sub) => {
    const matchesSearch = sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" ||
      (activeTab === "completed" && sub.status === "Hasil Diterima") ||
      (activeTab === "processing" && (sub.status === "Diproses Instruktur" || sub.status === "Menunggu Upload")) ||
      (activeTab === "revision" && sub.status === "Perlu Revisi")
    return matchesSearch && matchesTab
  })

  const totalSubmissions = mockSubmissions.length
  const completedCount = mockSubmissions.filter(s => s.status === "Hasil Diterima").length
  const processingCount = mockSubmissions.filter(s => s.status === "Diproses Instruktur" || s.status === "Menunggu Upload").length
  const revisionCount = mockSubmissions.filter(s => s.status === "Perlu Revisi").length
  const avgSimilarity = Math.round(
    mockSubmissions.filter(s => s.similarity > 0).reduce((sum, s) => sum + s.similarity, 0) /
    (mockSubmissions.filter(s => s.similarity > 0).length || 1)
  )

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
              <p className="text-xs text-muted-foreground">Menunggu / diproses</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium truncate">Avg. Similarity</CardTitle>
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
            <CardDescription>Semua dokumen yang telah Anda kirim untuk dicek Turnitin</CardDescription>
          </div>
          <Button className="bg-gradient-to-r from-primary-dark to-primary text-white">
            <Upload className="mr-2 h-4 w-4" />
            Kirim Dokumen Baru
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dokumen atau instruktur..."
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
                      <TableHead className="hidden sm:table-cell">Instruktur</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Similarity</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                          <p className="text-muted-foreground">Tidak ada dokumen yang ditemukan.</p>
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
                                <div className="text-xs text-muted-foreground">{submission.fileSize}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{submission.date}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{submission.instructor}</TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                          <TableCell>{getSimilarityBadge(submission.similarity)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {submission.status === "Hasil Diterima" && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
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
