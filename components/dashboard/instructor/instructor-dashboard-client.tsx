"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  BookOpen,
  FileText,
  BarChart,
  MessageSquare,
  Clock,
  CheckCircle,
  Info,
  ChevronRight,
  FileCheck,
  Upload,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function InstructorDashboardClient() {
  const [instructor, setInstructor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { getInstructorById, getStudentsByInstructor, getTurnitinResultsByInstructor } = useInstructorStore()
  const { faculties } = useFacultyStore()

  useEffect(() => {
    const fetchInstructorData = async () => {
      setIsLoading(true)

      try {
        // Simulate API delay
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

        // Generate mock recent activities
        setRecentActivities(generateMockActivities())

        // Generate mock upcoming events
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

  // Generate mock activities
  const generateMockActivities = () => {
    const activities = [
      {
        id: 1,
        type: "submission",
        title: "New submission received",
        description: "Student John Doe submitted 'Research Proposal' for review",
        timestamp: "2 hours ago",
        icon: Upload,
      },
      {
        id: 2,
        type: "feedback",
        title: "Feedback provided",
        description: "You provided feedback on Sarah Smith's 'Literature Review'",
        timestamp: "Yesterday",
        icon: MessageSquare,
      },
      {
        id: 3,
        type: "grade",
        title: "Assignment graded",
        description: "You graded 'Methodology Chapter' for 5 students",
        timestamp: "2 days ago",
        icon: CheckCircle,
      },
      {
        id: 4,
        type: "announcement",
        title: "Announcement posted",
        description: "You posted an announcement to 'Data Science 202' course",
        timestamp: "3 days ago",
        icon: Bell,
      },
      {
        id: 5,
        type: "material",
        title: "Course material uploaded",
        description: "You uploaded new lecture notes to 'Computer Science 101'",
        timestamp: "5 days ago",
        icon: FileText,
      },
    ]

    return activities
  }

  // Generate mock events
  const generateMockEvents = () => {
    const events = [
      {
        id: 1,
        title: "Thesis Defense: Maria Johnson",
        description: "Final thesis defense for PhD candidate",
        date: "Tomorrow, 10:00 AM",
        location: "Room A-201",
        type: "defense",
      },
      {
        id: 2,
        title: "Department Meeting",
        description: "Monthly faculty meeting",
        date: "May 15, 2:00 PM",
        location: "Conference Room B",
        type: "meeting",
      },
      {
        id: 3,
        title: "Proposal Review Deadline",
        description: "Review research proposals for 8 students",
        date: "May 18",
        location: "Online",
        type: "deadline",
      },
      {
        id: 4,
        title: "Guest Lecture: AI Ethics",
        description: "Presenting to AI Ethics 301 class",
        date: "May 20, 1:00 PM",
        location: "Lecture Hall C",
        type: "lecture",
      },
    ]

    return events
  }

  // Get faculty name
  const getFacultyName = (facultyId: string) => {
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown Faculty"
  }

  // Get program names
  const getProgramNames = (programIds: string[]) => {
    return programIds.map((programId) => {
      for (const faculty of faculties) {
        const program = faculty.programs.find((p) => p.id === programId)
        if (program) {
          return program.name
        }
      }
      return "Unknown Program"
    })
  }

  // Format position
  const formatPosition = (position: string) => {
    return position
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get students by exam stage
  const getStudentsByExamStage = () => {
    if (!user?.id) return []

    const students = getStudentsByInstructor(user.id)

    const examStages = {
      proposal_exam: 0,
      results_exam: 0,
      final_exam: 0,
      graduated: 0,
    }

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

  // Get similarity distribution
  const getSimilarityDistribution = () => {
    if (!user?.id) return []

    const results = getTurnitinResultsByInstructor(user.id)

    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }

    results.forEach((result) => {
      if (result.similarityScore < 15) {
        distribution.low++
      } else if (result.similarityScore < 30) {
        distribution.medium++
      } else if (result.similarityScore < 50) {
        distribution.high++
      } else {
        distribution.critical++
      }
    })

    return [
      { name: "0-15%", value: distribution.low, color: "#10b981" },
      { name: "15-30%", value: distribution.medium, color: "#0ea5e9" },
      { name: "30-50%", value: distribution.high, color: "#f59e0b" },
      { name: "50%+", value: distribution.critical, color: "#ef4444" },
    ]
  }

  // Get submission data
  const getSubmissionData = () => {
    return [
      { name: "Week 1", submissions: 12 },
      { name: "Week 2", submissions: 19 },
      { name: "Week 3", submissions: 15 },
      { name: "Week 4", submissions: 22 },
      { name: "Week 5", submissions: 18 },
      { name: "Week 6", submissions: 25 },
    ]
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Not found state
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
            {/* Key Metrics */}
            <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StaggerItem>
                <Card className="hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter value={getStudentsByInstructor(user?.id || "").length} />
                    </div>
                    <p className="text-xs text-muted-foreground">Under your supervision</p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter value={instructor.programIds.length} />
                    </div>
                    <p className="text-xs text-muted-foreground">Active courses</p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter value={getTurnitinResultsByInstructor(user?.id || "").length} />
                    </div>
                    <p className="text-xs text-muted-foreground">Total submissions</p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter
                        value={
                          getTurnitinResultsByInstructor(user?.id || "").filter((result) => result.status === "pending")
                            .length
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Awaiting your review</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used actions and tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button
                    variant="outline"
                    className="flex h-auto flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/dashboard/instructor/students")}
                  >
                    <Users className="h-6 w-6 text-primary-dark" />
                    <span>Manage Students</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-auto flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/dashboard/instructor/courses")}
                  >
                    <BookOpen className="h-6 w-6 text-primary-dark" />
                    <span>Manage Courses</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-auto flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/dashboard/instructor/submissions")}
                  >
                    <FileCheck className="h-6 w-6 text-primary-dark" />
                    <span>Review Submissions</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-auto flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/dashboard/instructor/grades")}
                  >
                    <CheckCircle className="h-6 w-6 text-primary-dark" />
                    <span>Grade Assignments</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-auto flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/dashboard/instructor/analytics")}
                  >
                    <BarChart className="h-6 w-6 text-primary-dark" />
                    <span>View Analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-auto flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/dashboard/instructor/messages")}
                  >
                    <MessageSquare className="h-6 w-6 text-primary-dark" />
                    <span>Send Messages</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Submissions Over Time</CardTitle>
                  <CardDescription>Weekly submission trends</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ChartContainer
                    config={{
                      submissions: {
                        label: "Submissions",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={getSubmissionData()}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="submissions" fill="var(--color-submissions)" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Student Distribution</CardTitle>
                  <CardDescription>Students by exam stage</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getStudentsByExamStage()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getStudentsByExamStage().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Similarity Distribution</CardTitle>
                  <CardDescription>Turnitin similarity scores</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getSimilarityDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getSimilarityDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} submissions`, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Student Performance</CardTitle>
                  <CardDescription>Overall performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Average Similarity Score</span>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: "18%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Submission Rate</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary-dark" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Feedback Response Rate</span>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: "72%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">On-time Submission Rate</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-amber-500" style={{ width: "68%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your recent actions and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentActivities.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="flex">
                        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-5 w-5 text-primary-dark" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                        <div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Activities
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your schedule and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        {event.type === "defense" && <FileCheck className="h-6 w-6 text-primary-dark" />}
                        {event.type === "meeting" && <Users className="h-6 w-6 text-primary" />}
                        {event.type === "deadline" && <Clock className="h-6 w-6 text-amber-500" />}
                        {event.type === "lecture" && <BookOpen className="h-6 w-6 text-green-500" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge
                            variant={
                              event.type === "defense"
                                ? "default"
                                : event.type === "meeting"
                                  ? "secondary"
                                  : event.type === "deadline"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {event.date}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Info className="mr-1 h-3 w-3" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Calendar
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}

