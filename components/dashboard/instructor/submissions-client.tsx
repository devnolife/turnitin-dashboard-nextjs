"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
  turnitinRawScore: number | null
  scoreAdjustedByName: string | null
  scoreAdjustmentReason: string | null
  scoreAdjustedAt: string | null
  status: "PENDING" | "PROCESSING" | "REVIEWED" | "FLAGGED"
  rejectionReason: string | null
  autoCheckError: string | null
  autoCheckedAt: string | null
  integrityFlags: number | null
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
  const [adjustFor, setAdjustFor] = useState<QueueItem | null>(null)
  const [previewFor, setPreviewFor] = useState<QueueItem | null>(null)
  const [autoCheckFor, setAutoCheckFor] = useState<QueueItem | null>(null)
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

  const handleAutoCheck = async (id: string, threshold?: number | null) => {
    setBusyId(id)
    try {
      await api.post(
        `/submissions/${id}/auto-check`,
        threshold != null ? { threshold } : {},
      )
      toast({
        title: "Masuk antrian Turnitin",
        description: "Bot akan mengecek dokumen ini. Skor muncul beberapa menit lagi.",
      })
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
      subtitle="Cek dokumen mahasiswa ke Turnitin secara otomatis, lalu pantau skor & hasilnya di sini."
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
                  onAutoCheck={() => setAutoCheckFor(item)}
                  onAdjust={() => setAdjustFor(item)}
                  onPreview={() => setPreviewFor(item)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AdjustDialog
        item={adjustFor}
        onClose={() => setAdjustFor(null)}
        onDone={() => {
          setAdjustFor(null)
          void load()
        }}
      />

      <PreviewDialog item={previewFor} onClose={() => setPreviewFor(null)} />

      <AutoCheckDialog
        item={autoCheckFor}
        busy={!!autoCheckFor && busyId === autoCheckFor.id}
        onClose={() => setAutoCheckFor(null)}
        onConfirm={async (threshold) => {
          const target = autoCheckFor
          if (!target) return
          setAutoCheckFor(null)
          await handleAutoCheck(target.id, threshold)
        }}
      />
    </DashboardMainCard>
  )
}

function QueueRow({
  item,
  busy,
  onAutoCheck,
  onAdjust,
  onPreview,
}: {
  item: QueueItem
  busy: boolean
  onAutoCheck: () => void
  onAdjust: () => void
  onPreview: () => void
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
                <Icon className="size-3" />
                {meta.label}
              </Badge>
              {item.similarityScore != null && (
                <Badge variant="outline" className="border-primary/30">
                  {item.similarityScore.toFixed(1)}%
                </Badge>
              )}
              {item.integrityFlags != null && (
                <Badge
                  variant="outline"
                  title="Integrity Flags dari Turnitin"
                  className={`gap-1 ${
                    item.integrityFlags > 0
                      ? "border-rose-300 text-rose-700 dark:text-rose-300"
                      : "border-emerald-300 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {item.integrityFlags > 0 ? (
                    <ShieldAlert className="size-3" />
                  ) : (
                    <ShieldCheck className="size-3" />
                  )}
                  {item.integrityFlags} flag
                </Badge>
              )}
              {item.scoreAdjustedByName && item.turnitinRawScore != null && (
                <Badge
                  variant="outline"
                  className="border-amber-300 text-amber-700 line-through dark:text-amber-300"
                  title="Skor asli Turnitin"
                >
                  asli {item.turnitinRawScore.toFixed(1)}%
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
          {item.status === "PROCESSING" && (
              <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                <span>
                  Cek otomatis gagal: {item.autoCheckError}. Klik &quot;Cek Ulang&quot; untuk
                  menjalankan bot lagi.
                </span>
              </p>
            )}
            {item.scoreAdjustedByName && item.scoreAdjustmentReason && (
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <SlidersHorizontal className="mr-1 inline size-3" />
                Disesuaikan oleh {item.scoreAdjustedByName}: {item.scoreAdjustmentReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={onPreview} className="rounded-xl bg-primary/10 text-primary-dark hover:bg-primary/20">
            <Eye className="mr-2 size-4" /> Lihat
          </Button>

          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <a href={`/api/submissions/${item.id}/file`} target="_blank" rel="noreferrer">
              <Download className="mr-2 size-4" /> File
            </a>
          </Button>

          {item.status === "PENDING" && (
            <Button
              size="sm"
              onClick={onAutoCheck}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white"
            >
              {busy ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 size-4" />
              )}
              Cek Otomatis
            </Button>
          )}

          {item.status === "PROCESSING" && item.autoCheckError && (
            <Button
              size="sm"
              onClick={onAutoCheck}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white"
            >
              {busy ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 size-4" />
              )}
              Cek Ulang
            </Button>
          )}

          {item.status === "REVIEWED" && item.reportFileName && (
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <a href={`/api/submissions/${item.id}/report`} target="_blank" rel="noreferrer">
                <Download className="mr-2 size-4" /> Report
              </a>
            </Button>
          )}

          {(item.status === "REVIEWED" || item.status === "FLAGGED") && (
            <Button variant="outline" size="sm" onClick={onAdjust} className="rounded-xl">
              <SlidersHorizontal className="mr-2 size-4" /> Sesuaikan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AutoCheckDialog({
  item,
  busy,
  onClose,
  onConfirm,
}: {
  item: QueueItem | null
  busy: boolean
  onClose: () => void
  onConfirm: (threshold: number | null) => void
}) {
  const [value, setValue] = useState("")
  const rule = useMemo(() => (item ? pickRuleForItem(item) : null), [item])

  useEffect(() => {
    if (item) setValue("")
  }, [item])

  const submit = () => {
    const trimmed = value.trim()
    if (trimmed === "") {
      onConfirm(null)
      return
    }
    const n = Number(trimmed)
    if (!Number.isFinite(n) || n < 0 || n > 100) return
    onConfirm(n)
  }

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Cek Otomatis ke Turnitin</DialogTitle>
          <DialogDescription>
            {item ? `${item.documentTitle} — ${item.user.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="leading-relaxed">
              Bot akan mengunggah dokumen ke Turnitin lalu mengambil skor similarity.
              {rule ? (
                <>
                  {" "}
                  Batas prodi saat ini: <strong>{rule.label} ≤ {rule.maxPercentage}%</strong>.
                </>
              ) : null}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="threshold">Batas maksimal similarity untuk dokumen ini (%)</Label>
            <Input
              id="threshold"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                rule
                  ? `Kosongkan = pakai aturan prodi (${rule.maxPercentage}%)`
                  : "Kosongkan = pakai aturan prodi"
              }
              className="h-11 rounded-2xl"
            />
            <p className="text-xs text-muted-foreground">
              Jika diisi, batas ini menggantikan aturan prodi KHUSUS dokumen ini. Skor di
              atas batas → <strong>Perlu Revisi</strong>.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={busy}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" /> Mulai Cek Otomatis
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PreviewDialog({
  item,
  onClose,
}: {
  item: QueueItem | null
  onClose: () => void
}) {
  const [tab, setTab] = useState<"doc" | "report">("doc")
  const [doc, setDoc] = useState<{
    loading: boolean
    kind?: "pdf" | "html" | "unsupported"
    html?: string
    error?: string
  }>({ loading: false })

  const ext = (item?.fileName || "").toLowerCase().split(".").pop() || ""

  const loadPreview = useCallback(async () => {
    if (!item) return
    if (ext === "pdf") {
      setDoc({ loading: false, kind: "pdf" })
      return
    }
    if (ext !== "docx") {
      setDoc({ loading: false, kind: "unsupported" })
      return
    }
    setDoc({ loading: true })
    try {
      // Konversi DOCX bisa lama (dokumen besar / kompilasi route pertama) — beri
      // timeout longgar agar tidak keburu putus di 10 dtk default axios.
      const res = await api.get(`/submissions/${item.id}/preview`, { timeout: 60000 })
      setDoc({ loading: false, kind: res.data.kind, html: res.data.html })
    } catch (e) {
      const code = (e as { code?: string })?.code
      const serverMsg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      const msg =
        serverMsg ||
        (code === "ECONNABORTED"
          ? "Memuat dokumen terlalu lama. Coba lagi."
          : "Gagal memuat preview dokumen.")
      setDoc({ loading: false, error: msg })
    }
  }, [item, ext])

  useEffect(() => {
    if (!item) return
    setTab("doc")
    void loadPreview()
  }, [item, loadPreview])

  if (!item) return null
  const hasReport = !!item.reportFileName

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden rounded-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="truncate pr-8">{item.documentTitle}</DialogTitle>
          <DialogDescription>
            {item.user.name}
            {item.user.nim ? ` · NIM ${item.user.nim}` : ""}
            {item.similarityScore != null ? ` · Similarity ${item.similarityScore.toFixed(1)}%` : ""}
            {item.integrityFlags != null ? ` · ${item.integrityFlags} integrity flag` : ""}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "doc" | "report")} className="px-6 pb-6">
          <TabsList className="mb-4 rounded-full bg-muted p-1">
            <TabsTrigger value="doc" className="rounded-full">
              <FileText className="mr-2 size-4" /> Dokumen
            </TabsTrigger>
            <TabsTrigger value="report" className="rounded-full">
              <FileCheck2 className="mr-2 size-4" /> Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doc" className="mt-0">
            {doc.loading ? (
              <div className="grid h-[68vh] place-items-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : doc.kind === "pdf" ? (
              <iframe
                src={`/api/submissions/${item.id}/file?inline=1`}
                className="h-[68vh] w-full rounded-2xl border bg-white"
                title="Dokumen mahasiswa"
              />
            ) : doc.kind === "html" ? (
              <div
                className="docx-preview h-[68vh] overflow-auto rounded-2xl border bg-white p-8 dark:bg-gray-950"
                dangerouslySetInnerHTML={{ __html: doc.html || "" }}
              />
            ) : (
              <div className="grid h-[40vh] place-content-center justify-items-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center">
                <FileText className="size-10 text-muted-foreground/40" />
                <p className="max-w-md text-sm text-muted-foreground">
                  {doc.error || "Preview tidak tersedia untuk tipe file ini (mis. .doc lama). Silakan unduh."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {doc.error && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => void loadPreview()}
                    >
                      <RefreshCw className="mr-2 size-4" /> Coba lagi
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <a href={`/api/submissions/${item.id}/file`} target="_blank" rel="noreferrer">
                      <Download className="mr-2 size-4" /> Unduh file
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="report" className="mt-0">
            {hasReport ? (
              <iframe
                src={`/api/submissions/${item.id}/report?inline=1`}
                className="h-[68vh] w-full rounded-2xl border bg-white"
                title="Report Turnitin"
              />
            ) : (
              <div className="grid h-[40vh] place-content-center justify-items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center">
                <FileCheck2 className="size-10 text-muted-foreground/40" />
                <p className="font-medium">
                  {item.similarityScore != null
                    ? `Skor similarity: ${item.similarityScore.toFixed(1)}%`
                    : "Belum ada skor"}
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  PDF report Turnitin belum tersedia. Report akan terunduh otomatis saat
                  worker dijalankan mode headed (TURNITIN_HEADLESS=false).
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function AdjustDialog({
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
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const rule = useMemo(() => (item ? pickRuleForItem(item) : null), [item])
  const originalScore = item ? item.turnitinRawScore ?? item.similarityScore : null

  useEffect(() => {
    if (item) {
      setSimilarity(item.similarityScore != null ? String(item.similarityScore) : "")
      setStatus(item.status === "FLAGGED" ? "FLAGGED" : "REVIEWED")
      setReason("")
    }
  }, [item])

  const handleSubmit = async () => {
    if (!item) return
    const num = Number(similarity)
    if (!Number.isFinite(num) || num < 0 || num > 100) {
      toast({ variant: "destructive", title: "Skor harus 0-100" })
      return
    }
    if (reason.trim().length < 5) {
      toast({ variant: "destructive", title: "Alasan wajib (minimal 5 karakter)" })
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/submissions/${item.id}/adjust`, { similarity: num, status, reason })
      toast({ title: "Hasil disesuaikan", description: "Skor diperbarui dengan catatan audit." })
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
          <DialogTitle>Sesuaikan Hasil</DialogTitle>
          <DialogDescription>
            {item ? `${item.documentTitle} — ${item.user.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-900/40 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="leading-relaxed">
            Skor asli Turnitin{" "}
            <strong>{originalScore != null ? `${originalScore.toFixed(1)}%` : "—"}</strong>{" "}
            tetap disimpan & ditampilkan. Penyesuaian tercatat (siapa, kapan, alasan).
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="adj-sim">Skor Baru (%)</Label>
              <Input
                id="adj-sim"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={similarity}
                onChange={(e) => setSimilarity(e.target.value)}
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Keputusan</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "REVIEWED" | "FLAGGED")}>
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

          {rule && (
            <p className="text-xs text-muted-foreground">
              Aturan prodi: <strong>{rule.label}</strong> ≤ <strong>{rule.maxPercentage}%</strong>
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="adj-reason">Alasan Penyesuaian (wajib)</Label>
            <Textarea
              id="adj-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="contoh: daftar pustaka & kutipan ber-sitasi dikecualikan sesuai ketentuan fakultas"
              className="rounded-2xl"
            />
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
                <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <SlidersHorizontal className="mr-2 size-4" /> Simpan Penyesuaian
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
