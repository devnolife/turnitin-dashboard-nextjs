"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Archive, Download, Trash2, Loader2, FileSpreadsheet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import api from "@/lib/api/client"
import { useToast } from "@/components/ui/use-toast"

type Archive = {
  id: string
  periodeMonth: number
  periodeYear: number
  periodeLabel: string
  filterSummary: string | null
  fileName: string
  fileSize: number
  totalItems: number
  totalAmount: number
  generatedByName: string | null
  createdAt: string
}

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))

export function AdminRekapHistoryPage() {
  const { toast } = useToast()
  const [archives, setArchives] = useState<Archive[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const fetchArchives = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/admin/rekap/archives")
      setArchives(res.data?.archives || [])
    } catch {
      toast({ title: "Gagal memuat arsip", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchArchives()
  }, [fetchArchives])

  const handleDownload = async (archive: Archive) => {
    setDownloadingId(archive.id)
    try {
      const res = await api.get(`/admin/rekap/archives/${archive.id}/download`, {
        responseType: "blob",
      })
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = archive.fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: "Gagal mengunduh arsip", variant: "destructive" })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await api.delete(`/admin/rekap/archives/${id}`)
      setArchives((prev) => prev.filter((a) => a.id !== id))
      toast({ title: "Arsip dihapus" })
    } catch {
      toast({ title: "Gagal menghapus arsip", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardMainCard
      title="Riwayat Rekap Plagiasi"
      subtitle="Arsip seluruh rekap yang pernah diekspor 📚"
      icon={Archive}
    >
      <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin/rekap">
            <ArrowLeft className="mr-2 size-4" /> Kembali ke Rekap
          </Link>
        </Button>
        <Badge variant="secondary">{archives.length} arsip</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Arsip</CardTitle>
          <CardDescription>
            Setiap kali tombol <span className="font-medium">Ekspor Excel</span> di halaman Rekap ditekan, file
            yang dihasilkan otomatis disimpan di sini untuk audit trail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : archives.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <FileSpreadsheet className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Belum ada arsip</p>
                <p className="text-sm text-muted-foreground">
                  Arsip akan terisi otomatis saat Anda menekan tombol Ekspor di halaman Rekap.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/dashboard/admin/rekap">Buka Halaman Rekap</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Filter</TableHead>
                    <TableHead className="text-center">Jumlah</TableHead>
                    <TableHead className="text-right">Total Biaya</TableHead>
                    <TableHead>Dibuat oleh</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archives.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="font-medium">{a.periodeLabel}</div>
                        <div className="text-xs text-muted-foreground">{formatBytes(a.fileSize)}</div>
                      </TableCell>
                      <TableCell className="max-w-[260px] text-xs text-muted-foreground">
                        {a.filterSummary || "—"}
                      </TableCell>
                      <TableCell className="text-center">{a.totalItems}</TableCell>
                      <TableCell className="text-right">{formatRupiah(a.totalAmount)}</TableCell>
                      <TableCell className="text-sm">{a.generatedByName || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(a.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(a)}
                            disabled={downloadingId === a.id}
                          >
                            {downloadingId === a.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Download className="size-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                disabled={deletingId === a.id}
                              >
                                {deletingId === a.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus arsip ini?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Arsip <span className="font-medium">{a.fileName}</span> akan dihapus
                                  permanen. Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(a.id)}
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardMainCard>
  )
}
