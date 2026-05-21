"use client"

import React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { DataPagination } from "@/components/ui/data-pagination"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/api/client"
import {
  Shield,
  Search,
  Eye,
  Users,
  FileCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"

interface InstructorRow {
  id: string
  name: string
  username: string
  email: string
  hp: string
  prodi: string
  createdAt: string
  studentCount: number
  reviewedCount: number
  pendingCount: number
}

export function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorRow[]>([])
  const [filtered, setFiltered] = useState<InstructorRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const router = useRouter()
  const { toast } = useToast()

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<InstructorRow | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editHp, setEditHp] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [saving, setSaving] = useState(false)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<InstructorRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/admin/instructors")
      const data = res.data
      setInstructors(data.instructors || [])
      setFiltered(data.instructors || [])
    } catch {
      console.error("Gagal mengambil data instruktur")
    } finally {
      setIsLoading(false)
    }
  }

  const openEdit = (inst: InstructorRow) => {
    setEditData(inst)
    setEditName(inst.name)
    setEditEmail(inst.email === "-" ? "" : inst.email)
    setEditHp(inst.hp === "-" ? "" : inst.hp)
    setEditPassword("")
    setEditOpen(true)
  }

  const handleEdit = async () => {
    if (!editData) return
    setSaving(true)
    try {
      await api.put(`/admin/instructors/${editData.id}`, {
        name: editName,
        email: editEmail,
        hp: editHp,
        password: editPassword || undefined,
      })
      toast({ title: "Instruktur berhasil diperbarui" })
      setEditOpen(false)
      fetchInstructors()
    } catch {
      toast({ variant: "destructive", title: "Gagal memperbarui instruktur" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/admin/instructors/${deleteTarget.id}`)
      toast({ title: `Instruktur "${deleteTarget.name}" berhasil dihapus` })
      setDeleteOpen(false)
      fetchInstructors()
    } catch {
      toast({ variant: "destructive", title: "Gagal menghapus instruktur" })
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(instructors)
    } else {
      const q = search.toLowerCase()
      setFiltered(
        instructors.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.username.toLowerCase().includes(q) ||
            i.email.toLowerCase().includes(q) ||
            i.prodi.toLowerCase().includes(q)
        )
      )
    }
    setCurrentPage(1)
  }, [search, instructors])

  const totalInstructors = instructors.length
  const totalReviewed = instructors.reduce((a, i) => a + i.reviewedCount, 0)
  const totalPending = instructors.reduce((a, i) => a + i.pendingCount, 0)

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <PageTransition>
      <DashboardMainCard
        title="Manajemen Instruktur"
        subtitle="Kelola instruktur dan pantau aktivitas review 🛡️"
        icon={Shield}
      >
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Instruktur</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalInstructors} /></div>
                <p className="text-xs text-muted-foreground">Instruktur terdaftar</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Review</CardTitle>
                <FileCheck className="size-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalReviewed} /></div>
                <p className="text-xs text-muted-foreground">Dokumen sudah direview</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
                <Clock className="size-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalPending} /></div>
                <p className="text-xs text-muted-foreground">Dokumen pending</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border shadow-sm hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Review</CardTitle>
                <FileCheck className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={totalInstructors > 0 ? Math.round(totalReviewed / totalInstructors) : 0} />
                </div>
                <p className="text-xs text-muted-foreground">Per instruktur</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card className="rounded-3xl border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Instruktur</CardTitle>
              <CardDescription>Lihat dan kelola semua instruktur</CardDescription>
            </div>
            <Button onClick={() => router.push("/dashboard/admin/instructors/new")}>
              <Plus className="mr-2 size-4" />
              Tambah Instruktur
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, username, email, atau prodi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="rounded-md border overflow-x-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Shield className="size-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">Tidak Ada Instruktur</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {search ? "Tidak ada hasil yang cocok." : "Belum ada instruktur terdaftar."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instruktur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>No. HP</TableHead>
                      <TableHead>Prodi</TableHead>
                      <TableHead>Mahasiswa</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((inst) => {
                      const initials = inst.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      return (
                        <TableRow key={inst.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{inst.name}</p>
                                <p className="text-xs text-muted-foreground">{inst.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{inst.email}</TableCell>
                          <TableCell className="text-sm">{inst.hp}</TableCell>
                          <TableCell className="text-sm">{inst.prodi}</TableCell>
                          <TableCell>
                            <Badge variant={inst.studentCount > 0 ? "default" : "secondary"}>{inst.studentCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="success">{inst.reviewedCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={inst.pendingCount > 0 ? "warning" : "secondary"}>{inst.pendingCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                  <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/instructors/${inst.id}`)}>
                                    <Eye className="mr-2 size-4" />
                                    <span>Lihat Detail</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEdit(inst)}>
                                    <Pencil className="mr-2 size-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => { setDeleteTarget(inst); setDeleteOpen(true) }}
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    <span>Hapus</span>
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {totalPages > 1 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                showPageNumbers={false}
                className="pt-2"
              />
            )}
          </CardContent>
        </Card>
      </DashboardMainCard>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Instruktur</DialogTitle>
            <DialogDescription>Ubah data instruktur. Kosongkan password jika tidak ingin mengubah.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>No. HP / WhatsApp</Label>
              <Input value={editHp} onChange={(e) => setEditHp(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password Baru (opsional)</Label>
              <Input type="password" placeholder="Kosongkan jika tidak diubah" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Instruktur</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus instruktur <strong>{deleteTarget?.name}</strong>? Mahasiswa yang di-assign ke instruktur ini akan dilepas. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

