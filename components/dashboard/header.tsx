"use client"

import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"
import type { User } from "@/lib/types"

interface DashboardHeaderProps {
  user: User | null
  onMenuClick?: () => void
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-2 rounded-2xl border bg-card p-2.5 shadow-sm theme-transition">
      {/* Left: Mobile menu */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </Button>
        {/* Search (desktop) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari mahasiswa, dokumen..."
            className="w-64 rounded-xl border-border bg-muted/40 pl-9 focus:bg-background focus:ring-2 focus:ring-primary/20 lg:w-80 theme-transition"
          />
        </div>
      </div>

      {/* Right: Theme + Notifications */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl theme-transition"
          aria-label="Notifikasi"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
        </Button>
      </div>
    </div>
  )
}

