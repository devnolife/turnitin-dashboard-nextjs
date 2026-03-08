"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart2,
  Users,
  CreditCard,
  Settings,
  User,
  FileText,
  Home,
  BookOpen,
  MessageSquare,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  { href: "/dashboard/admin", icon: Home, title: "Dashboard" },
  { href: "/dashboard/admin/students", icon: Users, title: "Mahasiswa" },
  { href: "/dashboard/admin/instructors", icon: Users, title: "Instruktur" },
  { href: "/dashboard/admin/faculties", icon: BookOpen, title: "Fakultas" },
  { href: "/dashboard/admin/exam-approvals", icon: FileText, title: "Persetujuan Ujian", badge: "New" },
  { href: "/dashboard/admin/payments", icon: CreditCard, title: "Pembayaran" },
  { href: "/dashboard/admin/settings", icon: Settings, title: "Pengaturan" },
]

const instructorRoutes = [
  { href: "/dashboard/instructor", icon: Home, title: "Dashboard" },
  { href: "/dashboard/instructor/students", icon: Users, title: "Mahasiswa" },
  { href: "/dashboard/instructor/courses", icon: BookOpen, title: "Mata Kuliah" },
  { href: "/dashboard/instructor/submissions", icon: FileText, title: "Pengiriman" },
  { href: "/dashboard/instructor/messages", icon: MessageSquare, title: "Pesan", badge: "3" },
  { href: "/dashboard/instructor/analytics", icon: BarChart2, title: "Analitik" },
  { href: "/dashboard/instructor/settings", icon: Settings, title: "Pengaturan" },
]

const studentRoutes = [
  { href: "/dashboard/student", icon: Home, title: "Dashboard" },
  { href: "/dashboard/student/submissions", icon: FileText, title: "Pengiriman" },
  { href: "/dashboard/student/feedback", icon: BarChart2, title: "Umpan Balik" },
  { href: "/dashboard/student/profile", icon: User, title: "Profil" },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setRole(user.role)
    }
  }, [user])

  const routes = role === "admin" ? adminRoutes : role === "instructor" ? instructorRoutes : studentRoutes

  const getRoleLabel = (r: string | null) => {
    switch (r) {
      case "student": return "Mahasiswa"
      case "instructor": return "Instruktur"
      case "admin": return "Administrator"
      default: return ""
    }
  }

  const getInitials = (email: string | undefined) => {
    if (!email) return "UN"
    return email.split("@")[0].substring(0, 2).toUpperCase()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-center bg-[#63A6DD] rounded-tr-[2rem]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white flex items-center justify-center rounded-xl rotate-12 shadow-md">
            <ShieldCheck className="h-5 w-5 text-primary-dark" />
          </div>
          <h1 className="text-xl font-bold text-white">Turnitin</h1>
        </div>
      </div>

      {/* User Profile - Compact */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
        <Avatar className="w-10 h-10 shrink-0 border-2 border-primary-lighter dark:border-primary/50">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
          <AvatarFallback className="bg-primary text-white text-sm">
            {getInitials(user?.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{user?.name || user?.email || "User"}</p>
          <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} onClick={onNavigate}>
            <Button
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start rounded-xl h-10 text-sm font-normal",
                pathname === route.href
                  ? "bg-primary-lighter/50 text-primary-dark font-medium dark:bg-primary/20 dark:text-primary-lighter"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              <route.icon className="mr-3 h-4 w-4 shrink-0" />
              {route.title}
              {"badge" in route && route.badge && (
                <span
                  className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    route.badge === "New" ? "bg-[#63A6DD]" : "bg-primary"
                  } text-white`}
                >
                  {route.badge}
                </span>
              )}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={() => {
            onNavigate?.()
            logout()
          }}
          className="w-full justify-start rounded-xl h-10 text-sm font-normal text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  )
}

export function Sidebar({ className, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname()

  useEffect(() => {
    onMobileOpenChange?.(false)
  }, [pathname, onMobileOpenChange])

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden md:block w-72 shrink-0 bg-white dark:bg-gray-800 h-screen rounded-r-[2rem] shadow-lg theme-transition",
          className,
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 p-0 rounded-r-[2rem]">
          <SidebarContent onNavigate={() => onMobileOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

