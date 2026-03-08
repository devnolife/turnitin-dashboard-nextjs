"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useSubmissionStore } from "@/lib/store/submission-store"
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

const SIMILARITY_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"]

const similarityData = [
  { name: "0-24%", value: 45, color: "#22c55e" },
  { name: "25-49%", value: 28, color: "#eab308" },
  { name: "50-74%", value: 15, color: "#f97316" },
  { name: "75-100%", value: 12, color: "#ef4444" },
]

const monthlyData = [
  { month: "Jan", submissions: 12, avgSimilarity: 22 },
  { month: "Feb", submissions: 19, avgSimilarity: 28 },
  { month: "Mar", submissions: 15, avgSimilarity: 25 },
  { month: "Apr", submissions: 22, avgSimilarity: 30 },
  { month: "May", submissions: 28, avgSimilarity: 18 },
  { month: "Jun", submissions: 24, avgSimilarity: 21 },
]

const coursePerformance = [
  { course: "Skripsi A", submissions: 35, avgScore: 22 },
  { course: "Skripsi B", submissions: 28, avgScore: 31 },
  { course: "Thesis C", submissions: 20, avgScore: 18 },
  { course: "Research D", submissions: 15, avgScore: 26 },
]

export function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<string>("semester")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Insights tentang submissions dan similarity score
          </p>
        </div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-3xl">120</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+12% dari periode lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Similarity</CardDescription>
            <CardTitle className="text-3xl">24%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">-3% dari periode lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mahasiswa Aktif</CardDescription>
            <CardTitle className="text-3xl">68</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+5 baru bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Graded</CardDescription>
            <CardTitle className="text-3xl">98</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">82% completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submissions per Bulan</CardTitle>
            <CardDescription>Jumlah submission dan rata-rata similarity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="submissions" fill="#0F2854" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Similarity Score</CardTitle>
            <CardDescription>Persentase dokumen berdasarkan similarity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={similarityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {similarityData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend line chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Rata-rata Similarity</CardTitle>
          <CardDescription>Perubahan rata-rata similarity score per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Course performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performa per Kelas</CardTitle>
          <CardDescription>Jumlah submissions dan rata-rata score per kelas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="course" type="category" className="text-xs" width={80} />
                <Tooltip />
                <Bar dataKey="submissions" fill="#0F2854" radius={[0, 4, 4, 0]} />
                <Bar dataKey="avgScore" fill="#4988C4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

