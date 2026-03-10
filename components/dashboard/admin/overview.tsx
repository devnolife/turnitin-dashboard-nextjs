"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, FileText, ClipboardCheck } from "lucide-react"

interface Stats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalSubmissions: number
  totalRevenue: number
  pendingExamApprovals: number
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const summaryItems = [
    {
      title: "Total Pengguna",
      value: stats?.totalUsers ?? 0,
      description: `${stats?.totalStudents ?? 0} mahasiswa, ${stats?.totalInstructors ?? 0} instruktur`,
      icon: Users,
    },
    {
      title: "Total Mahasiswa",
      value: stats?.totalStudents ?? 0,
      description: `${stats?.totalUsers ? Math.round(((stats?.totalStudents ?? 0) / stats.totalUsers) * 100) : 0}% dari total pengguna`,
      icon: GraduationCap,
    },
    {
      title: "Total Pengajuan",
      value: stats?.totalSubmissions ?? 0,
      description: "Dokumen yang telah dikirim",
      icon: FileText,
    },
    {
      title: "Menunggu Persetujuan",
      value: stats?.pendingExamApprovals ?? 0,
      description: "Ujian yang perlu diverifikasi",
      icon: ClipboardCheck,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {summaryItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

