"use client"

import { BookOpen, FileText, BarChart3, Clock, CheckCircle, Upload, Bell, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentOverview } from "@/components/dashboard/student/overview"
import { StudentSubmissions } from "@/components/dashboard/student/submissions"
import { StudentFeedback } from "@/components/dashboard/student/feedback"
import { ExamDetailsForm } from "@/components/dashboard/student/exam-details-form"
import { PendingApproval } from "@/components/dashboard/student/pending-approval"
import { useAuthStore } from "@/lib/store/auth-store"
import { PageTransition } from "@/components/ui/motion"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"

export default function StudentDashboardClientPage() {
  const { user } = useAuthStore()

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
              <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">📋 Cara Kerja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</div>
                    <div>
                      <p className="font-medium text-sm">Isi Detail Ujian</p>
                      <p className="text-xs text-muted-foreground">Masukkan judul skripsi dan jenis ujian</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</div>
                    <div>
                      <p className="font-medium text-sm">Verifikasi Admin</p>
                      <p className="text-xs text-muted-foreground">Admin akan memverifikasi detail ujian Anda</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</div>
                    <div>
                      <p className="font-medium text-sm">Upload Dokumen</p>
                      <p className="text-xs text-muted-foreground">Kirim dokumen untuk dicek plagiarisme</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">4</div>
                    <div>
                      <p className="font-medium text-sm">Terima Hasil</p>
                      <p className="text-xs text-muted-foreground">Instruktur akan mengirim hasil Perpusmu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
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
              <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
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

              <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
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

  // If student has submitted exam details and they're approved, show the dashboard
  return (
    <PageTransition>
      <DashboardMainCard
        title="Dashboard Mahasiswa"
        subtitle="Kelola pengiriman dokumen dan lihat hasil Perpusmu 📄"
        icon={BookOpen}
      >
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Pengiriman</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={12} />
                </div>
                <p className="text-xs text-muted-foreground">+2 dari bulan lalu</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Similarity</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={18} />%
                </div>
                <p className="text-xs text-muted-foreground">-3% dari bulan lalu</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Menunggu Hasil</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={3} />
                </div>
                <p className="text-xs text-muted-foreground">Pengiriman menunggu hasil</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Status Langganan</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Aktif</div>
                <p className="text-xs text-muted-foreground">Sampai 31 Juli 2025</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full">
            <TabsTrigger
              value="overview"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Ringkasan
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Pengiriman Terbaru
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Hasil Terbaru
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <StudentOverview />
          </TabsContent>
          <TabsContent value="submissions" className="space-y-4">
            <StudentSubmissions />
          </TabsContent>
          <TabsContent value="feedback" className="space-y-4">
            <StudentFeedback />
          </TabsContent>
        </Tabs>
      </DashboardMainCard>
    </PageTransition>
  )
}

