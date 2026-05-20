"use client"

import { useState, useEffect } from "react"
import { MessageSquare, ThumbsUp, AlertCircle, FileText, CheckCircle, Search, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { useAuthStore } from "@/lib/store/auth-store"
import api from "@/lib/api/client"

interface FeedbackData {
  id: string
  title: string
  date: string
  similarity: number
  status: string
  feedback: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  type: "Hasil" | "Revisi"
}

export default function StudentFeedbackPage() {
  const { user } = useAuthStore()
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchFeedback() {
      if (!user?.id) return
      try {
        setIsLoading(true)
        const res = await api.get("/submissions")
        const data = res.data
        // Only show reviewed submissions (those with feedback/similarity)
        const reviewed = (data.submissions || [])
          .filter((s: { rawStatus: string }) => s.rawStatus === "REVIEWED" || s.rawStatus === "FLAGGED")
          .map((s: { id: string; title: string; reviewedAt: string | null; date: string; similarity: number; feedback: string | null; reviewedBy: string | null; rawStatus: string }) => ({
            id: s.id,
            title: s.title,
            date: s.reviewedAt || s.date,
            similarity: s.similarity,
            feedback: s.feedback,
            reviewedBy: s.reviewedBy,
            reviewedAt: s.reviewedAt,
            status: s.rawStatus,
            type: s.rawStatus === "FLAGGED" ? "Revisi" as const : "Hasil" as const,
          }))
        setFeedbackList(reviewed)
      } catch {
        setError("Gagal memuat umpan balik. Silakan coba lagi.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeedback()
  }, [user?.id])

  const filteredFeedback = feedbackList.filter((fb) => {
    const matchesSearch = fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.feedback || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.reviewedBy || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" ||
      (activeTab === "hasil" && fb.type === "Hasil") ||
      (activeTab === "revisi" && fb.type === "Revisi")
    return matchesSearch && matchesTab
  })

  const totalFeedback = feedbackList.length
  const hasilCount = feedbackList.filter(f => f.type === "Hasil").length
  const revisiCount = feedbackList.filter(f => f.type === "Revisi").length
  const avgSimilarity = feedbackList.length > 0
    ? Math.round(feedbackList.reduce((sum, f) => sum + f.similarity, 0) / feedbackList.length)
    : 0

  if (isLoading) {
    return (
      <DashboardMainCard
        title="Hasil & Umpan Balik"
        subtitle="Lihat hasil Perpusmu dan komentar dari instruktur pengawas 💬"
        icon={MessageSquare}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Memuat umpan balik...</span>
        </div>
      </DashboardMainCard>
    )
  }

  if (error) {
    return (
      <DashboardMainCard
        title="Hasil & Umpan Balik"
        subtitle="Lihat hasil Perpusmu dan komentar dari instruktur pengawas 💬"
        icon={MessageSquare}
      >
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950 text-center">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      </DashboardMainCard>
    )
  }

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
          <CardDescription>Hasil Perpusmu dan komentar dari instruktur pengawas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dokumen atau komentar..."
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
                    <p className="text-muted-foreground">
                      {feedbackList.length === 0
                        ? "Belum ada umpan balik dari instruktur."
                        : "Tidak ada umpan balik yang ditemukan."}
                    </p>
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div key={item.id} className="rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-semibold">{item.title}</span>
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
                            {item.reviewedBy ? `Dari ${item.reviewedBy}` : "Instruktur"} • {item.date}
                          </p>
                        </div>
                      </div>
                      {item.feedback && (
                        <div className="mt-3 rounded-xl bg-muted/50 p-3">
                          <p className="text-sm leading-relaxed">{item.feedback}</p>
                        </div>
                      )}
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
