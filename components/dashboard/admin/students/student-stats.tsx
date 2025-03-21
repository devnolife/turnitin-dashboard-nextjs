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
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={students.length} />
            </div>
            <p className="text-xs text-muted-foreground">
              {activeStudents} active ({Math.round((activeStudents / students.length) * 100)}%)
            </p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exam Stages</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter
                value={countByStage("proposal_exam") + countByStage("results_exam") + countByStage("final_exam")}
              />
            </div>
            <p className="text-xs text-muted-foreground">Students in exam process</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faculties & Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={totalFaculties} /> / <AnimatedCounter value={totalPrograms} />
            </div>
            <p className="text-xs text-muted-foreground">Faculties / Study Programs</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Graduated Students</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={countByStage("graduated")} />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((countByStage("graduated") / students.length) * 100)}% of total students
            </p>
          </CardContent>
        </Card>
      </StaggerItem>
    </>
  )
}

