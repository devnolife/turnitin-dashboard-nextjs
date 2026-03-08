"use client"

import { useEffect, useState } from "react"
import { useStudentStore, type ExamStage } from "@/lib/store/student-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentFilters } from "./student-filters"
import { StudentTable } from "./student-table"
import { StudentStats } from "./student-stats"
import { PageTransition, StaggerContainer } from "@/components/ui/motion"

export function AdminStudentsPage() {
  const [activeTab, setActiveTab] = useState<ExamStage | "all">("all")

  const { fetchStudents, setExamStageFilter, filteredStudents, isLoading } = useStudentStore()

  const { fetchFaculties } = useFacultyStore()

  useEffect(() => {
    fetchStudents()
    fetchFaculties()
  }, [fetchStudents, fetchFaculties])

  const handleTabChange = (value: string) => {
    setActiveTab(value as ExamStage | "all")
    setExamStageFilter(value as ExamStage | "all")
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Student Management</h1>
          <p className="text-muted-foreground">Manage and monitor student accounts, exam stages, and submissions</p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StudentStats />
        </StaggerContainer>

        <Card>
          <CardHeader>
            <CardTitle>Student Database</CardTitle>
            <CardDescription>View and manage all students across different exam stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="bg-background/50 backdrop-blur-sm w-full overflow-x-auto flex justify-start">
                <TabsTrigger
                  value="all"
                  className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  All Students
                </TabsTrigger>
                <TabsTrigger
                  value="applicant"
                  className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Applicants
                </TabsTrigger>
                <TabsTrigger
                  value="proposal_exam"
                  className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Proposal Exam
                </TabsTrigger>
                <TabsTrigger
                  value="results_exam"
                  className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Results Exam
                </TabsTrigger>
                <TabsTrigger
                  value="final_exam"
                  className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Final Exam
                </TabsTrigger>
                <TabsTrigger
                  value="graduated"
                  className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Graduated
                </TabsTrigger>
              </TabsList>

              <StudentFilters />

              <TabsContent value="all" className="space-y-4">
                <StudentTable students={filteredStudents} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="applicant" className="space-y-4">
                <StudentTable students={filteredStudents} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="proposal_exam" className="space-y-4">
                <StudentTable students={filteredStudents} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="results_exam" className="space-y-4">
                <StudentTable students={filteredStudents} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="final_exam" className="space-y-4">
                <StudentTable students={filteredStudents} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="graduated" className="space-y-4">
                <StudentTable students={filteredStudents} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}

