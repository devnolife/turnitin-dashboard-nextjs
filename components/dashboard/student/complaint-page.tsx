"use client"

import { useEffect, useState } from "react"
import { MessageSquareWarning, Send, Loader2, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/api/client"

type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

interface Complaint {
  id: string
  subject: string
  message: string
  status: ComplaintStatus
  response: string | null
  createdAt: string
  respondedAt: string | null
  respondedBy: { id: string; name: string } | null
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; icon: typeof Clock; cls: string }> = {
  OPEN: { label: "Menunggu", icon: Clock, cls: "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  IN_PROGRESS: { label: "Diproses", icon: AlertCircle, cls: "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  RESOLVED: { label: "Selesai", icon: CheckCircle2, cls: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
  CLOSED: { label: "Ditutup", icon: XCircle, cls: "border-gray-300 bg-gray-50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400" },
}

function StatusBadge({ status }: { status: ComplaintStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <Badge variant="outline" className={`gap-1.5 border ${cfg.cls}`}>
      <Icon className="size-3" />
      {cfg.label}
    </Badge>
  )
}

export function StudentComplaintPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const res = await api.get("/complaints")
      setItems(res.data.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (subject.trim().length < 3 || message.trim().length < 10) {
      toast({ variant: "destructive", title: "Validasi", description: "Judul min 3 karakter, pesan min 10 karakter" })
      return
    }
    setSubmitting(true)
    try {
      await api.post("/complaints", { subject: subject.trim(), message: message.trim() })
      toast({ title: "Pengaduan terkirim", description: "Admin akan segera memprosesnya." })
      setSubject("")
      setMessage("")
      await load()
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal mengirim pengaduan"
      toast({ variant: "destructive", title: "Gagal", description: msg })
    } finally {
      setSubmitting(false)
    }
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })

  return (
    <DashboardMainCard
      title="Pengaduan & Saran"
      subtitle="Sampaikan keluhan, pertanyaan, atau saran kepada admin Perpusmu."
      icon={MessageSquareWarning}
    >
      <Card className="mb-8 rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Judul Pengaduan</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="cth: Kendala upload Bab II"
                maxLength={200}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Isi Pesan</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Jelaskan kendala atau saran Anda secara rinci…"
                rows={6}
                maxLength={5000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">{message.length}/5000</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Mengirim…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" /> Kirim Pengaduan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Riwayat Pengaduan</h3>
        <span className="text-xs text-muted-foreground">{items.length} total</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquareWarning className="size-10 text-muted-foreground" />
            <p className="font-medium">Belum ada pengaduan</p>
            <p className="text-sm text-muted-foreground">Kirim pengaduan pertama Anda di form di atas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <Card key={c.id} className="rounded-3xl border bg-card transition hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold">{c.subject}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">Dikirim {fmtDate(c.createdAt)}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{c.message}</p>

                {c.response && (
                  <div className="mt-4 rounded-2xl border-l-4 border-primary bg-primary/5 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <Badge variant="secondary" className="text-[10px]">
                        Balasan Admin
                      </Badge>
                      <span className="text-muted-foreground">
                        {c.respondedBy?.name}
                        {c.respondedAt && ` • ${fmtDate(c.respondedAt)}`}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{c.response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardMainCard>
  )
}
