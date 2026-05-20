"use client"

import {
  Mail,
  Phone,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import type { BadgeVariant } from "@/components/ui/badge"
import { type Student } from "@/lib/store/student-store"

interface StudentOverviewCardProps {
  student: Student
  formatExamStage?: (stage: string) => string
  getExamStageBadgeVariant?: (stage: string) => BadgeVariant
}

export function StudentOverviewCard({
  student,
  formatExamStage,
  getExamStageBadgeVariant,
}: StudentOverviewCardProps) {
  const examType = student.examDetail?.examType || ""

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-center">{student.name}</CardTitle>
          <CardDescription className="text-center">{student.nim}</CardDescription>
          {examType && (
            <Badge variant={getExamStageBadgeVariant ? getExamStageBadgeVariant(examType) : "outline"} className="mt-2">
              {formatExamStage ? formatExamStage(examType) : examType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{student.email || "-"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{student.hp || "-"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Prodi: {student.prodi}</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Statistik Pengajuan</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Pengajuan</span>
                  <span className="font-medium">{student.submissionsCount}</span>
                </div>
                <Progress
                  value={Math.min(student.submissionsCount * 20, 100)}
                  className="h-2 bg-primary-lighter/30"
                  indicatorColor="bg-gradient-to-r from-primary to-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Rata-rata Similarity</span>
                  <span className="font-medium">{student.avgSimilarity}%</span>
                </div>
                <Progress
                  value={student.avgSimilarity}
                  className="h-1.5 bg-primary-lighter/30"
                  indicatorColor="bg-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full border-t pt-4">
          <Badge variant={student.hasCompletedPayment ? "success" : "secondary"}>
            {student.hasCompletedPayment ? "Pembayaran Lunas" : "Belum Bayar"}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
}
