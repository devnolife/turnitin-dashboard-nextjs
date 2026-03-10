"use client"

import { useState } from "react"
import { MessageSquare, ThumbsUp, AlertCircle, Download, FileText, CheckCircle, Clock, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"

const mockFeedback = [
  {
    id: "FB-001",
    document: "Skripsi Bab 1 - Pendahuluan",
    instructor: "Instruktur Ahmad",
    date: "12 Apr 2025",
    type: "Hasil" as const,
    similarity: 12,
    content: "hasil Perpusmu menunjukkan similarity 12%. Dokumen Anda sudah memenuhi standar. Silakan lanjutkan ke bab berikutnya.",
  },
  {
    id: "FB-002",
    document: "Skripsi Bab 2 - Tinjauan Pustaka",
    instructor: "Instruktur Ahmad",
    date: "7 Apr 2025",
    type: "Revisi" as const,
    similarity: 35,
    content: "Similarity masih 35%. Perlu revisi pada bagian kajian teori. Harap parafrasa ulang referensi yang di-highlight.",
  },
  {
    id: "FB-003",
    document: "Proposal Penelitian",
    instructor: "Instruktur Budi",
    date: "18 Mar 2025",
    type: "Hasil" as const,
    similarity: 8,
    content: "Similarity 8%. Dokumen sudah baik. hasil Perpusmu sudah dilampirkan, silakan unduh.",
  },
  {
    id: "FB-004",
    document: "Skripsi Bab 3 - Metodologi",
    instructor: "Instruktur Ahmad",
    date: "22 Apr 2025",
    type: "Hasil" as const,
    similarity: 15,
    content: "Similarity 15%. Masih dalam batas wajar. Dokumen bisa dilanjutkan, namun perhatikan kutipan di halaman 8-12.",
  },
  {
    id: "FB-005",
    document: "Skripsi Bab 2 - Revisi Kedua",
    instructor: "Instruktur Ahmad",
    date: "25 Apr 2025",
    type: "Hasil" as const,
    similarity: 18,
    content: "Revisi kedua berhasil menurunkan similarity dari 35% ke 18%. Sudah memenuhi standar, silakan lanjutkan.",
  },
]

export default function StudentFeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredFeedback = mockFeedback.filter((fb) => {
    const matchesSearch = fb.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" ||
      (activeTab === "hasil" && fb.type === "Hasil") ||
      (activeTab === "revisi" && fb.type === "Revisi")
    return matchesSearch && matchesTab
  })

  const totalFeedback = mockFeedback.length
  const hasilCount = mockFeedback.filter(f => f.type === "Hasil").length
  const revisiCount = mockFeedback.filter(f => f.type === "Revisi").length
  const avgSimilarity = Math.round(
    mockFeedback.reduce((sum, f) => sum + f.similarity, 0) / mockFeedback.length
  )

  return (
    <DashboardMainCard
      title="Hasil & Umpan Balik"
      subtitle="Lihat hasil Perpusmu dan komentar dari instruktur pengawas 💬"
      icon={MessageSquare}
    >
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><AnimatedCounter value={totalFeedback} /></div>
              <p className="text-xs text-muted-foreground">Umpan balik diterima</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lolos Perpusmu</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600"><AnimatedCounter value={hasilCount} /></div>
              <p className="text-xs text-muted-foreground">Dokumen memenuhi standar</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Perlu Revisi</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600"><AnimatedCounter value={revisiCount} /></div>
              <p className="text-xs text-muted-foreground">Butuh perbaikan</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Similarity</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><AnimatedCounter value={avgSimilarity} />%</div>
              <p className="text-xs text-muted-foreground">Dari semua feedback</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Riwayat Umpan Balik</CardTitle>
          <CardDescription>hasil Perpusmu dan komentar dari instruktur pengawas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dokumen, instruktur, atau komentar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full">
              <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Semua ({totalFeedback})
              </TabsTrigger>
              <TabsTrigger value="hasil" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Lolos ({hasilCount})
              </TabsTrigger>
              <TabsTrigger value="revisi" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Revisi ({revisiCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredFeedback.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-muted-foreground">Tidak ada umpan balik yang ditemukan.</p>
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div key={item.id} className="rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-semibold">{item.document}</span>
                            <Badge
                              variant={item.type === "Hasil" ? "default" : "destructive"}
                              className={item.type === "Hasil" ? "bg-green-600" : ""}
                            >
                              {item.type === "Hasil" && <ThumbsUp className="mr-1 h-3 w-3" />}
                              {item.type === "Revisi" && <AlertCircle className="mr-1 h-3 w-3" />}
                              {item.type}
                            </Badge>
                            <Badge variant={
                              item.similarity < 15 ? "outline" : item.similarity < 30 ? "secondary" : "destructive"
                            }>
                              {item.similarity}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Dari {item.instructor} • {item.date}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl bg-muted/50 p-3">
                        <p className="text-sm leading-relaxed">{item.content}</p>
                      </div>
                      <div className="mt-3 flex gap-2 justify-end">
                        {item.type === "Hasil" && (
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Unduh Hasil
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Balas
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardMainCard>
  )
}
