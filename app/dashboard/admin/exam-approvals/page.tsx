"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api/client"

interface ExamDetailData {
  id: string
  userId: string
  thesisTitle: string
  examType: string
  approvalStatus: string
  submittedAt: string
  reviewedAt: string | null
  user: {
    id: string
    name: string
    username: string
    email: string | null
    nim: string | null
    prodi: string | null
  }
}

export default function ExamApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [examDetails, setExamDetails] = useState<ExamDetailData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchExamDetails = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)

      const res = await api.get(`/admin/exam-approvals?${params}`)
      const data = res.data
      setExamDetails(data.examDetails || [])
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal memuat data",
        description: "Tidak dapat mengambil data persetujuan akun.",
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    fetchExamDetails()
  }, [fetchExamDetails])

  const filteredExamDetails = examDetails.filter(
    (detail) =>
      detail.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (detail.user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (detail.user.nim || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      detail.thesisTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatExamType = (examType: string) => {
    switch (examType) {
      case "PROPOSAL_DEFENSE":
        return "Sidang Proposal"
      case "RESULTS_DEFENSE":
        return "Sidang Hasil"
      case "FINAL_DEFENSE":
        return "Sidang Akhir"
      default:
        return examType
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString))
  }

  const handleUpdateApproval = async (userId: string, approvalStatus: "APPROVED" | "REJECTED") => {
    setUpdating(userId)
    try {
      await api.post("/admin/update-exam-approval", { userId, approvalStatus })

      toast({
        title: `Akun berhasil ${approvalStatus === "APPROVED" ? "disetujui" : "ditolak"}`,
        description: "Status persetujuan akun telah diperbarui.",
      })

      await fetchExamDetails()
    } catch {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal memperbarui status persetujuan. Silakan coba lagi.",
      })
    } finally {
      setUpdating(null)
    }
  }

  return (
    <DashboardMainCard title="Persetujuan Akun" subtitle="Kelola dan verifikasi akun mahasiswa yang mendaftar untuk Turnitin ✅" icon={CheckCircle}>
      <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Pendaftaran Akun Turnitin</CardTitle>
          <CardDescription>Verifikasi dan setujui akun mahasiswa yang baru mendaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama, NIM, atau judul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahasiswa</TableHead>
                    <TableHead>Judul Skripsi</TableHead>
                    <TableHead>Jenis Ujian</TableHead>
                    <TableHead className="hidden md:table-cell">Tanggal Pengajuan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExamDetails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Tidak ada data pengajuan akun
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExamDetails.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>
                          <div className="font-medium">{detail.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {detail.user.nim || detail.user.username}
                            {detail.user.prodi && ` · ${detail.user.prodi}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={detail.thesisTitle}>
                            {detail.thesisTitle}
                          </div>
                        </TableCell>
                        <TableCell>{formatExamType(detail.examType)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(detail.submittedAt)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              detail.approvalStatus === "APPROVED"
                                ? "default"
                                : detail.approvalStatus === "REJECTED"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={detail.approvalStatus === "APPROVED" ? "bg-green-500" : ""}
                          >
                            {detail.approvalStatus === "APPROVED"
                              ? "Disetujui"
                              : detail.approvalStatus === "REJECTED"
                                ? "Ditolak"
                                : "Menunggu"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {detail.approvalStatus === "PENDING" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={updating === detail.userId}>
                                  {updating === detail.userId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateApproval(detail.userId, "APPROVED")}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  <span>Setujui</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateApproval(detail.userId, "REJECTED")}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  <span>Tolak</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
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
    </DashboardMainCard>
  )
}

