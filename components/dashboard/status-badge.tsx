import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral"

const toneClass: Record<StatusTone, string> = {
  success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "border-transparent bg-rose-500/15 text-rose-700 dark:text-rose-400",
  info: "border-transparent bg-primary/15 text-primary-dark dark:text-primary-light",
  neutral: "border-transparent bg-muted text-muted-foreground",
}

/**
 * Pemetaan status aplikasi (submission/job/pembayaran/persetujuan) ke label
 * Indonesia + warna konsisten. Terpusat supaya tidak ada lagi `text-green-600`
 * tersebar di banyak halaman.
 */
const STATUS_MAP: Record<string, { label: string; tone: StatusTone }> = {
  // Submission / Turnitin job
  REVIEWED: { label: "Selesai", tone: "success" },
  COMPLETED: { label: "Selesai", tone: "success" },
  SUCCEEDED: { label: "Selesai", tone: "success" },
  PROCESSING: { label: "Diproses", tone: "info" },
  RUNNING: { label: "Diproses", tone: "info" },
  QUEUED: { label: "Antri", tone: "warning" },
  PENDING: { label: "Menunggu", tone: "warning" },
  WAITING_REPORT: { label: "Menunggu Hasil", tone: "info" },
  SUBMITTED: { label: "Terkirim", tone: "info" },
  FAILED: { label: "Gagal", tone: "danger" },
  REJECTED: { label: "Ditolak", tone: "danger" },
  APPROVED: { label: "Disetujui", tone: "success" },
  ACTIVE: { label: "Aktif", tone: "success" },
  INACTIVE: { label: "Nonaktif", tone: "neutral" },
  GRADUATED: { label: "Lulus", tone: "info" },
  // Pembayaran
  PAID: { label: "Lunas", tone: "success" },
  UNPAID: { label: "Belum Lunas", tone: "warning" },
}

interface StatusBadgeProps {
  status: string | null | undefined
  /** Override label bila perlu. */
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = (status ?? "").toString().toUpperCase()
  const match = STATUS_MAP[key] ?? { label: label ?? status ?? "-", tone: "neutral" as StatusTone }
  return (
    <Badge className={cn("rounded-full font-medium", toneClass[match.tone], className)}>
      {label ?? match.label}
    </Badge>
  )
}
