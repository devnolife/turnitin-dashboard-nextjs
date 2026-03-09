"use client"

import { Users, CheckCircle, FileText, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"

interface DashboardStatsCardsProps {
  studentCount: number
  submissionCount: number
  pendingReviewCount: number
  reviewedCount: number
}

export function DashboardStatsCards({
  studentCount,
  submissionCount,
  pendingReviewCount,
  reviewedCount,
}: DashboardStatsCardsProps) {
  return (
    <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mahasiswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={studentCount} />
            </div>
            <p className="text-xs text-muted-foreground">Di bawah pengawasan Anda</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pengiriman</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={submissionCount} />
            </div>
            <p className="text-xs text-muted-foreground">Total dokumen diterima</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Upload</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={pendingReviewCount} />
            </div>
            <p className="text-xs text-muted-foreground">Perlu di-upload ke Turnitin</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Selesai Ditinjau</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={reviewedCount} />
            </div>
            <p className="text-xs text-muted-foreground">Hasil sudah dikirim</p>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}
