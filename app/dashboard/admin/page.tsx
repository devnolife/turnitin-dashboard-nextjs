"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ShieldCheck, Users, GraduationCap, FileText, ClipboardCheck, CreditCard, Settings, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AdminUsers } from "@/components/dashboard/admin/users"
import { AdminPayments } from "@/components/dashboard/admin/payments"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"

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
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats(null))
  }, [])

  return (
    <DashboardMainCard
      title="Dashboard Admin"
      subtitle="Kelola pengguna, pengajuan, dan pengaturan sistem ⚙️"
      icon={ShieldCheck}
    >
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <p className="text-xs text-muted-foreground">Ujian perlu diverifikasi</p>
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
                <span>Persetujuan Ujian</span>
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

