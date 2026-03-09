"use client"

import { BookOpen, FileText, BarChart3, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentOverview } from "@/components/dashboard/student/overview"
import { StudentSubmissions } from "@/components/dashboard/student/submissions"
import { StudentFeedback } from "@/components/dashboard/student/feedback"
import { ExamDetailsForm } from "@/components/dashboard/student/exam-details-form"
import { PendingApproval } from "@/components/dashboard/student/pending-approval"
import { useAuthStore } from "@/lib/store/auth-store"
import { PageTransition } from "@/components/ui/motion"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"

export default function StudentDashboardClientPage() {
  const { user } = useAuthStore()

  // Check if student has submitted exam details
  const hasSubmittedExamDetails = !!user?.examDetails

  // Check if exam details have been approved
  const isExamDetailsApproved = user?.examDetails?.approvalStatus === "approved"

  // If student hasn't submitted exam details, show the form
  if (!hasSubmittedExamDetails) {
    return (
      <div className="container mx-auto max-w-md py-10">
        <ExamDetailsForm />
      </div>
    )
  }

  // If student has submitted exam details but they're not approved yet, show pending approval
  if (hasSubmittedExamDetails && !isExamDetailsApproved) {
    return (
      <div className="container mx-auto max-w-2xl py-10">
        <PendingApproval />
      </div>
    )
  }

  // If student has submitted exam details and they're approved, show the dashboard
  return (
    <PageTransition>
      <DashboardMainCard
        title="Student Dashboard"
        subtitle="Manage your submissions and view feedback 📄"
        icon={BookOpen}
      >
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={12} />
                </div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Similarity</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={18} />%
                </div>
                <p className="text-xs text-muted-foreground">-3% from last month</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={3} />
                </div>
                <p className="text-xs text-muted-foreground">Submissions awaiting feedback</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">Until July 31, 2025</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full">
            <TabsTrigger
              value="overview"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Recent Submissions
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Recent Feedback
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <StudentOverview />
          </TabsContent>
          <TabsContent value="submissions" className="space-y-4">
            <StudentSubmissions />
          </TabsContent>
          <TabsContent value="feedback" className="space-y-4">
            <StudentFeedback />
          </TabsContent>
        </Tabs>
      </DashboardMainCard>
    </PageTransition>
  )
}

