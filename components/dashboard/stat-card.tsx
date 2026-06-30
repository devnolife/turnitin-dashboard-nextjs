"use client"

import type React from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/ui/motion"
import { cn } from "@/lib/utils"

export type StatTone = "primary" | "emerald" | "amber" | "rose" | "violet" | "slate"

const toneChip: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
}

interface StatCardProps {
  title: string
  icon: LucideIcon
  /** Static value node. Ignored when `countTo` is set. */
  value?: React.ReactNode
  /** Animate a numeric counter up to this value. */
  countTo?: number
  /** Appended after the animated counter (e.g. "%"). */
  suffix?: string
  caption?: string
  tone?: StatTone
  className?: string
}

/**
 * Kartu statistik standar dashboard (menggantikan 5+ salinan markup serupa).
 * Chip ikon berwarna + label + angka besar + caption opsional.
 */
export function StatCard({
  title,
  icon: Icon,
  value,
  countTo,
  suffix,
  caption,
  tone = "primary",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "group border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="flex items-start gap-4 p-5">
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", toneChip[tone])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-1 text-2xl font-bold leading-none tracking-tight">
            {countTo !== undefined ? (
              <>
                <AnimatedCounter value={countTo} />
                {suffix}
              </>
            ) : (
              value
            )}
          </div>
          {caption ? <p className="mt-1.5 truncate text-xs text-muted-foreground">{caption}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
