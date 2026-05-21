"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { DashboardStatsCards } from "./dashboard-stats-cards"
import { DashboardQuickActions } from "./dashboard-quick-actions"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import api from "@/lib/api/client"

interface AnalyticsData {
  totalSubmissions: number
  pendingSubmissions: number
  reviewedSubmissions: number
  flaggedSubmissions: number
  avgSimilarity: number
  activeStudents: number
  distribution: Array<{ name: string; value: number; color: string }>
  monthlyData: Array<{ month: string; submissions: number; avgSimilarity: number }>
}

const DashboardAnalytics = dynamic(
  () => import("./dashboard-analytics").then(mod => ({ default: mod.DashboardAnalytics })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
  },
)

export function InstructorDashboardClient() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        router.push("/auth/login")
        return
      }

      try {
        const res = await api.get("/instructor/analytics")
        setAnalytics(res.data)
      } catch {
        toast({
          variant: "destructive",
          title: "Kesalahan",
          description: "Gagal memuat data dashboard. Silakan coba lagi.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router, toast])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Instruktur Tidak Ditemukan</h2>
        <p className="text-muted-foreground">Profil instruktur Anda tidak dapat ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
          Kembali ke Dashboard
        </Button>
      </div>
    )
  }

  const stats = analytics ?? {
    totalSubmissions: 0,
    pendingSubmissions: 0,
    reviewedSubmissions: 0,
    flaggedSubmissions: 0,
    avgSimilarity: 0,
    activeStudents: 0,
    distribution: [],
    monthlyData: [],
  }

  return (
    <div>
      <DashboardMainCard
        title="Dashboard Instruktur"
        subtitle="Pantau pengiriman Perpusmu dan awasi mahasiswa Anda 📋"
        icon={Shield}
      >
        {/* Instructor Profile */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="md:col-span-1 border border-border shadow-sm rounded-3xl">
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="size-24">
                  <AvatarFallback className="bg-primary-dark text-white text-xl">
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4 text-center">{user.name}</CardTitle>
                <CardDescription className="text-center">{user.email || user.username}</CardDescription>
                <Badge variant="outline" className="mt-2">
                  Pengawas Perpusmu
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Mahasiswa</h3>
                  <p className="text-lg font-semibold">{stats.activeStudents} mahasiswa</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Pengiriman Pending</h3>
                  <p className="text-lg font-semibold">{stats.pendingSubmissions} dokumen</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant="success">Aktif</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full rounded-full" onClick={() => router.push("/dashboard/instructor/profile")}>
                Edit Profil
              </Button>
            </CardFooter>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <DashboardStatsCards
              studentCount={stats.activeStudents}
              submissionCount={stats.totalSubmissions}
              pendingReviewCount={stats.pendingSubmissions}
              reviewedCount={stats.reviewedSubmissions}
            />
            <DashboardQuickActions onNavigate={(path) => router.push(path)} />
          </div>
        </div>

        {/* Analytics */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full">
            <TabsTrigger
              value="analytics"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Analitik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <DashboardAnalytics
              submissionData={stats.monthlyData.map(d => ({ name: d.month, submissions: d.submissions }))}
              studentsByExamStage={[]}
              similarityDistribution={stats.distribution}
            />
          </TabsContent>
        </Tabs>
      </DashboardMainCard>
    </div>
  )
}

