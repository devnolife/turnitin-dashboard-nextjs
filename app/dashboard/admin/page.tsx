"use client"

import dynamic from "next/dynamic"
import { ShieldCheck, Users, GraduationCap, FileText, DollarSign, UserPlus, CreditCard, Settings, BarChart, MessageSquare, Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AdminUsers } from "@/components/dashboard/admin/users"
import { AdminPayments } from "@/components/dashboard/admin/payments"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"

const AdminOverview = dynamic(() => import("@/components/dashboard/admin/overview").then(mod => ({ default: mod.AdminOverview })), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
})

export default function AdminDashboardPage() {
  return (
    <DashboardMainCard
      title="Admin Dashboard"
      subtitle="Manage users, submissions, and system settings ⚙️"
      icon={ShieldCheck}
    >
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StaggerItem>
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={2845} />
              </div>
              <p className="text-xs text-muted-foreground">+156 this month</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={2584} />
              </div>
              <p className="text-xs text-muted-foreground">90.8% of total users</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={18392} />
              </div>
              <p className="text-xs text-muted-foreground">+842 this month</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $<AnimatedCounter value={142384} />
              </div>
              <p className="text-xs text-muted-foreground">+$7,892 this month</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used admin actions and tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4">
              <UserPlus className="h-6 w-6 text-primary-dark" />
              <span>Add User</span>
            </Button>
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4">
              <Users className="h-6 w-6 text-primary-dark" />
              <span>Manage Students</span>
            </Button>
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4">
              <GraduationCap className="h-6 w-6 text-primary-dark" />
              <span>Manage Instructors</span>
            </Button>
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4">
              <CreditCard className="h-6 w-6 text-primary-dark" />
              <span>View Payments</span>
            </Button>
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4">
              <BarChart className="h-6 w-6 text-primary-dark" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="flex h-auto flex-col items-center justify-center gap-2 p-4">
              <Settings className="h-6 w-6 text-primary-dark" />
              <span>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full">
          <TabsTrigger
            value="overview"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Payments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <AdminOverview />
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <AdminUsers />
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <AdminPayments />
        </TabsContent>
      </Tabs>
    </DashboardMainCard>
  )
}

