"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStudentStore } from "@/lib/store/student-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { UserPlus, GraduationCap, FileCheck, Award } from "lucide-react"

export function StudentStats() {
  const { students } = useStudentStore()
  const { faculties, programs } = useFacultyStore()

  const totalSubmissions = students.reduce((acc, s) => acc + s.submissionsCount, 0)
  const totalFaculties = faculties.length
  const totalPrograms = programs.length
  const paidStudents = students.filter((s) => s.hasCompletedPayment).length

  return (
    <>
      <StaggerItem>
        <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
            <UserPlus className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={students.length} />
            </div>
            <p className="text-xs text-muted-foreground">
              {paidStudents} sudah bayar ({students.length > 0 ? Math.round((paidStudents / students.length) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pengajuan</CardTitle>
            <FileCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={totalSubmissions} />
            </div>
            <p className="text-xs text-muted-foreground">Dokumen diajukan</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fakultas & Program</CardTitle>
            <GraduationCap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={totalFaculties} /> / <AnimatedCounter value={totalPrograms} />
            </div>
            <p className="text-xs text-muted-foreground">Fakultas / Program Studi</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Similarity</CardTitle>
            <Award className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0
                ? Math.round(students.reduce((a, s) => a + s.avgSimilarity, 0) / students.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Seluruh mahasiswa</p>
          </CardContent>
        </Card>
      </StaggerItem>
    </>
  )
}

