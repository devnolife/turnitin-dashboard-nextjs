"use client"

import { useEffect, useState } from "react"
import { BookOpen, FileText, BarChart3, Clock, CheckCircle, Bell, Shield, FileCheck, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StudentOverview } from "@/components/dashboard/student/overview"
import { StudentFeedback } from "@/components/dashboard/student/feedback"
import { ExamDetailsForm } from "@/components/dashboard/student/exam-details-form"
import { PendingApproval } from "@/components/dashboard/student/pending-approval"
import { useAuthStore } from "@/lib/store/auth-store"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StatCard } from "@/components/dashboard/stat-card"

interface SimilarityRuleData {
  label: string
  maxPercentage: number
  ruleType: string
}

interface MyRulesResponse {
  programName: string | null
  ruleType: string | null
  rules: SimilarityRuleData[]
}

interface StudentStats {
  total: number
  reviewed: number
  pending: number
  flagged: number
  avgSimilarity: number
  paymentStatus: string
}

export default function StudentDashboardClientPage() {
  const { user } = useAuthStore()
  const [myRules, setMyRules] = useState<MyRulesResponse | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [rulesRes, statsRes] = await Promise.all([
          fetch("/api/similarity-rules/my-rules"),
          fetch("/api/student/stats"),
        ])
        if (rulesRes.ok) {
          const data = await rulesRes.json()
          setMyRules(data)
        }
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }
      } catch {
        // Silently fail
      }
    }
    fetchData()
  }, [])

  // Check if student has submitted exam details
  const hasSubmittedExamDetails = !!user?.examDetails

  // Check if exam details have been approved
  const isExamDetailsApproved = user?.examDetails?.approvalStatus === "approved"

  // If student hasn't submitted exam details, show the form in full layout
  if (!hasSubmittedExamDetails) {
    return (
      <PageTransition>
        <DashboardMainCard
          title="Selamat Datang di Perpusmu"
          subtitle="Lengkapi detail ujian Anda untuk mulai menggunakan layanan plagiarisme 🎓"
          icon={BookOpen}
        >
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ExamDetailsForm />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">📋 Cara Kerja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</div>
                    <div>
                      <p className="font-medium text-sm">Isi Detail Ujian</p>
                      <p className="text-xs text-muted-foreground">Masukkan judul skripsi dan jenis ujian</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</div>
                    <div>
                      <p className="font-medium text-sm">Verifikasi Admin</p>
                      <p className="text-xs text-muted-foreground">Admin akan memverifikasi detail ujian Anda</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</div>
                    <div>
                      <p className="font-medium text-sm">Upload Dokumen</p>
                      <p className="text-xs text-muted-foreground">Kirim dokumen untuk dicek plagiarisme</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">4</div>
                    <div>
                      <p className="font-medium text-sm">Terima Hasil</p>
                      <p className="text-xs text-muted-foreground">Instruktur akan mengirim hasil Perpusmu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">💡 Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    • Pastikan judul skripsi sesuai dengan dokumen resmi yang disetujui pembimbing.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Pilih jenis ujian yang tepat agar instruktur bisa memproses dokumen dengan benar.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Setelah diverifikasi, Anda bisa langsung mengunggah dokumen untuk dicek.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardMainCard>
      </PageTransition>
    )
  }

  // If student has submitted exam details but they're not approved yet, show pending approval in full layout
  if (hasSubmittedExamDetails && !isExamDetailsApproved) {
    return (
      <PageTransition>
        <DashboardMainCard
          title="Menunggu Verifikasi"
          subtitle="Detail ujian Anda sedang ditinjau oleh administrator ⏳"
          icon={Clock}
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PendingApproval />
            </div>
            <div className="space-y-6">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">📊 Status Anda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Akun</span>
                    <span className="text-sm font-medium text-green-600">Aktif ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pembayaran</span>
                    <span className="text-sm font-medium text-green-600">Lunas ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Detail Ujian</span>
                    <span className="text-sm font-medium text-yellow-600">Menunggu ⏳</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dashboard</span>
                    <span className="text-sm font-medium text-gray-400">Terkunci 🔒</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">📞 Butuh Bantuan?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Jika proses verifikasi membutuhkan waktu lebih dari 2 hari kerja, silakan hubungi:
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">📧 admin@perpusmu.ac.id</p>
                    <p className="text-sm font-medium">📱 +62812-3456-7890</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardMainCard>
      </PageTransition>
    )
  }

  const totalSubmissions = stats?.total ?? 0
  const avgSimilarity = stats?.avgSimilarity ?? 0
  const pendingCount = stats?.pending ?? 0
  const paymentActive = stats?.paymentStatus === "COMPLETED"

  // If student has submitted exam details and they're approved, show the dashboard
  return (
    <PageTransition>
      <DashboardMainCard
        title="Dashboard Mahasiswa"
        subtitle="Kelola pengiriman dokumen dan lihat hasil Perpusmu 📄"
        icon={BookOpen}
      >
        <StaggerContainer className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatCard
              title="Total Pengiriman"
              icon={FileText}
              countTo={totalSubmissions}
              caption="Dokumen terkirim"
              tone="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Rata-rata Similarity"
              icon={BarChart3}
              countTo={avgSimilarity}
              suffix="%"
              caption="Dari semua pengiriman"
              tone="violet"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Menunggu Hasil"
              icon={Clock}
              countTo={pendingCount}
              caption="Pengiriman menunggu hasil"
              tone="amber"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Status Pembayaran"
              icon={CheckCircle}
              tone={paymentActive ? "emerald" : "amber"}
              value={
                <span className={paymentActive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                  {paymentActive ? "Lunas" : "Belum"}
                </span>
              }
              caption={paymentActive ? "Pembayaran sudah lunas" : "Menunggu pembayaran"}
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Similarity Rules Card */}
        {myRules && myRules.rules.length > 0 && (
          <Card className="mb-8 border-primary/20 bg-primary/[0.04] dark:border-primary/20 dark:bg-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCheck className="size-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-blue-700 dark:text-blue-400">
                  Batas Similarity Prodi Anda
                </CardTitle>
              </div>
              <CardDescription>
                {myRules.programName} &bull; Tipe: {myRules.ruleType === "PER_CHAPTER" ? "Per Bab" : "Per Jenis Ujian"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {myRules.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl bg-background border px-4 py-3"
                  >
                    <span className="text-sm font-medium">{rule.label}</span>
                    <Badge
                      variant="outline"
                      className={
                        rule.maxPercentage <= 10
                          ? "border-green-500 text-green-600"
                          : rule.maxPercentage <= 20
                          ? "border-yellow-500 text-yellow-600"
                          : rule.maxPercentage <= 30
                          ? "border-orange-500 text-orange-600"
                          : "border-red-500 text-red-600"
                      }
                    >
                      Maks. {rule.maxPercentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="rounded-full bg-muted p-1.5">
            <TabsTrigger
              value="overview"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Ringkasan
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Hasil Terbaru
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <StudentOverview stats={stats} />
          </TabsContent>
          <TabsContent value="feedback" className="space-y-4">
            <StudentFeedback />
          </TabsContent>
        </Tabs>
      </DashboardMainCard>
    </PageTransition>
  )
}

