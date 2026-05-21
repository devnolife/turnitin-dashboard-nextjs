"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  PlayCircle,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import api from "@/lib/api/client"

interface QueueItem {
  id: string
  documentTitle: string
  fileName: string | null
  examType: string | null
  chapter: string | null
  similarityScore: number | null
  status: "PENDING" | "PROCESSING" | "REVIEWED" | "FLAGGED"
  rejectionReason: string | null
  reportFileName: string | null
  version: number
  createdAt: string
  reviewedAt: string | null
  user: {
    id: string
    name: string
    username: string
    nim: string | null
    prodi: string | null
    studyProgram: {
      name: string
      code: string
      similarityRules?: Array<{
        id: string
        ruleType: "PER_CHAPTER" | "PER_EXAM"
        label: string
        maxPercentage: number
      }>
    } | null
  }
}

const EXAM_LABELS: Record<string, string> = {
  PROPOSAL_DEFENSE: "Sidang Proposal",
  RESULTS_DEFENSE: "Sidang Hasil",
  FINAL_DEFENSE: "Sidang Tutup",
}

function pickRuleForItem(item: QueueItem) {
  const rules = item.user.studyProgram?.similarityRules ?? []
  if (rules.length === 0) return null
  const type = rules[0].ruleType
  if (type === "PER_CHAPTER" && item.chapter) {
    return (
      rules.find((r) => r.label.toLowerCase() === item.chapter!.toLowerCase()) ??
      rules[0]
    )
  }
  if (type === "PER_EXAM" && item.examType) {
    const examLabel = EXAM_LABELS[item.examType] ?? item.examType
    return (
      rules.find(
        (r) =>
          r.label.toLowerCase() === item.examType!.toLowerCase() ||
          r.label.toLowerCase() === examLabel.toLowerCase(),
      ) ?? rules[0]
    )
  }
  return rules[0]
}

