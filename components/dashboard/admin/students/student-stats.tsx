"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStudentStore, type ExamStage } from "@/lib/store/student-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { UserPlus, GraduationCap, FileCheck, Award } from "lucide-react"

export function StudentStats() {
  const { students } = useStudentStore()
  const { faculties } = useFacultyStore()

  // Count students by exam stage
  const countByStage = (stage: ExamStage) => {
    return students.filter((student) => student.examStage === stage).length
  }

  // Count active students
  const activeStudents = students.filter((student) => student.status === "active").length

  // Get total faculties and programs
  const totalFaculties = faculties.length
  const totalPrograms = faculties.reduce((acc, faculty) => acc + faculty.programs.length, 0)

  return (
    <>
      <StaggerItem>
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={students.length} />
            </div>
            <p className="text-xs text-muted-foreground">
              {activeStudents} aktif ({Math.round((activeStudents / students.length) * 100)}%)
            </p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tahap Ujian</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter
                value={countByStage("proposal_exam") + countByStage("results_exam") + countByStage("final_exam")}
              />
            </div>
            <p className="text-xs text-muted-foreground">Mahasiswa dalam proses ujian</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fakultas & Program</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mahasiswa Lulus</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={countByStage("graduated")} />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((countByStage("graduated") / students.length) * 100)}% dari total mahasiswa
            </p>
          </CardContent>
        </Card>
      </StaggerItem>
    </>
  )
}

