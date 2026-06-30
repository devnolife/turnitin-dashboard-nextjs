"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Database, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import api from "@/lib/api/client"

interface InboxStatus {
  available: boolean
  count?: number
  capacity?: number
  remaining?: number | null
  level?: "ok" | "warning" | "full" | "unknown"
  checkedAt?: string
  note?: string
  message?: string
}

/**
 * Banner peringatan kapasitas inbox Turnitin (akun limit ~25 paper).
 * Tampil hanya saat WARNING/FULL/UNKNOWN — disembunyikan saat aman (ok) atau
 * status belum tersedia.
 */
export function TurnitinInboxBanner() {
  const [status, setStatus] = useState<InboxStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get("/admin/turnitin/inbox-status")
      setStatus(res.data)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (!status || !status.available) return null
  const level = status.level ?? "ok"
  if (level === "ok") return null

  const full = level === "full"
  const unknown = level === "unknown"

  const tone = full
    ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30"
    : unknown
      ? "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
      : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"

  const iconTone = full ? "text-rose-500" : unknown ? "text-slate-500" : "text-amber-500"

  const checked = status.checkedAt
    ? new Date(status.checkedAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
    : "-"

  return (
    <Card className={`mb-6 ${tone}`}>
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {unknown ? (
            <Database className={`mt-0.5 size-5 shrink-0 ${iconTone}`} />
          ) : (
            <AlertTriangle className={`mt-0.5 size-5 shrink-0 ${iconTone}`} />
          )}
          <div>
            <p className="font-semibold">
              {full
                ? `Inbox Turnitin PENUH (${status.count}/${status.capacity} paper)`
                : unknown
                  ? "Status inbox Turnitin tidak terbaca"
                  : `Inbox Turnitin hampir penuh (${status.count}/${status.capacity} paper)`}
            </p>
            <p className="text-sm text-muted-foreground">
              {full
                ? "Pengiriman baru bisa gagal. Hapus/arsipkan paper lama di akun Turnitin untuk melegakan kuota."
                : unknown
                  ? status.note || "Worker belum berhasil menghitung. Pastikan worker berjalan."
                  : `Sisa ${status.remaining} slot sebelum penuh. Pertimbangkan membersihkan paper lama di Turnitin.`}{" "}
              <span className="opacity-70">· Diperiksa: {checked}</span>
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="shrink-0">
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} /> Perbarui
        </Button>
      </CardContent>
    </Card>
  )
}
