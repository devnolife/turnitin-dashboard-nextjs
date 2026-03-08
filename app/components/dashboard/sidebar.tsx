"use client"

import { useEffect, useState } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface SidebarProps {
  className?: string
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

const adminRoutes = [
  { href: "/dashboard/admin", icon: Home, title: "Overview" },
  { href: "/dashboard/admin/students", icon: Users, title: "Students" },
  { href: "/dashboard/admin/instructors", icon: Users, title: "Instructors" },
  { href: "/dashboard/admin/faculties", icon: BookOpen, title: "Faculties" },
  { href: "/dashboard/admin/exam-approvals", icon: FileText, title: "Exam Approvals" },
  { href: "/dashboard/admin/payments", icon: CreditCard, title: "Payments" },
  { href: "/dashboard/admin/settings", icon: Settings, title: "Settings" },
]

const instructorRoutes = [
  { href: "/dashboard/instructor", icon: Home, title: "Overview" },
  { href: "/dashboard/instructor/students", icon: Users, title: "Students" },
  { href: "/dashboard/instructor/courses", icon: BookOpen, title: "Courses" },
  { href: "/dashboard/instructor/submissions", icon: FileText, title: "Submissions" },
  { href: "/dashboard/instructor/messages", icon: MessageSquare, title: "Messages" },
  { href: "/dashboard/instructor/analytics", icon: BarChart2, title: "Analytics" },
  { href: "/dashboard/instructor/settings", icon: Settings, title: "Settings" },
]

const studentRoutes = [
  { href: "/dashboard/student", icon: Home, title: "Overview" },
  { href: "/dashboard/student/submissions", icon: FileText, title: "Submissions" },
  { href: "/dashboard/student/feedback", icon: BarChart, title: "Feedback" },
  { href: "/dashboard/student/profile", icon: User, title: "Profile" },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setRole(user.role)
    }
  }, [user])

  const routes = role === "admin" ? adminRoutes : role === "instructor" ? instructorRoutes : studentRoutes

  return (
    <div className="space-y-1">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-turnitin-mint hover:text-turnitin-navy",
            pathname === route.href
              ? "bg-turnitin-mint text-turnitin-navy font-semibold"
              : "text-muted-foreground",
          )}
        >
          <route.icon className="mr-2 h-4 w-4" />
          {route.title}
        </Link>
      ))}
      <button
        onClick={() => {
          onNavigate?.()
          logout()
        }}
        className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors mt-4"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </button>
    </div>
  )
}

export function Sidebar({ className, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname()

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileOpenChange?.(false)
  }, [pathname, onMobileOpenChange])

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden md:block pb-12 w-64 shrink-0 border-r bg-background",
          className,
        )}
      >
        <div className="space-y-4 py-4">
          <div className="px-4 py-2">
            <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
              Turnitin Campus
            </h2>
            <SidebarNav />
          </div>
        </div>
      </div>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle className="text-xl font-semibold tracking-tight">
              Turnitin Campus
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 py-2">
            <SidebarNav onNavigate={() => onMobileOpenChange?.(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

