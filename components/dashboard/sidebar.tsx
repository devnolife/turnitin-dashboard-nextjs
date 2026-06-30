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
  Shield,
  CheckSquare,
  Send,
  FileBarChart,
  MessageSquareWarning,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
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
  { href: "/dashboard/admin/instructors", icon: Shield, title: "Instruktur" },
  { href: "/dashboard/admin/faculties", icon: BookOpen, title: "Fakultas & Prodi" },
  { href: "/dashboard/admin/exam-approvals", icon: CheckSquare, title: "Persetujuan Akun" },
  { href: "/dashboard/admin/payments", icon: CreditCard, title: "Pembayaran" },
  { href: "/dashboard/admin/rekap", icon: FileBarChart, title: "Rekap Plagiasi" },
  { href: "/dashboard/admin/complaints", icon: MessageSquareWarning, title: "Pengaduan" },
  { href: "/dashboard/admin/settings", icon: Settings, title: "Pengaturan" },
]

const instructorRoutes = [
  { href: "/dashboard/instructor", icon: Home, title: "Dashboard" },
  { href: "/dashboard/instructor/students", icon: Users, title: "Mahasiswa" },
  { href: "/dashboard/instructor/submissions", icon: Send, title: "Pengiriman" },
  { href: "/dashboard/instructor/analytics", icon: BarChart2, title: "Analitik" },
  { href: "/dashboard/instructor/profile", icon: User, title: "Profil" },
  { href: "/dashboard/instructor/settings", icon: Settings, title: "Pengaturan" },
]

const studentRoutes = [
  { href: "/dashboard/student", icon: Home, title: "Dashboard" },
  { href: "/dashboard/student/submissions", icon: Send, title: "Pengiriman" },
  { href: "/dashboard/student/feedback", icon: MessageSquare, title: "Umpan Balik" },
  { href: "/dashboard/student/complaint", icon: MessageSquareWarning, title: "Pengaduan" },
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
    <div className="h-full flex flex-col relative z-10">
      {/* Brand */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-[#2E81CB] px-5 py-5">
        <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Logo Perpusmu - Universitas Muhammadiyah Makassar"
            className="size-10 rounded-full shadow-md ring-2 ring-white/40"
          />
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-white">Perpusmu</h1>
            <p className="text-[11px] text-white/70">Sistem Cek Plagiarisme</p>
          </div>
        </div>
      </div>

      {/* User Profile - Compact inline */}
      <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
        <Avatar className="size-14 shrink-0 border-2 border-primary-lighter dark:border-primary/50">
          {role !== "instructor" && (
            <AvatarImage src="/placeholder.svg?height=56&width=56" alt="User" />
          )}
          <AvatarFallback className="bg-primary text-white text-base">
            {getInitials(user?.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-base truncate">{user?.name || user?.email || "User"}</p>
          <p className="text-sm text-muted-foreground">{getRoleLabel(role)}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link key={route.href} href={route.href} onClick={onNavigate}>
                <Button
                  variant="ghost"
                  className={cn(
                    "mb-0.5 h-11 w-full justify-start rounded-xl text-sm font-medium text-muted-foreground transition-colors",
                    "hover:bg-primary/5 hover:text-primary-dark dark:hover:bg-primary/10 dark:hover:text-primary-light",
                    isActive &&
                      "bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm shadow-primary/25 hover:from-primary hover:to-primary-dark hover:text-white",
                  )}
                >
                  <route.icon className="mr-3 h-[18px] w-[18px] shrink-0" />
                  {route.title}
                  {"badge" in route && route.badge && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                      {route.badge}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="px-4 pb-6">
        <Button
          variant="ghost"
          onClick={() => {
            onNavigate?.()
            logout()
          }}
          className="w-full justify-start rounded-2xl h-11 text-sm font-normal text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <LogOut className="mr-3 h-[18px] w-[18px] shrink-0" />
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
          "relative z-20 hidden h-screen w-64 shrink-0 overflow-hidden border-r bg-card shadow-sm theme-transition md:block xl:w-72",
          className,
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-72 overflow-hidden p-0 [&>button]:hidden"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SidebarContent onNavigate={() => onMobileOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

