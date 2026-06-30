"use client"

import type React from "react"
import { type LucideIcon } from "lucide-react"

interface DashboardMainCardProps {
  title: string
  subtitle: string
  icon: LucideIcon
  children: React.ReactNode
}

export function DashboardMainCard({ title, subtitle, icon: Icon, children }: DashboardMainCardProps) {
  return (
    <div className="space-y-6">
      {/* Page header banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        {/* Left brand accent + soft glow */}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary to-primary-dark" />
        <div className="pointer-events-none absolute -right-10 -top-14 size-44 rounded-full bg-primary/5 blur-2xl dark:bg-primary/10" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/25">
            <Icon className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold leading-tight tracking-tight">{title}</h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="space-y-6">{children}</div>
    </div>
  )
}
