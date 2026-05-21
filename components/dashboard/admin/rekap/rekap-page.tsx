"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Archive, Download, FileBarChart, Loader2, Users, Wallet } from "lucide-react"
import api from "@/lib/api/client"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

type RekapItem = {
  id: string
  no: number
  nama: string
  nim: string
  judulSkripsi: string
  jurusan: string
  tahapLabel: string
  similarityScore: number | null
  status: string
  biaya: number
  instruktur: string
  tanggalPembayaran: string | null
  namaBank: string
  degree: "S1" | "S2" | "S3"
}

type InstructorRekap = {
  instruktur: string
  totalS1: number
  totalS2: number
  totalS3: number
  jumlah: number
  total: number
}

type RekapResponse = {
  periode: { month: number; year: number; label: string }
  items: RekapItem[]
  rekap: InstructorRekap[]
  totals: { biaya: number; count: number }
  filters: {
    studyPrograms: { id: string; name: string; degree: string }[]
    instructors: { id: string; name: string }[]
  }
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

const formatDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso))
    : "-"

export function RekapPage() {
  const now = new Date()
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [year, setYear] = useState<number>(now.getFullYear())
  const [studyProgramId, setStudyProgramId] = useState<string>("all")
  const [instructorId, setInstructorId] = useState<string>("all")
  const [data, setData] = useState<RekapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    p.set("month", String(month))
    p.set("year", String(year))
    if (studyProgramId !== "all") p.set("studyProgramId", studyProgramId)
    if (instructorId !== "all") p.set("instructorId", instructorId)
    return p.toString()
  }, [month, year, studyProgramId, instructorId])

  useEffect(() => {
    setLoading(true)
    api
      .get(`/admin/rekap?${queryString}`)
      .then((res) => setData(res.data as RekapResponse))
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Gagal memuat rekap",
          description: err?.response?.data?.message || "Terjadi kesalahan.",
        })
      })
      .finally(() => setLoading(false))
  }, [queryString, toast])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get(`/admin/rekap/export?${queryString}`, { responseType: "blob" })
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rekap-turnitin-${year}-${String(month).padStart(2, "0")}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengekspor."
      toast({ variant: "destructive", title: "Gagal mengekspor", description: message })
    } finally {
      setExporting(false)
    }
  }

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = now.getFullYear() + 1; y >= now.getFullYear() - 5; y--) arr.push(y)
    return arr
  }, [now])

  return (
    <>
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="size-5 text-primary" />
            Filter Periode
          </CardTitle>
          <CardDescription>Pilih bulan, tahun, prodi, atau instruktur untuk menyaring rekap.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Bulan</label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tahun</label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Program Studi</label>
              <Select value={studyProgramId} onValueChange={setStudyProgramId}>
                <SelectTrigger><SelectValue placeholder="Semua prodi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua prodi</SelectItem>
                  {data?.filters.studyPrograms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.degree})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Instruktur</label>
              <Select value={instructorId} onValueChange={setInstructorId}>
                <SelectTrigger><SelectValue placeholder="Semua instruktur" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua instruktur</SelectItem>
                  {data?.filters.instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<Users className="size-5 text-primary" />}
          label="Pengecekan"
          value={loading ? "…" : String(data?.totals.count ?? 0)}
          sub={`Periode ${data?.periode.label ?? "-"}`}
        />
        <SummaryCard
          icon={<Wallet className="size-5 text-emerald-600" />}
          label="Total Biaya"
          value={loading ? "…" : formatRp(data?.totals.biaya ?? 0)}
          sub="Akumulasi pembayaran"
        />
        <Card className="rounded-3xl">
          <CardContent className="flex h-full items-center justify-between gap-3 p-6 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">Export ke Excel</p>
              <p className="text-base font-semibold">Template Turnitin</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleExport} disabled={exporting || loading} className="rounded-2xl">
                {exporting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
                Unduh .xlsx
              </Button>
              <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                <Link href="/dashboard/admin/rekap/history">
                  <Archive className="mr-1 size-3" /> Lihat riwayat arsip
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Daftar Hasil Plagiat ({data?.periode.label ?? "-"})</CardTitle>
          <CardDescription>Mahasiswa yang sudah diperiksa oleh instruktur pada periode terpilih.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No.</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Jurusan</TableHead>
                  <TableHead>Tahap</TableHead>
                  <TableHead className="text-right">Skor</TableHead>
                  <TableHead className="text-right">Biaya</TableHead>
                  <TableHead>Instruktur</TableHead>
                  <TableHead>Tgl. Pembayaran</TableHead>
                  <TableHead>Bank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (data?.items.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                      Belum ada data untuk periode ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  data!.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>{it.no}</TableCell>
                      <TableCell className="font-medium">{it.nama}</TableCell>
                      <TableCell className="font-mono text-xs">{it.nim}</TableCell>
                      <TableCell className="max-w-[240px] truncate" title={it.judulSkripsi}>{it.judulSkripsi}</TableCell>
                      <TableCell>{it.jurusan}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{it.tahapLabel} · {it.degree}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {it.similarityScore != null ? `${Math.round(it.similarityScore)}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatRp(it.biaya)}</TableCell>
                      <TableCell>{it.instruktur}</TableCell>
                      <TableCell>{formatDate(it.tanggalPembayaran)}</TableCell>
                      <TableCell>{it.namaBank}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Rekap per Instruktur</CardTitle>
          <CardDescription>Jumlah pengecekan dan honor per instruktur pada periode terpilih.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No.</TableHead>
                  <TableHead>Instruktur</TableHead>
                  <TableHead className="text-right">S1 (Rp50.000)</TableHead>
                  <TableHead className="text-right">S2 (Rp75.000)</TableHead>
                  <TableHead className="text-right">S3 (Rp100.000)</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (data?.rekap.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Belum ada instruktur yang memeriksa pada periode ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  data!.rekap.map((r, i) => (
                    <TableRow key={r.instruktur}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{r.instruktur}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.totalS1}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.totalS2}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.totalS3}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.jumlah}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{formatRp(r.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function SummaryCard({
  icon, label, value, sub,
}: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-primary/10">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
