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
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={totalInstructors} />
            </div>
            <p className="text-xs text-muted-foreground">
              {activeInstructors} active ({Math.round((activeInstructors / totalInstructors) * 100)}%)
            </p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faculties Covered</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={facultiesCount} />
            </div>
            <p className="text-xs text-muted-foreground">Academic faculties</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Professors</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={professorsCount} />
            </div>
            <p className="text-xs text-muted-foreground">Full professors</p>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={onLeaveInstructors} />
            </div>
            <p className="text-xs text-muted-foreground">Currently on leave</p>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}
