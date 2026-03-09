"use client"

import { Users, FileCheck, Eye, BarChart, MessageSquare, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardQuickActionsProps {
  onNavigate: (path: string) => void
}

export function DashboardQuickActions({ onNavigate }: DashboardQuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
        <CardDescription>Aksi yang sering digunakan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/students")}
          >
            <Users className="h-6 w-6 text-primary-dark" />
            <span>Daftar Mahasiswa</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/submissions")}
          >
            <Eye className="h-6 w-6 text-primary-dark" />
            <span>Pantau Pengiriman</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/submissions")}
          >
            <FileCheck className="h-6 w-6 text-primary-dark" />
            <span>Tinjau Laporan</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/submissions")}
          >
            <ClipboardList className="h-6 w-6 text-primary-dark" />
            <span>Cek Similarity</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/analytics")}
          >
            <BarChart className="h-6 w-6 text-primary-dark" />
            <span>Lihat Analitik</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-4"
            onClick={() => onNavigate("/dashboard/instructor/messages")}
          >
            <MessageSquare className="h-6 w-6 text-primary-dark" />
            <span>Kirim Pesan</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
