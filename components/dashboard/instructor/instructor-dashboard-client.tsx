"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, MessageSquare, CheckCircle, Bell, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition } from "@/components/ui/motion"
import { DashboardStatsCards } from "./dashboard-stats-cards"
import { DashboardQuickActions } from "./dashboard-quick-actions"
import { DashboardActivityFeed, type Activity } from "./dashboard-activity-feed"
import { DashboardSchedule, type ScheduleEvent } from "./dashboard-schedule"
import { DashboardAnalytics } from "./dashboard-analytics"

function generateMockActivities(): Activity[] {
  return [
    { id: 1, type: "submission", title: "New submission received", description: "Student John Doe submitted 'Research Proposal' for review", timestamp: "2 hours ago", icon: Upload },
    { id: 2, type: "feedback", title: "Feedback provided", description: "You provided feedback on Sarah Smith's 'Literature Review'", timestamp: "Yesterday", icon: MessageSquare },
    { id: 3, type: "grade", title: "Assignment graded", description: "You graded 'Methodology Chapter' for 5 students", timestamp: "2 days ago", icon: CheckCircle },
    { id: 4, type: "announcement", title: "Announcement posted", description: "You posted an announcement to 'Data Science 202' course", timestamp: "3 days ago", icon: Bell },
    { id: 5, type: "material", title: "Course material uploaded", description: "You uploaded new lecture notes to 'Computer Science 101'", timestamp: "5 days ago", icon: FileText },
  ]
}

function generateMockEvents(): ScheduleEvent[] {
  return [
    { id: 1, title: "Thesis Defense: Maria Johnson", description: "Final thesis defense for PhD candidate", date: "Tomorrow, 10:00 AM", location: "Room A-201", type: "defense" },
    { id: 2, title: "Department Meeting", description: "Monthly faculty meeting", date: "May 15, 2:00 PM", location: "Conference Room B", type: "meeting" },
    { id: 3, title: "Proposal Review Deadline", description: "Review research proposals for 8 students", date: "May 18", location: "Online", type: "deadline" },
    { id: 4, title: "Guest Lecture: AI Ethics", description: "Presenting to AI Ethics 301 class", date: "May 20, 1:00 PM", location: "Lecture Hall C", type: "lecture" },
  ]
}

function computeStudentsByExamStage(students: any[]) {
  const examStages = { proposal_exam: 0, results_exam: 0, final_exam: 0, graduated: 0 }
  students.forEach((student) => {
    if (student.examStage in examStages) {
      examStages[student.examStage as keyof typeof examStages]++
    }
  })
  return [
    { name: "Proposal", value: examStages.proposal_exam, color: "#1C4D8D" },
    { name: "Results", value: examStages.results_exam, color: "#0F2854" },
    { name: "Final", value: examStages.final_exam, color: "#4988C4" },
    { name: "Graduated", value: examStages.graduated, color: "#10b981" },
  ]
}

function computeSimilarityDistribution(results: any[]) {
  const distribution = { low: 0, medium: 0, high: 0, critical: 0 }
  results.forEach((result) => {
    if (result.similarityScore < 15) distribution.low++
    else if (result.similarityScore < 30) distribution.medium++
    else if (result.similarityScore < 50) distribution.high++
    else distribution.critical++
  })
  return [
    { name: "0-15%", value: distribution.low, color: "#10b981" },
    { name: "15-30%", value: distribution.medium, color: "#0ea5e9" },
    { name: "30-50%", value: distribution.high, color: "#f59e0b" },
    { name: "50%+", value: distribution.critical, color: "#ef4444" },
  ]
}

const SUBMISSION_DATA = [
  { name: "Week 1", submissions: 12 },
  { name: "Week 2", submissions: 19 },
  { name: "Week 3", submissions: 15 },
  { name: "Week 4", submissions: 22 },
  { name: "Week 5", submissions: 18 },
  { name: "Week 6", submissions: 25 },
]

export function InstructorDashboardClient() {
  const [instructor, setInstructor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduleEvent[]>([])

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { getInstructorById, getStudentsByInstructor, getTurnitinResultsByInstructor } = useInstructorStore()
  const { faculties } = useFacultyStore()

  useEffect(() => {
    const fetchInstructorData = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        if (!user?.id) {
          toast({
            variant: "destructive",
            title: "Authentication error",
            description: "Please log in to access the instructor dashboard.",
          })
          router.push("/auth/login")
          return
        }

        const instructorData = getInstructorById(user.id)
        if (!instructorData) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have instructor privileges.",
          })
          router.push("/dashboard")
          return
        }

        setInstructor(instructorData)
        setRecentActivities(generateMockActivities())
        setUpcomingEvents(generateMockEvents())
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load instructor data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstructorData()
  }, [user, getInstructorById, router, toast])

  const getFacultyName = (facultyId: string) => {
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown Faculty"
  }

  const getProgramNames = (programIds: string[]) => {
    return programIds.map((programId) => {
      for (const faculty of faculties) {
        const program = faculty.programs.find((p) => p.id === programId)
        if (program) return program.name
      }
      return "Unknown Program"
    })
  }

  const formatPosition = (position: string) => {
    return position
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Instructor Not Found</h2>
        <p className="text-muted-foreground">Your instructor profile could not be found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const students = getStudentsByInstructor(user?.id || "")
  const results = getTurnitinResultsByInstructor(user?.id || "")

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses, students, and teaching activities</p>
        </div>

        {/* Instructor Profile */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary-dark text-white text-xl">
                    {instructor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4 text-center">{instructor.name}</CardTitle>
                <CardDescription className="text-center">{instructor.email}</CardDescription>
                <Badge variant="outline" className="mt-2">
                  {formatPosition(instructor.position)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Faculty</h3>
                  <p>{getFacultyName(instructor.facultyId)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Programs</h3>
                  <ul className="list-inside list-disc">
                    {getProgramNames(instructor.programIds).map((program, index) => (
                      <li key={index}>{program}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Specialization</h3>
                  <p>{instructor.specialization}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Office Location</h3>
                  <p>{instructor.officeLocation}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Office Hours</h3>
                  <p>{instructor.officeHours}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push("/dashboard/instructor/profile")}>
                Edit Profile
              </Button>
            </CardFooter>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <DashboardStatsCards
              studentCount={students.length}
              courseCount={instructor.programIds.length}
              submissionCount={results.length}
              pendingReviewCount={results.filter((r) => r.status === "pending").length}
            />
            <DashboardQuickActions onNavigate={(path) => router.push(path)} />
          </div>
        </div>

        {/* Analytics and Activities */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <DashboardAnalytics
              submissionData={SUBMISSION_DATA}
              studentsByExamStage={computeStudentsByExamStage(students)}
              similarityDistribution={computeSimilarityDistribution(results)}
            />
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <DashboardActivityFeed activities={recentActivities} />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <DashboardSchedule events={upcomingEvents} />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}

