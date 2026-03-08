"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Moon, Sun, Menu, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"

interface DashboardHeaderProps {
  user: any | null
  onMenuClick?: () => void
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-lg mb-6 theme-transition">
      {/* Left: Mobile menu + Quick actions */}
      <div className="flex items-center gap-2">
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

      {/* Center: Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari sesuatu..."
          className="pl-9 w-72 rounded-full border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 theme-transition"
        />
      </div>

      {/* Right: Theme + Notifications + Settings */}
      <div className="flex items-center gap-3">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full theme-transition"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}

        <Button variant="ghost" size="icon" className="rounded-full relative theme-transition">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full theme-transition hidden sm:flex">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

