"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/components/ui/use-toast"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import api from "@/lib/api/client"

interface Submission {
  id: string
  title: string
  fileName: string | null
  examType: string | null
  chapter: string | null
  similarity: number
  status: string
  rawStatus: "PENDING" | "PROCESSING" | "REVIEWED" | "FLAGGED"
  hasFile: boolean
  hasReport: boolean
  rejectionReason: string | null
  version: number
  parentSubmissionId: string | null
  reviewedAt: string | null
  date: string
}

interface Rule {
  id: string
  ruleType: "PER_CHAPTER" | "PER_EXAM"
  label: string
  maxPercentage: number
}

const EXAM_LABELS: Record<string, string> = {
  PROPOSAL_DEFENSE: "Sidang Proposal",
  RESULTS_DEFENSE: "Sidang Hasil",
  FINAL_DEFENSE: "Sidang Tutup",
}

function StatusBadge({ status }: { status: Submission["rawStatus"] }) {
  const map = {
    PENDING: {
      icon: Clock,
      cls: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-900",
      label: "Menunggu Diproses",
    },
    PROCESSING: {
      icon: Loader2,
      cls: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-900",
      label: "Sedang Diperiksa",
    },
    REVIEWED: {
      icon: CheckCircle,
      cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-900",
      label: "Selesai",
    },
    FLAGGED: {
      icon: AlertTriangle,
      cls: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-900",
      label: "Perlu Revisi",
    },
  }[status]
  const Icon = map.icon
  return (
    <Badge variant="outline" className={`gap-1.5 border ${map.cls}`}>
      <Icon className={`size-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
      {map.label}
    </Badge>
  )
}

function SimilarityChip({ value }: { value: number }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>
  const tone =
    value < 15
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : value < 30
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {value.toFixed(1)}%
    </span>
  )
}

export default function StudentSubmissionsClient() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [ruleType, setRuleType] = useState<"PER_CHAPTER" | "PER_EXAM" | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("all")
  const [search, setSearch] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [resubmitFor, setResubmitFor] = useState<Submission | null>(null)
  const [detailFor, setDetailFor] = useState<Submission | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [a, b] = await Promise.all([
        api.get("/submissions"),
        api.get("/student/submissions/summary"),
      ])
      setSubmissions(a.data.submissions || [])
      setRules(b.data.rules || [])
      setRuleType(b.data.ruleType || null)
    } catch {
      toast({ variant: "destructive", title: "Gagal", description: "Tidak dapat memuat data." })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const t = search.toLowerCase()
      const matchSearch =
        !t || s.title.toLowerCase().includes(t) || (s.fileName || "").toLowerCase().includes(t)
      const matchTab =
        tab === "all" ||
        (tab === "active" && (s.rawStatus === "PENDING" || s.rawStatus === "PROCESSING")) ||
        (tab === "done" && s.rawStatus === "REVIEWED") ||
        (tab === "flagged" && s.rawStatus === "FLAGGED")
      return matchSearch && matchTab
    })
  }, [submissions, search, tab])

  const counts = useMemo(
    () => ({
      total: submissions.length,
      active: submissions.filter((s) => s.rawStatus === "PENDING" || s.rawStatus === "PROCESSING").length,
      done: submissions.filter((s) => s.rawStatus === "REVIEWED").length,
      flagged: submissions.filter((s) => s.rawStatus === "FLAGGED").length,
    }),
    [submissions],
  )

  // Untuk setiap rule prodi, cari submission terakhir yang relevan.
  // PER_CHAPTER → match rule.label dengan submission.chapter.
  // PER_EXAM    → match rule.label dengan submission.examType atau label-nya.
  const latestByRule = useMemo(() => {
    if (!ruleType || rules.length === 0) return []
    const ruleMatches = (r: Rule, s: Submission) => {
      if (ruleType === "PER_CHAPTER") {
        return !!s.chapter && r.label.toLowerCase() === s.chapter.toLowerCase()
      }
      if (!s.examType) return false
      const lbl = r.label.toLowerCase()
      return (
        lbl === s.examType.toLowerCase() ||
        lbl === (EXAM_LABELS[s.examType] ?? s.examType).toLowerCase()
      )
    }
    return rules.map((rule) => {
      const match =
        submissions.find((s) => ruleMatches(rule, s)) ?? null
      return { rule, latest: match }
    })
  }, [rules, ruleType, submissions])

  const handleUploaded = () => {
    setUploadOpen(false)
    setResubmitFor(null)
    void load()
  }

  return (
    <DashboardMainCard
      title="Pengiriman Dokumen"
      subtitle="Kirim draft Anda — instruktur akan memeriksanya di Turnitin dan mengembalikan hasil."
      icon={FileText}
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard label="Total" value={counts.total} icon={FileText} tone="default" />
        <StatCard label="Dalam Proses" value={counts.active} icon={Clock} tone="amber" />
        <StatCard label="Selesai" value={counts.done} icon={CheckCircle} tone="emerald" />
        <StatCard label="Perlu Revisi" value={counts.flagged} icon={AlertTriangle} tone="rose" />
      </div>

      {/* Rule banner */}
      {ruleType && rules.length > 0 && (
        <Card className="mb-6 rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-white">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Prodi Anda menggunakan pengecekan{" "}
                <span className="text-primary-dark">
                  {ruleType === "PER_CHAPTER" ? "per bab" : "per ujian"}
                </span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {rules.map((r) => (
                  <span
                    key={r.id}
                    className="rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-medium text-primary-dark dark:bg-white/5 dark:text-primary-lighter"
                  >
                    {r.label} <span className="text-muted-foreground">≤ {r.maxPercentage}%</span>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ringkasan per Bab/Ujian */}
      {latestByRule.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ringkasan {ruleType === "PER_CHAPTER" ? "per Bab" : "per Ujian"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latestByRule.map(({ rule, latest }) => (
              <RuleSummaryCard
                key={rule.id}
                rule={rule}
                latest={latest}
                onUpload={() => setUploadOpen(true)}
                onDetail={() => latest && setDetailFor(latest)}
                onResubmit={() => latest && setResubmitFor(latest)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau nama file..."
            className="h-10 rounded-2xl pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} className="rounded-2xl">
            <RefreshCw className="mr-2 size-4" /> Refresh
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl"
          >
            <Plus className="mr-2 size-4" /> Upload Baru
          </Button>
        </div>
      </div>

      {/* Tabs + list */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 w-full justify-start rounded-full bg-muted p-1 sm:w-auto">
          <TabsTrigger value="all" className="rounded-full">Semua ({counts.total})</TabsTrigger>
          <TabsTrigger value="active" className="rounded-full">Aktif ({counts.active})</TabsTrigger>
          <TabsTrigger value="done" className="rounded-full">Selesai ({counts.done})</TabsTrigger>
          <TabsTrigger value="flagged" className="rounded-full">Revisi ({counts.flagged})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          {loading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="rounded-3xl border-2 border-dashed">
              <CardContent className="grid place-items-center py-16 text-center">
                <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10">
                  <FileText className="size-7 text-primary" />
                </div>
                <p className="font-medium">Belum ada dokumen di kategori ini</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mulai dengan menekan tombol <strong>Upload Baru</strong> di atas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map((s) => (
                <SubmissionCard
                  key={s.id}
                  s={s}
                  onResubmit={() => setResubmitFor(s)}
                  onDetail={() => setDetailFor(s)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <UploadDialog
        open={uploadOpen || !!resubmitFor}
        onOpenChange={(v) => {
          if (!v) {
            setUploadOpen(false)
            setResubmitFor(null)
          }
        }}
        resubmitFor={resubmitFor}
        ruleType={ruleType}
        rules={rules}
        onUploaded={handleUploaded}
      />

      <DetailDialog
        submission={detailFor}
        onClose={() => setDetailFor(null)}
        onResubmit={(s) => {
          setDetailFor(null)
          setResubmitFor(s)
        }}
      />
    </DashboardMainCard>
  )
}

function RuleSummaryCard({
  rule,
  latest,
  onUpload,
  onDetail,
  onResubmit,
}: {
  rule: Rule
  latest: Submission | null
  onUpload: () => void
  onDetail: () => void
  onResubmit: () => void
}) {
  const status = latest?.rawStatus
  const tone =
    status === "REVIEWED"
      ? "border-emerald-300/70 dark:border-emerald-800"
      : status === "FLAGGED"
        ? "border-rose-300/70 dark:border-rose-800"
        : status === "PROCESSING" || status === "PENDING"
          ? "border-amber-300/70 dark:border-amber-800"
          : "border-dashed border-border/70 dark:border-white/10"

  return (
    <Card className={`rounded-3xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900/80 ${tone}`}>
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{rule.label}</p>
            <p className="text-xs text-muted-foreground">Batas ≤ {rule.maxPercentage}%</p>
          </div>
          {latest && <StatusBadge status={latest.rawStatus} />}
        </div>

        {latest ? (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{latest.title}</span>
            <SimilarityChip value={latest.similarity} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Belum ada pengiriman untuk kategori ini.</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {!latest && (
            <Button
              size="sm"
              onClick={onUpload}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white"
            >
              <Plus className="mr-1.5 size-3.5" /> Mulai Upload
            </Button>
          )}
          {latest && (
            <Button variant="outline" size="sm" onClick={onDetail} className="rounded-xl">
              <FileText className="mr-1.5 size-3.5" /> Detail
            </Button>
          )}
          {latest?.rawStatus === "FLAGGED" && (
            <Button
              size="sm"
              onClick={onResubmit}
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              <Upload className="mr-1.5 size-3.5" /> Resubmit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  tone: "default" | "amber" | "emerald" | "rose"
}) {
  const tones = {
    default: "from-primary/15 to-primary/5 text-primary-dark",
    amber: "from-amber-200/60 to-amber-100/30 text-amber-700 dark:text-amber-300",
    emerald: "from-emerald-200/60 to-emerald-100/30 text-emerald-700 dark:text-emerald-300",
    rose: "from-rose-200/60 to-rose-100/30 text-rose-700 dark:text-rose-300",
  }[tone]
  return (
    <Card className={`rounded-3xl border-2 border-white/60 bg-gradient-to-br ${tones} dark:border-white/10`}>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="grid size-12 place-items-center rounded-2xl bg-white/70 backdrop-blur dark:bg-white/10">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SubmissionCard({
  s,
  onResubmit,
  onDetail,
}: {
  s: Submission
  onResubmit: () => void
  onDetail: () => void
}) {
  return (
    <Card className="rounded-3xl border border-border/60 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-gray-900/80">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
            <FileText className="size-5 text-primary-dark" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">{s.title}</h3>
              {s.version > 1 && (
                <Badge variant="outline" className="border-primary/30 text-xs">
                  v{s.version}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{s.date}</span>
              {s.examType && <span>· {EXAM_LABELS[s.examType] ?? s.examType}</span>}
              {s.chapter && <span>· {s.chapter}</span>}
              {s.fileName && <span className="truncate">· {s.fileName}</span>}
            </div>
            {s.rejectionReason && (
              <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                <strong>Catatan instruktur:</strong> {s.rejectionReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SimilarityChip value={s.similarity} />
          <StatusBadge status={s.rawStatus} />
          <Button variant="outline" size="sm" onClick={onDetail} className="rounded-xl">
            <FileText className="mr-2 size-4" /> Detail
          </Button>
          {s.hasReport && (
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <a href={`/api/submissions/${s.id}/report`} target="_blank" rel="noreferrer">
                <Download className="mr-2 size-4" /> Report
              </a>
            </Button>
          )}
          {s.rawStatus === "FLAGGED" && (
            <Button
              size="sm"
              onClick={onResubmit}
              className="rounded-xl bg-rose-600 hover:bg-rose-700"
            >
              <Upload className="mr-2 size-4" /> Resubmit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function UploadDialog({
  open,
  onOpenChange,
  resubmitFor,
  ruleType,
  rules,
  onUploaded,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  resubmitFor: Submission | null
  ruleType: "PER_CHAPTER" | "PER_EXAM" | null
  rules: Rule[]
  onUploaded: () => void
}) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [examType, setExamType] = useState<string>("PROPOSAL_DEFENSE")
  const [chapter, setChapter] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (resubmitFor) {
        setTitle(resubmitFor.title)
        setExamType(resubmitFor.examType || "PROPOSAL_DEFENSE")
        setChapter(resubmitFor.chapter || "")
      } else {
        setTitle("")
        setExamType("PROPOSAL_DEFENSE")
        setChapter(ruleType === "PER_CHAPTER" && rules[0] ? rules[0].label : "")
      }
      setFile(null)
    }
  }, [open, resubmitFor, ruleType, rules])

  const chapterOptions = useMemo(() => {
    if (ruleType !== "PER_CHAPTER") return []
    return rules.map((r) => r.label)
  }, [ruleType, rules])

  const handleSubmit = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "File belum dipilih" })
      return
    }
    if (title.trim().length < 3) {
      toast({ variant: "destructive", title: "Judul minimal 3 karakter" })
      return
    }
    setSubmitting(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("documentTitle", title)
    if (examType) fd.append("examType", examType)
    if (chapter) fd.append("chapter", chapter)
    if (resubmitFor) fd.append("parentSubmissionId", resubmitFor.id)

    try {
      await api.post("/submissions/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast({ title: "Berhasil", description: "Dokumen Anda terkirim ke instruktur." })
      onUploaded()
    } catch (e) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Gagal mengirim dokumen."
      toast({ variant: "destructive", title: "Gagal", description: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {resubmitFor ? "Resubmit Dokumen" : "Upload Dokumen Baru"}
          </DialogTitle>
          <DialogDescription>
            {resubmitFor
              ? `Versi baru dari "${resubmitFor.title}". Pastikan revisi sudah dilakukan.`
              : "Instruktur Anda akan melihat dokumen ini di antrian mereka."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Dokumen</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Skripsi - BAB 1 Pendahuluan"
              className="h-11 rounded-2xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Jenis Ujian</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger className="h-11 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROPOSAL_DEFENSE">Sidang Proposal</SelectItem>
                  <SelectItem value="RESULTS_DEFENSE">Sidang Hasil</SelectItem>
                  <SelectItem value="FINAL_DEFENSE">Sidang Tutup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {ruleType === "PER_CHAPTER" && (
              <div className="space-y-1.5">
                <Label>Bab</Label>
                <Select value={chapter} onValueChange={setChapter}>
                  <SelectTrigger className="h-11 rounded-2xl">
                    <SelectValue placeholder="Pilih bab" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapterOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="file">File Dokumen</Label>
            <label
              htmlFor="file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "Klik untuk pilih file (PDF / DOCX)"}
              </p>
              <p className="text-xs text-muted-foreground">Maks. 20 MB</p>
              <input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
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
                <Upload className="mr-2 size-4" /> Kirim
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DetailDialog({
  submission,
  onClose,
  onResubmit,
}: {
  submission: Submission | null
  onClose: () => void
  onResubmit: (s: Submission) => void
}) {
  if (!submission) return null
  const s = submission
  return (
    <Dialog open={!!submission} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{s.title}</span>
            {s.version > 1 && (
              <Badge variant="outline" className="border-primary/30 text-xs">
                v{s.version}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Detail pengiriman dokumen Anda.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-3">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={s.rawStatus} />
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-3">
            <span className="text-muted-foreground">Skor Similarity</span>
            <SimilarityChip value={s.similarity} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Jenis Ujian</p>
              <p className="mt-1 font-medium">
                {s.examType ? EXAM_LABELS[s.examType] ?? s.examType : "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Bab</p>
              <p className="mt-1 font-medium">{s.chapter || "—"}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Dikirim</p>
            <p className="mt-1 font-medium">{s.date}</p>
            {s.reviewedAt && (
              <>
                <p className="mt-2 text-xs text-muted-foreground">Direview</p>
                <p className="mt-1 font-medium">
                  {new Date(s.reviewedAt).toLocaleString("id-ID")}
                </p>
              </>
            )}
          </div>
          {s.fileName && (
            <div className="rounded-2xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">File Dokumen</p>
              <p className="mt-1 truncate font-medium">{s.fileName}</p>
            </div>
          )}
          {s.rejectionReason && (
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              <p className="text-xs font-semibold uppercase tracking-wider">
                Catatan Instruktur
              </p>
              <p className="mt-1">{s.rejectionReason}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:gap-2">
          {s.hasFile && (
            <Button asChild variant="outline" className="rounded-2xl">
              <a href={`/api/submissions/${s.id}/file`} target="_blank" rel="noreferrer">
                <Download className="mr-2 size-4" /> Dokumen
              </a>
            </Button>
          )}
          {s.hasReport && (
            <Button asChild variant="outline" className="rounded-2xl">
              <a href={`/api/submissions/${s.id}/report`} target="_blank" rel="noreferrer">
                <Download className="mr-2 size-4" /> Report
              </a>
            </Button>
          )}
          {s.rawStatus === "FLAGGED" && (
            <Button
              onClick={() => onResubmit(s)}
              className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
            >
              <Upload className="mr-2 size-4" /> Resubmit
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
