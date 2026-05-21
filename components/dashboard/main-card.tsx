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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-primary-lighter/30 p-6 shadow-lg ring-1 ring-black/[0.04] dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/80 dark:ring-white/[0.06] theme-transition">
      {/* Decorative blob shapes */}
      <div className="absolute -right-20 -top-20 size-64 gen-z-blob bg-primary-lighter/40 dark:bg-primary/10 pointer-events-none" style={{ transform: "translateZ(0)" }} />
      <div className="absolute -left-20 -bottom-20 size-64 gen-z-blob-alt bg-secondary/40 dark:bg-secondary/10 pointer-events-none" style={{ transform: "translateZ(0)" }} />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary text-white p-2 rounded-2xl shadow-md shadow-primary/25">
            <Icon className="size-6" />
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <p className="text-muted-foreground text-lg ml-14">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
