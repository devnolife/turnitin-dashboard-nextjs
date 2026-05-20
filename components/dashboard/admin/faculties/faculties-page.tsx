"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, GraduationCap, BookOpen } from "lucide-react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import api from "@/lib/api/client"

interface StudyProgramData {
  id: string
  name: string
  code: string
  degree: string
  facultyId: string
  facultyName: string
  facultyCode: string
}

interface FacultyGroup {
  id: string
  name: string
  code: string
  programs: StudyProgramData[]
}

export function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState<FacultyGroup[]>([])
  const [filtered, setFiltered] = useState<FacultyGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchFaculties()
  }, [])

  const fetchFaculties = async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/admin/study-programs")
      const data = res.data
      const programs = data.programs || []

      // Group by faculty
      const facultyMap = new Map<string, FacultyGroup>()
      for (const prog of programs) {
        const fac = prog.faculty
        if (!fac) continue
        if (!facultyMap.has(fac.id)) {
          facultyMap.set(fac.id, {
            id: fac.id,
            name: fac.name,
            code: fac.code,
            programs: [],
          })
        }
        facultyMap.get(fac.id)!.programs.push({
          id: prog.id,
          name: prog.name,
          code: prog.code,
          degree: prog.degree,
          facultyId: fac.id,
          facultyName: fac.name,
          facultyCode: fac.code,
        })
      }

      // Also include faculties that have no programs
      const apiFaculties = data.faculties || []
      for (const fac of apiFaculties) {
        if (!facultyMap.has(fac.id)) {
          facultyMap.set(fac.id, {
            id: fac.id,
            name: fac.name,
            code: fac.code,
            programs: [],
          })
        }
      }

      const grouped = Array.from(facultyMap.values()).sort((a, b) => a.name.localeCompare(b.name))
      setFaculties(grouped)
      setFiltered(grouped)
    } catch {
      console.error("Gagal mengambil data fakultas")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(faculties)
      return
    }
    const q = searchQuery.toLowerCase()
    const result = faculties
      .map((fac) => ({
        ...fac,
        programs: fac.programs.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)),
      }))
      .filter(
        (fac) =>
          fac.name.toLowerCase().includes(q) ||
          fac.code.toLowerCase().includes(q) ||
          fac.programs.length > 0
      )
      .map((fac) => ({
        ...fac,
        programs:
          fac.name.toLowerCase().includes(q) || fac.code.toLowerCase().includes(q)
            ? faculties.find((f) => f.id === fac.id)?.programs || fac.programs
            : fac.programs,
      }))
    setFiltered(result)
  }, [searchQuery, faculties])

  const formatDegree = (degree: string) => {
    switch (degree) {
      case "S1": return "S1"
      case "S2": return "S2"
      case "S3": return "S3"
      case "bachelor": return "S1"
      case "master": return "S2"
      case "doctoral": return "S3"
      default: return degree
    }
  }

  const totalPrograms = faculties.reduce((acc, fac) => acc + fac.programs.length, 0)

  return (
    <PageTransition>
      <DashboardMainCard title="Manajemen Fakultas" subtitle="Kelola fakultas dan program studi 🏛️" icon={GraduationCap}>
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Fakultas</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={faculties.length} /></div>
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
                <div className="text-2xl font-bold"><AnimatedCounter value={totalPrograms} /></div>
                <p className="text-xs text-muted-foreground">Di seluruh fakultas</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Prodi</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={faculties.length > 0 ? Math.round(totalPrograms / faculties.length) : 0} />
                </div>
                <p className="text-xs text-muted-foreground">Program per fakultas</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Daftar Fakultas</CardTitle>
            <CardDescription>Kelola fakultas dan program studi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari fakultas atau program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="rounded-md border overflow-x-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <div className="space-y-2 pl-6">
                        {Array(3).fill(0).map((_, j) => (
                          <Skeleton key={j} className="h-4 w-40" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <Empty>
                  <EmptyMedia variant="icon">
                    <GraduationCap className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>Fakultas Tidak Ditemukan</EmptyTitle>
                    <EmptyDescription>
                      Tidak ada fakultas yang sesuai dengan pencarian Anda.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fakultas / Program</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Jenjang</TableHead>
                      <TableHead>Jumlah Prodi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((faculty) => (
                      <React.Fragment key={faculty.id}>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-bold">{faculty.name}</TableCell>
                          <TableCell><Badge variant="outline">{faculty.code}</Badge></TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>{faculty.programs.length} prodi</TableCell>
                        </TableRow>
                        {faculty.programs.map((program) => (
                          <TableRow key={program.id}>
                            <TableCell className="pl-8">{program.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{program.code}</TableCell>
                            <TableCell><Badge variant="secondary">{formatDegree(program.degree)}</Badge></TableCell>
                            <TableCell>-</TableCell>
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

