"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Moon, Sun, User, LogOut, Menu, Search, Settings, Monitor, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/store/auth-store"

interface DashboardHeaderProps {
  user: any | null
  onMenuClick?: () => void
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState(3)
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { logout } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  const getInitials = (email: string | undefined) => {
    if (!email) return "UN"
    return email.split("@")[0].substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-lg mb-6 theme-transition">
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-primary-lighter bg-primary-lighter/30 text-primary-dark dark:border-primary/50 dark:bg-primary/20 dark:text-primary-lighter theme-transition hidden sm:flex"
        >
          <Search className="h-4 w-4 mr-2" />
          Cari
        </Button>
        <Button variant="outline" size="sm" className="rounded-full theme-transition hidden md:flex">
          Dashboard
        </Button>
        <Button variant="outline" size="sm" className="rounded-full theme-transition hidden lg:flex">
          Laporan
        </Button>
      </div>

      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari sesuatu..."
          className="pl-9 w-72 rounded-full border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 theme-transition"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-10 w-10 rounded-full border-2 hover:border-primary hover:bg-primary-lighter/20 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {mounted && (
                <>
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </>
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-2 border-2 border-gray-100 dark:border-gray-700">
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-base cursor-pointer ${resolvedTheme === "light" && theme === "light" ? "bg-primary-lighter/50 text-primary-dark" : ""}`}
            >
              <Sun className="h-5 w-5" />
              <span>Light</span>
              {theme === "light" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-base cursor-pointer ${resolvedTheme === "dark" && theme === "dark" ? "bg-primary/20 text-primary-lighter" : ""}`}
            >
              <Moon className="h-5 w-5" />
              <span>Dark</span>
              {theme === "dark" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-base cursor-pointer ${theme === "system" ? "bg-primary-lighter/30 text-primary-dark dark:bg-primary/20 dark:text-primary-lighter" : ""}`}
            >
              <Monitor className="h-5 w-5" />
              <span>System</span>
              {theme === "system" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative theme-transition">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-white flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Umpan balik baru diterima</DropdownMenuItem>
            <DropdownMenuItem>Pengiriman berhasil</DropdownMenuItem>
            <DropdownMenuItem>Pembayaran dikonfirmasi</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setNotifications(0)}>Tandai semua sebagai dibaca</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="rounded-full theme-transition hidden sm:flex">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden p-0">
              <Avatar className="h-10 w-10 border-2 border-primary-lighter dark:border-primary/50">
                <AvatarImage src="" alt={user?.email || "User"} />
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

