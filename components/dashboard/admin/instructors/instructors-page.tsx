"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import {
  Shield,
  Search,
  Eye,
  Users,
  FileCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface InstructorRow {
  id: string
  name: string
  username: string
  email: string
  hp: string
  prodi: string
  createdAt: string
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

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/instructors")
      const data = await res.json()
      setInstructors(data.instructors || [])
      setFiltered(data.instructors || [])
    } catch {
      console.error("Gagal mengambil data instruktur")
    } finally {
      setIsLoading(false)
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
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Instruktur</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalInstructors} /></div>
                <p className="text-xs text-muted-foreground">Instruktur terdaftar</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Review</CardTitle>
                <FileCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalReviewed} /></div>
                <p className="text-xs text-muted-foreground">Dokumen sudah direview</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalPending} /></div>
                <p className="text-xs text-muted-foreground">Dokumen pending</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Review</CardTitle>
                <FileCheck className="h-4 w-4 text-blue-500" />
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

        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Daftar Instruktur</CardTitle>
            <CardDescription>Lihat dan kelola semua instruktur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
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
                  <Shield className="h-12 w-12 text-muted-foreground/40" />
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
                              <Avatar className="h-8 w-8">
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
                            <Badge variant="success">{inst.reviewedCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={inst.pendingCount > 0 ? "warning" : "secondary"}>{inst.pendingCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/admin/instructors/${inst.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardMainCard>
    </PageTransition>
  )
}

