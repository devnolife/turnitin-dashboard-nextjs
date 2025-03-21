"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Bell, Phone, BookOpen } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth-store"
import { StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { motion } from "framer-motion"

export function StudentOverview() {
  const { user } = useAuthStore()

  // Format WhatsApp number for display
  const formatWhatsAppNumber = (number: string | undefined) => {
    if (!number) return "Tidak tersedia"

    // If number starts with +62, format it
    if (number.startsWith("+62")) {
      return number
    }

    // If number starts with 62, add +
    if (number.startsWith("62")) {
      return `+${number}`
    }

    // If number starts with 0, replace with +62
    if (number.startsWith("0")) {
      return `+62${number.substring(1)}`
    }

    return number
  }

  // Format the exam type for display
  const formatExamType = (examType: string | null | undefined) => {
    if (!examType) return "Tidak tersedia"

    switch (examType) {
      case "proposal_defense":
        return "Sidang Proposal"
      case "results_defense":
        return "Sidang Hasil"
      case "final_defense":
        return "Sidang Akhir"
      default:
        return examType
    }
  }

  return (
    <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StaggerItem>
        <Card className="col-span-1 hover:shadow-md hover:shadow-turnitin-teal/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-turnitin-navy">Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              asChild
              className="w-full justify-start bg-gradient-to-r from-turnitin-navy to-turnitin-blue text-white"
              withRipple
            >
              <Link href="/dashboard/student/submit">
                <Upload className="mr-2 h-4 w-4" />
                Submit New Document
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" withRipple>
              <Link href="/dashboard/student/submissions">
                <FileText className="mr-2 h-4 w-4" />
                View Submissions
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" withRipple>
              <Link href="/dashboard/student/feedback">
                <Bell className="mr-2 h-4 w-4" />
                Check Feedback
              </Link>
            </Button>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="col-span-1 hover-lift">
          <CardHeader>
            <CardTitle className="gradient-text">Submission Quota</CardTitle>
            <CardDescription>Your current usage and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Documents Submitted</span>
                <span className="font-medium">
                  <AnimatedCounter value={12} /> / Unlimited
                </span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Progress
                  value={50}
                  className="h-2 bg-turnitin-mint/30"
                  indicatorColor="bg-gradient-to-r from-turnitin-blue to-turnitin-teal"
                />
              </motion.div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage Used</span>
                <span className="font-medium">
                  <AnimatedCounter value={45} /> MB / 1 GB
                </span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              >
                <Progress
                  value={4.5}
                  className="h-2 bg-turnitin-mint/30"
                  indicatorColor="bg-gradient-to-r from-turnitin-blue to-turnitin-teal"
                />
              </motion.div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Subscription Period</span>
                <span className="font-medium">
                  <AnimatedCounter value={58} />% Complete
                </span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              >
                <Progress
                  value={58}
                  className="h-2 bg-turnitin-mint/30"
                  indicatorColor="bg-gradient-to-r from-turnitin-blue to-turnitin-teal"
                />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 transition-all duration-300 hover:shadow-md hover:shadow-turnitin-teal/20">
          <CardHeader>
            <CardTitle className="gradient-text">Account Information</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "Not available"}</p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium flex items-center">
                    <Phone className="mr-1 h-3 w-3 text-primary" />
                    {formatWhatsAppNumber(user?.whatsappNumber)}
                  </p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Thesis Title</p>
                  <p className="font-medium">{user?.examDetails?.thesisTitle || "Not available"}</p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Exam Type</p>
                  <p className="font-medium flex items-center">
                    <BookOpen className="mr-1 h-3 w-3 text-primary" />
                    {formatExamType(user?.examDetails?.examType)}
                  </p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Status</p>
                  <p className="font-medium">Active until July 31, 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

