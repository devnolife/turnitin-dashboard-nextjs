"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { BarChart3 } from "lucide-react"
import { PageTransition } from "@/components/ui/motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts"

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

export function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<string>("semester")
  const [data, setData] = useState<AnalyticsData | null>(null)

  const fetchAnalytics = useCallback(async (period: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/instructor/analytics?period=${period}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics(timeFilter)
  }, [timeFilter, fetchAnalytics])

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  const completionRate = data.totalSubmissions > 0
    ? Math.round((data.reviewedSubmissions / data.totalSubmissions) * 100)
    : 0

  return (
    <PageTransition>
    <DashboardMainCard title="Analitik" subtitle="Insights tentang pengiriman dan similarity score 📊" icon={BarChart3}>
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Bulan Ini</SelectItem>
            <SelectItem value="semester">Semester Ini</SelectItem>
            <SelectItem value="year">Tahun Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription>Total Pengiriman</CardDescription>
            <CardTitle className="text-3xl">{data.totalSubmissions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data.pendingSubmissions} menunggu tinjauan
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Similarity</CardDescription>
            <CardTitle className="text-3xl">{data.avgSimilarity}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Dari semua dokumen yang memiliki score
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription>Mahasiswa Aktif</CardDescription>
            <CardTitle className="text-3xl">{data.activeStudents}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Terdaftar dalam sistem</p>
          </CardContent>
        </Card>
        <Card className="hover-lift rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription>Selesai Ditinjau</CardDescription>
            <CardTitle className="text-3xl">{data.reviewedSubmissions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{completionRate}% tingkat penyelesaian</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Pengiriman per Bulan</CardTitle>
            <CardDescription>Jumlah pengiriman dan rata-rata similarity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              {data.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="submissions" fill="#0F2854" radius={[4, 4, 0, 0]} name="Pengiriman" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Belum ada data pengiriman untuk periode ini
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Distribusi Similarity Score</CardTitle>
            <CardDescription>Persentase dokumen berdasarkan similarity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              {data.distribution.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {data.distribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Belum ada data similarity score
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend line chart */}
      <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Trend Rata-rata Similarity</CardTitle>
          <CardDescription>Perubahan rata-rata similarity score per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            {data.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgSimilarity"
                    stroke="#4988C4"
                    strokeWidth={2}
                    dot={{ fill: "#0F2854", r: 4 }}
                    name="Rata-rata Similarity (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Belum ada data untuk periode ini
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardMainCard>
    </PageTransition>
  )
}

