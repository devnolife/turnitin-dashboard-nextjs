"use client"

import React from "react"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, GraduationCap, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useFacultyStore, type Faculty } from "@/lib/store/faculty-store"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"

export function AdminFacultiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFaculties, setFilteredFaculties] = useState<Faculty[]>([])

  const { faculties, isLoading, fetchFaculties } = useFacultyStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchFaculties()
  }, [fetchFaculties])

  // Filter faculties based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFaculties(faculties)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = faculties.filter(
      (faculty) =>
        faculty.name.toLowerCase().includes(query) ||
        faculty.code.toLowerCase().includes(query) ||
        faculty.programs.some((program) => program.name.toLowerCase().includes(query)),
    )

    setFilteredFaculties(filtered)
  }, [searchQuery, faculties])

  // Format degree for display
  const formatDegree = (degree: string) => {
    switch (degree) {
      case "bachelor":
        return "S1"
      case "master":
        return "S2"
      case "doctoral":
        return "S3"
      default:
        return degree
    }
  }

  // Get badge variant based on degree
  const getDegreeBadgeVariant = (degree: string) => {
    switch (degree) {
      case "bachelor":
        return "outline"
      case "master":
        return "secondary"
      case "doctoral":
        return "default"
      default:
        return "outline"
    }
  }

  // Calculate total students and programs
  const totalStudents = faculties.reduce((acc, faculty) => acc + faculty.students, 0)
  const totalPrograms = faculties.reduce((acc, faculty) => acc + faculty.programs.length, 0)

  return (
    <PageTransition>
      <DashboardMainCard title="Manajemen Fakultas" subtitle="Kelola fakultas dan program studi 🏛️" icon={GraduationCap}>
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Fakultas</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={faculties.length} />
                </div>
                <p className="text-xs text-muted-foreground">Fakultas akademik</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Program Studi</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={totalPrograms} />
                </div>
                <p className="text-xs text-muted-foreground">Di seluruh fakultas</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={totalStudents} />
                </div>
                <p className="text-xs text-muted-foreground">Mahasiswa terdaftar</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata per Fakultas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={Math.round(totalStudents / faculties.length)} />
                </div>
                <p className="text-xs text-muted-foreground">Mahasiswa per fakultas</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Fakultas</CardTitle>
              <CardDescription>Kelola fakultas dan program studi</CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Fakultas
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari fakultas dan program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="rounded-md border overflow-x-auto">
              {isLoading ? (
                <div className="p-4">
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <div className="space-y-2 pl-6">
                            {Array(3)
                              .fill(0)
                              .map((_, j) => (
                                <Skeleton key={j} className="h-4 w-40" />
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : filteredFaculties.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">Fakultas Tidak Ditemukan</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Tidak ada fakultas yang sesuai dengan pencarian Anda.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fakultas</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Mahasiswa</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaculties.map((faculty) => (
                      <React.Fragment key={faculty.id}>
                        <TableRow>
                          <TableCell className="font-medium">{faculty.name}</TableCell>
                          <TableCell>{faculty.code}</TableCell>
                          <TableCell>{faculty.programs.length}</TableCell>
                          <TableCell>{faculty.students}</TableCell>
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
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Plus className="mr-2 h-4 w-4" />
                                  <span>Tambah Program</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Hapus</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>

                        {/* Study Programs */}
                        {faculty.programs.map((program) => (
                          <TableRow key={program.id} className="bg-muted/30">
                            <TableCell className="pl-8">
                              <div className="font-medium">{program.name}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getDegreeBadgeVariant(program.degree)}>
                                {formatDegree(program.degree)}
                              </Badge>
                            </TableCell>
                            <TableCell colSpan={2}>{program.students} mahasiswa</TableCell>
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
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </DashboardMainCard>
    </PageTransition>
  )
}

