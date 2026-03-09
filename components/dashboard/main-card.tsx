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
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg relative overflow-hidden theme-transition">
      {/* Decorative blob shapes */}
      <div className="absolute -right-20 -top-20 w-64 h-64 gen-z-blob bg-primary-lighter/30 dark:bg-primary/10" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 gen-z-blob-alt bg-secondary/50 dark:bg-secondary/10" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary text-white p-2 rounded-2xl">
            <Icon className="h-6 w-6" />
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
