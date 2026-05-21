"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api/client"

interface PaymentData {
  id: string
  userId: string
  amount: number
  status: string
  jenisPembayaran: string | null
  periode: string | null
  paidAt: string | null
  createdAt: string
  user: {
    id: string
    name: string
    username: string
    email: string | null
    nim: string | null
  }
}

const statusLabels: Record<string, string> = {
  COMPLETED: "Lunas",
  PENDING: "Menunggu",
  PROCESSING: "Diproses",
  FAILED: "Gagal",
}

const jenisLabels: Record<string, string> = {
  "TURNITIN DIPLOMA S1": "S1",
  "TURNITIN DIPLOMA S2": "S2",
  "TURNITIN DIPLOMA S3": "S3",
  "PERPUSTAKAAN": "Perpustakaan",
}

export function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jenisFilter, setJenisFilter] = useState("all")
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (jenisFilter !== "all") params.set("jenis", jenisFilter)
    if (searchQuery) params.set("search", searchQuery)

    api.get(`/admin/payments?${params}`)
      .then(res => { setPayments(res.data.payments || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter, jenisFilter, searchQuery])

  return (
    <Card className="rounded-3xl border border-border shadow-sm">
      <CardHeader>
        <div>
          <CardTitle>Transaksi Pembayaran</CardTitle>
          <CardDescription>Pantau dan kelola transaksi pembayaran mahasiswa</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-2 flex-1">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama atau NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          <Select value={jenisFilter} onValueChange={setJenisFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="S1">S1</SelectItem>
              <SelectItem value="S2">S2</SelectItem>
              <SelectItem value="S3">S3</SelectItem>
              <SelectItem value="PERPUSTAKAAN">Perpustakaan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="completed">Lunas</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="failed">Gagal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahasiswa</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead className="hidden md:table-cell">Periode</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Tidak ada data pembayaran
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="font-medium">{payment.user.name}</div>
                        <div className="text-sm text-muted-foreground">{payment.user.nim || payment.user.username}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.jenisPembayaran
                            ? (jenisLabels[payment.jenisPembayaran] || payment.jenisPembayaran)
                            : "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>Rp {payment.amount.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {payment.periode || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(payment.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "COMPLETED"
                              ? "default"
                              : payment.status === "PENDING"
                                ? "secondary"
                                : payment.status === "FAILED"
                                  ? "destructive"
                                  : "secondary"
                          }
                          className={payment.status === "COMPLETED" ? "bg-green-500" : ""}
                        >
                          {statusLabels[payment.status] || payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
