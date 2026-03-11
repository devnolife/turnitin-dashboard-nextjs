"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Bell, Phone, BookOpen } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth-store"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"

interface StudentStats {
  total: number
  reviewed: number
  pending: number
  flagged: number
  avgSimilarity: number
  paymentStatus: string
}

interface StudentOverviewProps {
  stats: StudentStats | null
}

export function StudentOverview({ stats }: StudentOverviewProps) {
  const { user } = useAuthStore()

  const formatWhatsAppNumber = (number: string | undefined) => {
    if (!number) return "Tidak tersedia"
    if (number.startsWith("+62")) return number
    if (number.startsWith("62")) return `+${number}`
    if (number.startsWith("0")) return `+62${number.substring(1)}`
    return number
  }

  const formatExamType = (examType: string | null | undefined) => {
    if (!examType) return "Tidak tersedia"
    switch (examType) {
      case "proposal_defense": return "Sidang Proposal"
      case "results_defense": return "Sidang Hasil"
      case "final_defense": return "Sidang Akhir"
      default: return examType
    }
  }

  return (
    <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StaggerItem>
        <Card className="col-span-1 rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:shadow-md hover:shadow-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-primary-dark">Aksi Cepat</CardTitle>
            <CardDescription>Tugas yang sering dilakukan</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild variant="outline" className="w-full justify-start" withRipple>
              <Link href="/dashboard/student/submissions">
                <FileText className="mr-2 h-4 w-4" />
                Lihat Pengiriman
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" withRipple>
              <Link href="/dashboard/student/feedback">
                <Bell className="mr-2 h-4 w-4" />
                Cek Hasil Perpusmu
              </Link>
            </Button>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="col-span-1 rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader>
            <CardTitle className="gradient-text">Statistik Pengiriman</CardTitle>
            <CardDescription>Ringkasan dokumen Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Total Dokumen</span>
              <span className="font-medium">
                <AnimatedCounter value={stats?.total ?? 0} />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Sudah Direview</span>
              <span className="font-medium text-green-600">
                <AnimatedCounter value={stats?.reviewed ?? 0} />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Menunggu Hasil</span>
              <span className="font-medium text-yellow-600">
                <AnimatedCounter value={stats?.pending ?? 0} />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Perlu Revisi</span>
              <span className="font-medium text-red-600">
                <AnimatedCounter value={stats?.flagged ?? 0} />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Rata-rata Similarity</span>
              <span className="font-medium">
                <AnimatedCounter value={stats?.avgSimilarity ?? 0} />%
              </span>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 rounded-3xl border-2 border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
          <CardHeader>
            <CardTitle className="gradient-text">Informasi Akun</CardTitle>
            <CardDescription>Informasi pribadi Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "Tidak tersedia"}</p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium flex items-center">
                    <Phone className="mr-1 h-3 w-3 text-primary" />
                    {formatWhatsAppNumber(user?.whatsappNumber)}
                  </p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Judul Skripsi</p>
                  <p className="font-medium">{user?.examDetails?.thesisTitle || "Tidak tersedia"}</p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Ujian</p>
                  <p className="font-medium flex items-center">
                    <BookOpen className="mr-1 h-3 w-3 text-primary" />
                    {formatExamType(user?.examDetails?.examType)}
                  </p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status Pembayaran</p>
                  <p className={`font-medium ${stats?.paymentStatus === "COMPLETED" ? "text-green-600" : "text-yellow-600"}`}>
                    {stats?.paymentStatus === "COMPLETED" ? "Lunas ✓" : "Menunggu Pembayaran"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

