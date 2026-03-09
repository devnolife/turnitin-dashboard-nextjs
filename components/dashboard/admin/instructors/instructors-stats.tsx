"use client"

import { Users, Building, Award, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"

interface InstructorsStatsProps {
  totalInstructors: number
  activeInstructors: number
  facultiesCount: number
  professorsCount: number
  onLeaveInstructors: number
}

export function InstructorsStats({
  totalInstructors,
  activeInstructors,
  facultiesCount,
  professorsCount,
  onLeaveInstructors,
}: InstructorsStatsProps) {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StaggerItem>
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Instruktur</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={totalInstructors} />
            </div>
            <p className="text-xs text-muted-foreground">
              {activeInstructors} aktif ({Math.round((activeInstructors / totalInstructors) * 100)}%)
            </p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fakultas Terkait</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={facultiesCount} />
            </div>
            <p className="text-xs text-muted-foreground">Fakultas akademik</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Senior</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={professorsCount} />
            </div>
            <p className="text-xs text-muted-foreground">Instruktur senior</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cuti</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={onLeaveInstructors} />
            </div>
            <p className="text-xs text-muted-foreground">Sedang cuti</p>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}
