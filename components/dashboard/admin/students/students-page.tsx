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
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { Users } from "lucide-react"

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
      <DashboardMainCard title="Manajemen Mahasiswa" subtitle="Kelola dan pantau akun mahasiswa, tahap ujian, dan pengiriman 🎓" icon={Users}>
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StudentStats />
        </StaggerContainer>

        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Database Mahasiswa</CardTitle>
            <CardDescription>Lihat dan kelola semua mahasiswa berdasarkan tahap ujian</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full w-full overflow-x-auto flex justify-start">
                <TabsTrigger
                  value="all"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Semua
                </TabsTrigger>
                <TabsTrigger
                  value="applicant"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Pendaftar
                </TabsTrigger>
                <TabsTrigger
                  value="proposal_exam"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Sidang Proposal
                </TabsTrigger>
                <TabsTrigger
                  value="results_exam"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Sidang Hasil
                </TabsTrigger>
                <TabsTrigger
                  value="final_exam"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Sidang Akhir
                </TabsTrigger>
                <TabsTrigger
                  value="graduated"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Lulus
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
      </DashboardMainCard>
    </PageTransition>
  )
}

