"use client"

import { useEffect, useState } from "react"
import { MessageSquareWarning, Loader2, Clock, CheckCircle2, XCircle, AlertCircle, Reply } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  user: { id: string; name: string; username: string; nim: string | null; role: string }
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

export function AdminComplaintsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ComplaintStatus | "ALL">("ALL")
  const [openDialog, setOpenDialog] = useState<Complaint | null>(null)
  const [response, setResponse] = useState("")
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("RESOLVED")
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const url = filter === "ALL" ? "/admin/complaints" : `/admin/complaints?status=${filter}`
      const res = await api.get(url)
      setItems(res.data.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const openReply = (c: Complaint) => {
    setOpenDialog(c)
    setResponse(c.response || "")
    setNewStatus(c.status === "OPEN" ? "RESOLVED" : c.status)
  }

  const onSave = async () => {
    if (!openDialog) return
    setSubmitting(true)
    try {
      await api.patch(`/admin/complaints/${openDialog.id}`, {
        response: response.trim(),
        status: newStatus,
      })
      toast({ title: "Tersimpan", description: "Balasan terkirim ke mahasiswa." })
      setOpenDialog(null)
      await load()
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal menyimpan"
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

  const counts = {
    OPEN: items.filter((c) => c.status === "OPEN").length,
    IN_PROGRESS: items.filter((c) => c.status === "IN_PROGRESS").length,
    RESOLVED: items.filter((c) => c.status === "RESOLVED").length,
    CLOSED: items.filter((c) => c.status === "CLOSED").length,
  }

  return (
    <DashboardMainCard
      title="Pengaduan Mahasiswa"
      subtitle="Kelola dan balas pengaduan, pertanyaan, atau saran dari mahasiswa."
      icon={MessageSquareWarning}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Label htmlFor="filter" className="text-sm">
          Filter status:
        </Label>
        <Select value={filter} onValueChange={(v) => setFilter(v as ComplaintStatus | "ALL")}>
          <SelectTrigger id="filter" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="OPEN">Menunggu ({counts.OPEN})</SelectItem>
            <SelectItem value="IN_PROGRESS">Diproses ({counts.IN_PROGRESS})</SelectItem>
            <SelectItem value="RESOLVED">Selesai ({counts.RESOLVED})</SelectItem>
            <SelectItem value="CLOSED">Ditutup ({counts.CLOSED})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquareWarning className="size-10 text-muted-foreground" />
            <p className="font-medium">Tidak ada pengaduan</p>
            <p className="text-sm text-muted-foreground">
              {filter === "ALL" ? "Belum ada pengaduan yang masuk." : "Tidak ada pengaduan dengan status ini."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <Card key={c.id} className="rounded-3xl border bg-card transition hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{c.subject}</h4>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{c.user.name}</span>
                      {c.user.nim && ` (${c.user.nim})`} • {fmtDate(c.createdAt)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openReply(c)}>
                    <Reply className="mr-1.5 size-3.5" />
                    {c.response ? "Edit Balasan" : "Balas"}
                  </Button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{c.message}</p>
                {c.response && (
                  <div className="mt-4 rounded-2xl border-l-4 border-primary bg-primary/5 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <Badge variant="secondary" className="text-[10px]">
                        Balasan
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

      <Dialog open={!!openDialog} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Balas Pengaduan</DialogTitle>
            <DialogDescription>
              Dari <strong>{openDialog?.user.name}</strong>
              {openDialog?.user.nim && ` (${openDialog.user.nim})`}
            </DialogDescription>
          </DialogHeader>

          {openDialog && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="font-medium text-sm">{openDialog.subject}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {openDialog.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response">Balasan</Label>
                <Textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  placeholder="Tulis balasan untuk mahasiswa…"
                />
                <p className="text-xs text-muted-foreground text-right">{response.length}/5000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status setelah disimpan</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ComplaintStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Menunggu</SelectItem>
                    <SelectItem value="IN_PROGRESS">Diproses</SelectItem>
                    <SelectItem value="RESOLVED">Selesai</SelectItem>
                    <SelectItem value="CLOSED">Ditutup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={onSave} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardMainCard>
  )
}