const STATUS_META = {
  PENDING: { label: "Menunggu", icon: Clock, cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  PROCESSING: { label: "Diproses", icon: Loader2, cls: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
  REVIEWED: { label: "Selesai", icon: CheckCircle, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  FLAGGED: { label: "Direvisi", icon: AlertTriangle, cls: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
} as const

export default function InstructorSubmissionsClient() {
  const { toast } = useToast()
  const [items, setItems] = useState<QueueItem[]>([])
  const [counts, setCounts] = useState({ PENDING: 0, PROCESSING: 0, REVIEWED: 0, FLAGGED: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"PENDING" | "PROCESSING" | "REVIEWED" | "FLAGGED">("PENDING")
  const [search, setSearch] = useState("")
  const [resultFor, setResultFor] = useState<QueueItem | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/instructor/submissions/queue?status=${tab}&limit=100`)
      setItems(res.data.submissions || [])
      setCounts(res.data.counts || { PENDING: 0, PROCESSING: 0, REVIEWED: 0, FLAGGED: 0 })
    } catch {
      toast({ variant: "destructive", title: "Gagal memuat antrian" })
    } finally {
      setLoading(false)
    }
  }, [tab, toast])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.documentTitle.toLowerCase().includes(q) ||
        i.user.name.toLowerCase().includes(q) ||
        (i.user.nim || "").toLowerCase().includes(q),
    )
  }, [items, search])

  const handleClaim = async (id: string) => {
    setBusyId(id)
    try {
      await api.post(`/submissions/${id}/claim`)
      toast({ title: "Klaim berhasil", description: "Status berubah ke Diproses." })
      void load()
    } catch (e) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast({ variant: "destructive", title: "Gagal", description: msg || "Coba lagi." })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardMainCard
      title="Antrian Pengiriman"
      subtitle="Periksa dokumen mahasiswa di Turnitin, lalu upload hasilnya kembali ke aplikasi."
      icon={FileCheck2}
    >
      {/* Counts */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k) => {
          const meta = STATUS_META[k]
          const Icon = meta.icon
          const active = tab === k
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`group flex items-center justify-between rounded-3xl border bg-white p-5 text-left shadow-sm transition-all dark:bg-gray-900/80 ${active
                  ? "border-primary/60 ring-2 ring-primary/20 shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/40 hover:shadow-md"
                }`}
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {meta.label}
                </p>
                <p className="mt-1 text-3xl font-bold">{counts[k]}</p>
              </div>
              <div className={`grid size-12 place-items-center rounded-2xl ${meta.cls}`}>
                <Icon className="size-5" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, nama mahasiswa, NIM..."
            className="h-10 rounded-2xl pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} className="rounded-2xl">
          <RefreshCw className="mr-2 size-4" /> Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="mb-4 grid w-full grid-cols-4 rounded-full bg-muted p-1 sm:w-auto sm:inline-grid">
          {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k) => (
            <TabsTrigger key={k} value={k} className="rounded-full">
              {STATUS_META[k].label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          {loading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="rounded-3xl border-2 border-dashed">
              <CardContent className="grid place-items-center py-16 text-center">
                <FileText className="mb-3 size-10 text-muted-foreground/40" />
                <p className="font-medium">Antrian kosong</p>
                <p className="text-sm text-muted-foreground">
                  Belum ada pengiriman pada kategori ini.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map((item) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  busy={busyId === item.id}
                  onClaim={() => handleClaim(item.id)}
                  onResult={() => setResultFor(item)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ResultDialog
        item={resultFor}
        onClose={() => setResultFor(null)}
        onDone={() => {
          setResultFor(null)
          void load()
        }}
      />
    </DashboardMainCard>
  )
}

function QueueRow({
  item,
  busy,
  onClaim,
  onResult,
}: {
  item: QueueItem
  busy: boolean
  onClaim: () => void
  onResult: () => void
}) {
  const meta = STATUS_META[item.status]
  const Icon = meta.icon
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
            <FileText className="size-5 text-primary-dark" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">{item.documentTitle}</h3>
              {item.version > 1 && (
                <Badge variant="outline" className="border-primary/30 text-xs">
                  v{item.version}
                </Badge>
              )}
              <Badge variant="outline" className={`gap-1.5 border-transparent ${meta.cls}`}>
                <Icon className={`size-3 ${item.status === "PROCESSING" ? "animate-spin" : ""}`} />
                {meta.label}
              </Badge>
              {item.similarityScore != null && (
                <Badge variant="outline" className="border-primary/30">
                  {item.similarityScore.toFixed(1)}%
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{item.user.name}</span>
              {item.user.nim && <span>· NIM {item.user.nim}</span>}
              {item.user.studyProgram?.name && <span>· {item.user.studyProgram.name}</span>}
              {item.examType && <span>· {EXAM_LABELS[item.examType] ?? item.examType}</span>}
              {item.chapter && <span>· {item.chapter}</span>}
            </div>
            {item.rejectionReason && (
              <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                Catatan: {item.rejectionReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <a href={`/api/submissions/${item.id}/file`} target="_blank" rel="noreferrer">
              <Download className="mr-2 size-4" /> File
            </a>
          </Button>

          {item.status === "PENDING" && (
            <Button
              size="sm"
              onClick={onClaim}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white"
            >
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <PlayCircle className="mr-2 size-4" />}
              Mulai Cek
            </Button>
          )}

          {(item.status === "PENDING" || item.status === "PROCESSING") && (
            <Button size="sm" onClick={onResult} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
              <Upload className="mr-2 size-4" /> Upload Hasil
            </Button>
          )}

          {item.status === "REVIEWED" && item.reportFileName && (
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <a href={`/api/submissions/${item.id}/report`} target="_blank" rel="noreferrer">
                <Download className="mr-2 size-4" /> Report
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ResultDialog({
  item,
  onClose,
  onDone,
}: {
  item: QueueItem | null
  onClose: () => void
  onDone: () => void
}) {
  const { toast } = useToast()
  const [similarity, setSimilarity] = useState("")
  const [status, setStatus] = useState<"REVIEWED" | "FLAGGED">("REVIEWED")
  const [statusTouched, setStatusTouched] = useState(false)
  const [reason, setReason] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const rule = useMemo(() => (item ? pickRuleForItem(item) : null), [item])

  useEffect(() => {
    if (item) {
      setSimilarity("")
      setStatus("REVIEWED")
      setStatusTouched(false)
      setReason("")
      setFile(null)
    }
  }, [item])

  // Auto-suggest status berdasarkan SimilarityRule selama instruktur belum override manual
  useEffect(() => {
    if (statusTouched || !rule) return
    const num = Number(similarity)
    if (!Number.isFinite(num) || similarity === "") return
    setStatus(num <= rule.maxPercentage ? "REVIEWED" : "FLAGGED")
  }, [similarity, rule, statusTouched])

  const handleSubmit = async () => {
    if (!item) return
    if (!file) {
      toast({ variant: "destructive", title: "File report belum dipilih" })
      return
    }
    const num = Number(similarity)
    if (!Number.isFinite(num) || num < 0 || num > 100) {
      toast({ variant: "destructive", title: "Similarity harus 0-100" })
      return
    }
    if (status === "FLAGGED" && reason.trim().length < 3) {
      toast({ variant: "destructive", title: "Tuliskan alasan revisi" })
      return
    }

    setSubmitting(true)
    const fd = new FormData()
    fd.append("report", file)
    fd.append("similarity", String(num))
    fd.append("status", status)
    if (status === "FLAGGED") fd.append("rejectionReason", reason)

    try {
      await api.post(`/submissions/${item.id}/result`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast({ title: "Hasil terkirim", description: "Mahasiswa bisa melihat hasil sekarang." })
      onDone()
    } catch (e) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast({ variant: "destructive", title: "Gagal", description: msg || "Coba lagi." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle>Upload Hasil Pengecekan</DialogTitle>
          <DialogDescription>
            {item ? `${item.documentTitle} — ${item.user.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        {rule && (
          <div className="flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="leading-relaxed">
              Aturan prodi:{" "}
              <strong>{rule.label}</strong> ≤{" "}
              <strong>{rule.maxPercentage}%</strong> → REVIEWED. Keputusan akan
              disarankan otomatis dari skor — Anda tetap bisa mengubahnya.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="similarity">Skor Similarity (%)</Label>
              <Input
                id="similarity"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={similarity}
                onChange={(e) => setSimilarity(e.target.value)}
                className="h-11 rounded-2xl"
                placeholder="contoh: 12.4"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Keputusan</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatusTouched(true)
                  setStatus(v as "REVIEWED" | "FLAGGED")
                }}
              >
                <SelectTrigger className="h-11 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REVIEWED">Diterima (REVIEWED)</SelectItem>
                  <SelectItem value="FLAGGED">Perlu Revisi (FLAGGED)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === "FLAGGED" && (
            <div className="space-y-1.5">
              <Label htmlFor="reason">Alasan Revisi</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Jelaskan apa yang harus diperbaiki mahasiswa..."
                className="rounded-2xl"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="report">File Report Turnitin (PDF)</Label>
            <label
              htmlFor="report"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-6 text-center hover:border-primary hover:bg-primary/5"
            >
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "Klik untuk pilih PDF"}
              </p>
              <p className="text-xs text-muted-foreground">Maks. 20 MB · hanya PDF</p>
              <input
                id="report"
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" /> Kirim Hasil
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
