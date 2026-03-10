"use client"

import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"

interface DashboardHeaderProps {
  user: any | null
  onMenuClick?: () => void
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-lg mb-6 theme-transition">
      {/* Left: Mobile menu */}
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
      </div>

      {/* Center: Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari mahasiswa, dokumen..."
          className="pl-9 w-72 rounded-full border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 theme-transition"
        />
      </div>

      {/* Right: Theme + Notifications */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="rounded-full relative theme-transition">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
        </Button>
      </div>
    </div>
  )
}

