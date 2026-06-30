"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { DataPagination } from "@/components/ui/data-pagination"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/api/client"
import {
  Users,
  Search,
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Loader2,
} from "lucide-react"

interface StudentRow {
  id: string
  name: string
  nim: string
  email: string | null
  prodi: string
  hasCompletedPayment: boolean
  accountStatus?: "ACTIVE" | "INACTIVE" | "GRADUATED"
  graduatedAt?: string | null
  createdAt: string
  examDetail: {
    thesisTitle: string
    examType: string
    approvalStatus: string
  } | null
  instructorId: string | null
  instructorName: string | null
  submissionsCount: number
  reviewedCount: number
  flaggedCount: number
  avgSimilarity: number
  paymentStatus: string
}

interface InstructorOption {
  id: string
  name: string
  studentCount: number
}

interface StudentSummary {
  totalStudents: number
  totalSubmissions: number
  totalReviewed: number
  totalFlagged: number
  paidCount: number
  graduatedCount: number
}

const EMPTY_SUMMARY: StudentSummary = {
  totalStudents: 0,
  totalSubmissions: 0,
  totalReviewed: 0,
  totalFlagged: 0,
  paidCount: 0,
  graduatedCount: 0,
}

const ITEMS_PER_PAGE = 10

export function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [summary, setSummary] = useState<StudentSummary>(EMPTY_SUMMARY)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("") // debounced; dikirim ke server
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<StudentRow | null>(null)
  const [selectedInstructor, setSelectedInstructor] = useState<string>("")
  const [instructors, setInstructors] = useState<InstructorOption[]>([])
  const [assigning, setAssigning] = useState(false)

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      })
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const res = await api.get(`/admin/students?${params.toString()}`)
      const data = res.data
      setStudents(data.students || [])
      if (data.summary) setSummary(data.summary)
      setTotal(data.pagination?.total ?? (data.students?.length || 0))
      setTotalPages(data.pagination?.totalPages ?? 1)
    } catch {
      console.error("Gagal mengambil data mahasiswa")
      setStudents([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, search, statusFilter])

  // Debounce input pencarian → reset ke halaman 1 (pencarian dilakukan server-side).
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setCurrentPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  // Ambil ulang data tiap halaman / kata kunci / filter berubah.
  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const openAssign = async (student: StudentRow) => {
    setAssignTarget(student)
    setSelectedInstructor(student.instructorId || "")
    setAssignOpen(true)
    try {
      const res = await api.get("/admin/instructors")
      setInstructors(
        (res.data.instructors || []).map((i: { id: string; name: string; studentCount?: number }) => ({
          id: i.id,
          name: i.name,
          studentCount: i.studentCount || 0,
        }))
      )
    } catch {
      setInstructors([])
    }
  }

  const handleAssign = async () => {
    if (!assignTarget) return
    setAssigning(true)
    try {
      const instructorId = selectedInstructor === "__none__" ? null : (selectedInstructor || null)
      const res = await api.put(`/admin/students/${assignTarget.id}`, { instructorId })
      toast({ title: res.data.message })
      setAssignOpen(false)
      fetchStudents()
    } catch {
      toast({ variant: "destructive", title: "Gagal mengubah instruktur" })
    } finally {
      setAssigning(false)
    }
  }

  const { totalStudents, totalSubmissions, totalReviewed, totalFlagged, paidCount } = summary

  const examTypeLabel = (type: string) => {
    switch (type) {
      case "PROPOSAL_DEFENSE": return "Proposal"
      case "RESULTS_DEFENSE": return "Hasil"
      case "FINAL_DEFENSE": return "Tutup"
      default: return type
    }
  }

  const approvalBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge variant="success">Disetujui</Badge>
      case "REJECTED": return <Badge variant="destructive">Ditolak</Badge>
      case "PENDING": return <Badge variant="secondary">Menunggu</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <PageTransition>
      <DashboardMainCard
        title="Manajemen Mahasiswa"
        subtitle="Kelola dan pantau akun mahasiswa, pengajuan, dan pembayaran 🎓"
        icon={Users}
      >
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalStudents} /></div>
                <p className="text-xs text-muted-foreground">Mahasiswa terdaftar</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Pengajuan</CardTitle>
                <FileText className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalSubmissions} /></div>
                <p className="text-xs text-muted-foreground">Dokumen diajukan</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Direview</CardTitle>
                <CheckCircle className="size-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalReviewed} /></div>
                <p className="text-xs text-muted-foreground">Sudah direview</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ditandai</CardTitle>
                <AlertTriangle className="size-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalFlagged} /></div>
                <p className="text-xs text-muted-foreground">Perlu perhatian</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sudah Bayar</CardTitle>
                <CheckCircle className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={paidCount} /></div>
                <p className="text-xs text-muted-foreground">dari {totalStudents} mahasiswa</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card className="rounded-3xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Database Mahasiswa</CardTitle>
            <CardDescription>Lihat dan kelola semua data mahasiswa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NIM, prodi, atau email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9 w-full sm:w-[180px]">
                  <SelectValue placeholder="Status akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="GRADUATED">Lulus</SelectItem>
                  <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Users className="size-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">Tidak Ada Mahasiswa</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {search ? "Tidak ada hasil yang cocok." : "Belum ada mahasiswa terdaftar."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Prodi</TableHead>
                      <TableHead>Ujian</TableHead>
                      <TableHead>Pengajuan</TableHead>
                      <TableHead>Rata-rata Similarity</TableHead>
                      <TableHead>Instruktur</TableHead>
                      <TableHead>Pembayaran</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.nim}</TableCell>
                        <TableCell>{s.prodi}</TableCell>
                        <TableCell>
                          {s.examDetail ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs">{examTypeLabel(s.examDetail.examType)}</span>
                              {approvalBadge(s.examDetail.approvalStatus)}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{s.submissionsCount}</span>
                          {s.flaggedCount > 0 && (
                            <span className="ml-1 text-xs text-orange-500">({s.flaggedCount} ditandai)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.avgSimilarity > 30 ? "destructive" : s.avgSimilarity > 20 ? "warning" : "success"}>
                            {s.avgSimilarity}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.instructorName ? (
                            <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => openAssign(s)}>
                              {s.instructorName}
                            </Badge>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => openAssign(s)}>
                              <UserPlus className="mr-1 size-3" />
                              Assign
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.hasCompletedPayment ? "success" : "secondary"}>
                            {s.hasCompletedPayment ? "Lunas" : "Belum"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.accountStatus === "GRADUATED" ? (
                            <Badge variant="success">🎓 Lulus</Badge>
                          ) : s.accountStatus === "INACTIVE" ? (
                            <Badge variant="secondary">Nonaktif</Badge>
                          ) : (
                            <Badge variant="outline">Aktif</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/admin/students/${s.id}`)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {totalPages > 1 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                showPageNumbers={false}
                className="pt-2"
              />
            )}
          </CardContent>
        </Card>
      </DashboardMainCard>

      {/* Assign Instructor Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Instruktur</DialogTitle>
            <DialogDescription>
              Pilih instruktur untuk mahasiswa <strong>{assignTarget?.name}</strong> ({assignTarget?.nim})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Instruktur</Label>
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih instruktur..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Tidak ada (Lepas) —</SelectItem>
                  {instructors.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name} ({inst.studentCount} mahasiswa)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Batal</Button>
            <Button onClick={handleAssign} disabled={assigning}>
              {assigning ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

