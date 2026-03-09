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
import { type Student, type ExamStage } from "@/lib/store/student-store"

interface StudentOverviewCardProps {
  student: Student
  formatExamStage: (stage: ExamStage) => string
  getExamStageBadgeVariant: (stage: ExamStage) => string
}

export function StudentOverviewCard({
  student,
  formatExamStage,
  getExamStageBadgeVariant,
}: StudentOverviewCardProps) {
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
          <CardDescription className="text-center">{student.studentId}</CardDescription>
          <Badge variant={getExamStageBadgeVariant(student.examStage)} className="mt-2">
            {formatExamStage(student.examStage)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{student.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{student.whatsappNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Terakhir aktif: {student.lastActive}</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Progres Pengiriman</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progres Keseluruhan</span>
                  <span className="font-medium">
                    {student.examStage === "applicant"
                      ? "0%"
                      : student.examStage === "proposal_exam"
                        ? "25%"
                        : student.examStage === "results_exam"
                          ? "50%"
                          : student.examStage === "final_exam"
                            ? "75%"
                            : "100%"}
                  </span>
                </div>
                <Progress
                  value={
                    student.examStage === "applicant"
                      ? 0
                      : student.examStage === "proposal_exam"
                        ? 25
                        : student.examStage === "results_exam"
                          ? 50
                          : student.examStage === "final_exam"
                            ? 75
                            : 100
                  }
                  className="h-2 bg-primary-lighter/30"
                  indicatorColor="bg-gradient-to-r from-primary to-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Proposal</span>
                  <span className="font-medium">
                    {student.examStage === "applicant" ? "Belum" : "Selesai"}
                  </span>
                </div>
                <Progress
                  value={student.examStage === "applicant" ? 0 : 100}
                  className="h-1.5 bg-primary-lighter/30"
                  indicatorColor="bg-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Hasil</span>
                  <span className="font-medium">
                    {student.examStage === "applicant" || student.examStage === "proposal_exam"
                      ? "Belum"
                      : "Selesai"}
                  </span>
                </div>
                <Progress
                  value={student.examStage === "applicant" || student.examStage === "proposal_exam" ? 0 : 100}
                  className="h-1.5 bg-primary-lighter/30"
                  indicatorColor="bg-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Akhir</span>
                  <span className="font-medium">
                    {student.examStage === "final_exam" || student.examStage === "graduated"
                      ? "Selesai"
                      : "Belum"}
                  </span>
                </div>
                <Progress
                  value={student.examStage === "final_exam" || student.examStage === "graduated" ? 100 : 0}
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
          <Badge
            variant={
              student.status === "active"
                ? "success"
                : student.status === "inactive"
                  ? "secondary"
                  : "destructive"
            }
          >
            {student.status === "active" ? "Aktif" : student.status === "inactive" ? "Tidak Aktif" : "Ditangguhkan"}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
}
