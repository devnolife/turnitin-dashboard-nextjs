"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ShieldCheck, Users, GraduationCap, FileText, ClipboardCheck, CreditCard, Settings, BookOpen, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AdminUsers } from "@/components/dashboard/admin/users"
import { AdminPayments } from "@/components/dashboard/admin/payments"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import api from "@/lib/api/client"

const AdminOverview = dynamic(() => import("@/components/dashboard/admin/overview").then(mod => ({ default: mod.AdminOverview })), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
})

interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalSubmissions: number
  totalRevenue: number
  pendingExamApprovals: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
  }, [])

  const pendingCount = stats?.pendingExamApprovals ?? 0

  return (
    <DashboardMainCard
      title="Dashboard Admin"
      subtitle="Kelola pengguna, pengajuan, dan pengaturan sistem ⚙️"
      icon={ShieldCheck}
    >
      {/* Banner notifikasi jika ada akun menunggu persetujuan */}
      {pendingCount > 0 && (
        <Card className="mb-6 border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/30">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-200">
                  {pendingCount} akun mahasiswa menunggu persetujuan
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Segera verifikasi agar mahasiswa dapat mengakses layanan Turnitin
                </p>
              </div>
            </div>
            <Button size="sm" asChild className="shrink-0 bg-orange-500 hover:bg-orange-600">
              <Link href="/dashboard/admin/exam-approvals">Tinjau Sekarang</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StaggerItem>
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats?.totalUsers ?? 0} />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalInstructors ?? 0} instruktur
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mahasiswa</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats?.totalStudents ?? 0} />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalUsers ? Math.round((stats.totalStudents / stats.totalUsers) * 100) : 0}% dari total pengguna
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pengajuan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats?.totalSubmissions ?? 0} />
              </div>
              <p className="text-xs text-muted-foreground">Dokumen yang dikirim</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats?.pendingExamApprovals ?? 0} />
              </div>
              <p className="text-xs text-muted-foreground">Akun perlu diverifikasi</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Aksi Cepat */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Menu pintasan untuk admin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4" asChild>
              <Link href="/dashboard/admin/students">
                <Users className="h-6 w-6 text-primary-dark" />
                <span>Kelola Mahasiswa</span>
              </Link>
            </Button>
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4" asChild>
              <Link href="/dashboard/admin/instructors">
                <GraduationCap className="h-6 w-6 text-primary-dark" />
                <span>Kelola Instruktur</span>
              </Link>
            </Button>
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4" asChild>
              <Link href="/dashboard/admin/exam-approvals">
                <ClipboardCheck className="h-6 w-6 text-primary-dark" />
                <span>Persetujuan Akun</span>
              </Link>
            </Button>
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4" asChild>
              <Link href="/dashboard/admin/settings">
                <Settings className="h-6 w-6 text-primary-dark" />
                <span>Pengaturan</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full">
          <TabsTrigger
            value="overview"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Ringkasan
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Pengguna
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Pembayaran
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <AdminOverview />
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <AdminUsers />
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <AdminPayments />
        </TabsContent>
      </Tabs>
    </DashboardMainCard>
  )
}

