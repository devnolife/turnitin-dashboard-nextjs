"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  Users,
  CreditCard,
  Settings,
  User,
  FileText,
  Home,
  BookOpen,
  MessageSquare,
  BarChart2,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setRole(user.role)
    }
  }, [user])

  const adminRoutes = [
    {
      href: "/dashboard/admin",
      icon: Home,
      title: "Overview",
      variant: "default",
    },
    {
      href: "/dashboard/admin/students",
      icon: Users,
      title: "Students",
      variant: "ghost",
    },
    {
      href: "/dashboard/admin/instructors",
      icon: Users,
      title: "Instructors",
      variant: "ghost",
    },
    {
      href: "/dashboard/admin/faculties",
      icon: BookOpen,
      title: "Faculties",
      variant: "ghost",
    },
    {
      href: "/dashboard/admin/exam-approvals",
      icon: FileText,
      title: "Exam Approvals",
      variant: "ghost",
    },
    {
      href: "/dashboard/admin/payments",
      icon: CreditCard,
      title: "Payments",
      variant: "ghost",
    },
    {
      href: "/dashboard/admin/settings",
      icon: Settings,
      title: "Settings",
      variant: "ghost",
    },
  ]

  const instructorRoutes = [
    {
      href: "/dashboard/instructor",
      icon: Home,
      title: "Overview",
      variant: "default",
    },
    {
      href: "/dashboard/instructor/students",
      icon: Users,
      title: "Students",
      variant: "ghost",
    },
    {
      href: "/dashboard/instructor/courses",
      icon: BookOpen,
      title: "Courses",
      variant: "ghost",
    },
    {
      href: "/dashboard/instructor/submissions",
      icon: FileText,
      title: "Submissions",
      variant: "ghost",
    },
    {
      href: "/dashboard/instructor/messages",
      icon: MessageSquare,
      title: "Messages",
      variant: "ghost",
    },
    {
      href: "/dashboard/instructor/analytics",
      icon: BarChart2,
      title: "Analytics",
      variant: "ghost",
    },
    {
      href: "/dashboard/instructor/settings",
      icon: Settings,
      title: "Settings",
      variant: "ghost",
    },
  ]

  const studentRoutes = [
    {
      href: "/dashboard/student",
      icon: Home,
      title: "Overview",
      variant: "default",
    },
    {
      href: "/dashboard/student/submissions",
      icon: FileText,
      title: "Submissions",
      variant: "ghost",
    },
    {
      href: "/dashboard/student/feedback",
      icon: BarChart,
      title: "Feedback",
      variant: "ghost",
    },
    {
      href: "/dashboard/student/profile",
      icon: User,
      title: "Profile",
      variant: "ghost",
    },
  ]

  const routes = role === "admin" ? adminRoutes : role === "instructor" ? instructorRoutes : studentRoutes

  return (
    <div className={cn("pb-12 w-64 bg-white shadow-sm h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">Turnitin Campus</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-50 hover:text-primary-900 transition-colors",
                  pathname === route.href ? "bg-primary-100 text-primary-900" : "text-gray-700",
                )}
              >
                <route.icon className="mr-2 h-4 w-4" />
                {route.title}
              </Link>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors mt-4"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

