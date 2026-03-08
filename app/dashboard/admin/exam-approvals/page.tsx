"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, CheckCircle, XCircle, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

export default function ExamApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Mock exam details data
  const examDetails = [
    {
      id: "ED-001",
      userId: "user-1",
      studentName: "Alex Johnson",
      email: "alex.johnson@example.com",
      thesisTitle: "Implementasi Deep Learning untuk Deteksi Plagiarisme pada Dokumen Akademik",
      examType: "proposal_defense",
      submittedAt: "2023-04-10T10:00:00Z",
      approvalStatus: "pending",
    },
    {
      id: "ED-002",
      userId: "user-4",
      studentName: "Emma Williams",
      email: "emma.williams@example.com",
      thesisTitle: "Analisis Perbandingan Algoritma Pendeteksi Kemiripan Teks pada Sistem Anti-Plagiarisme",
      examType: "results_defense",
      submittedAt: "2023-04-08T14:30:00Z",
      approvalStatus: "approved",
    },
    {
      id: "ED-003",
      userId: "user-5",
      studentName: "Michael Brown",
      email: "michael.brown@example.com",
      thesisTitle: "Pengembangan Sistem Pendeteksi Plagiarisme Berbasis Web dengan Pendekatan Hybrid",
      examType: "final_defense",
      submittedAt: "2023-04-05T09:15:00Z",
      approvalStatus: "rejected",
    },
  ]

  const filteredExamDetails = examDetails.filter(
    (detail) =>
      detail.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detail.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detail.thesisTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Format the exam type for display
  const formatExamType = (examType: string) => {
    switch (examType) {
      case "proposal_defense":
        return "Sidang Proposal"
      case "results_defense":
        return "Sidang Hasil"
      case "final_defense":
        return "Sidang Akhir"
      default:
        return examType
    }
  }

  // Format the submission date
  const formatSubmissionDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Handle approval/rejection
  const handleUpdateApproval = async (userId: string, approvalStatus: "approved" | "rejected") => {
    try {
      // In a real app, this would be an API call
      await axios.post("/api/admin/update-exam-approval", {
        userId,
        approvalStatus,
      })

      toast({
        title: `Detail ujian berhasil ${approvalStatus === "approved" ? "disetujui" : "ditolak"}`,
        description: `Notifikasi telah dikirim ke mahasiswa.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal memperbarui status persetujuan. Silakan coba lagi.",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Persetujuan Detail Ujian</h1>
        <p className="text-muted-foreground">Kelola dan verifikasi detail ujian mahasiswa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Ujian Mahasiswa</CardTitle>
          <CardDescription>Verifikasi dan setujui detail ujian yang diajukan oleh mahasiswa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, email, atau judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
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
                {filteredExamDetails.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <div className="font-medium">{detail.studentName}</div>
                      <div className="text-sm text-muted-foreground">{detail.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={detail.thesisTitle}>
                        {detail.thesisTitle}
                      </div>
                    </TableCell>
                    <TableCell>{formatExamType(detail.examType)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatSubmissionDate(detail.submittedAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          detail.approvalStatus === "approved"
                            ? "default"
                            : detail.approvalStatus === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {detail.approvalStatus === "approved"
                          ? "Disetujui"
                          : detail.approvalStatus === "rejected"
                            ? "Ditolak"
                            : "Menunggu"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Lihat Detail</span>
                          </DropdownMenuItem>
                          {detail.approvalStatus === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleUpdateApproval(detail.userId, "approved")}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>Setujui</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateApproval(detail.userId, "rejected")}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span>Tolak</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

