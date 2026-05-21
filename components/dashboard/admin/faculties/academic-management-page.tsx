"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Search,
  Users,
  GraduationCap,
  Filter,
  X,
  Building,
  ArrowUpDown,
  Settings,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter, FadeIn } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import api from "@/lib/api/client"

interface SimilarityRule {
  id: string
  ruleType: string
  label: string
  maxPercentage: number
  orderIndex: number
}

interface StudyProgramAPI {
  id: string
  name: string
  code: string
  degree: string
  facultyId: string
  faculty: { id: string; name: string; code: string }
  similarityRules: SimilarityRule[]
  _count: { users: number }
}

interface FacultyAPI {
  id: string
  name: string
  code: string
  _count: { programs: number }
}

interface FacultyGroup {
  id: string
  name: string
  code: string
  programs: { id: string; name: string; code: string; degree: string }[]
}

interface FlatProgram {
  id: string
  name: string
  code: string
  degree: string
  students: number
  facultyId: string
  facultyName: string
  facultyCode: string
  rulesCount: number
  ruleType: string | null
}

export function AcademicManagementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [programs, setPrograms] = useState<FlatProgram[]>([])
  const [faculties, setFaculties] = useState<FacultyAPI[]>([])
  const [facultyGroups, setFacultyGroups] = useState<FacultyGroup[]>([])

  // Faculty tab state
  const [facultySearch, setFacultySearch] = useState("")

  // Prodi tab state
  const [prodiSearch, setProdiSearch] = useState("")
  const [facultyFilter, setFacultyFilter] = useState<string | null>(null)
  const [degreeFilter, setDegreeFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "students" | "faculty" | "rules">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/admin/study-programs")
        const data = res.data
        const apiPrograms: StudyProgramAPI[] = data.programs || []
        const apiFaculties: FacultyAPI[] = data.faculties || []

        // Flat programs for prodi tab
        const flat: FlatProgram[] = apiPrograms.map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          degree: p.degree,
          students: p._count.users,
          facultyId: p.faculty.id,
          facultyName: p.faculty.name,
          facultyCode: p.faculty.code,
          rulesCount: p.similarityRules.length,
          ruleType: p.similarityRules[0]?.ruleType || null,
        }))
        setPrograms(flat)
        setFaculties(apiFaculties)

        // Grouped for faculty tab
        const facultyMap = new Map<string, FacultyGroup>()
        for (const prog of apiPrograms) {
          const fac = prog.faculty
          if (!fac) continue
          if (!facultyMap.has(fac.id)) {
            facultyMap.set(fac.id, { id: fac.id, name: fac.name, code: fac.code, programs: [] })
          }
          facultyMap.get(fac.id)!.programs.push({
            id: prog.id, name: prog.name, code: prog.code, degree: prog.degree,
          })
        }
        for (const fac of apiFaculties) {
          if (!facultyMap.has(fac.id)) {
            facultyMap.set(fac.id, { id: fac.id, name: fac.name, code: fac.code, programs: [] })
          }
        }
        setFacultyGroups(Array.from(facultyMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
      } catch {
        console.error("Gagal mengambil data akademik")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- Faculty tab ---
  const filteredFaculties = useMemo(() => {
    if (!facultySearch.trim()) return facultyGroups
    const q = facultySearch.toLowerCase()
    return facultyGroups
      .map((fac) => ({
        ...fac,
        programs: fac.programs.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)),
      }))
      .filter((fac) => fac.name.toLowerCase().includes(q) || fac.code.toLowerCase().includes(q) || fac.programs.length > 0)
      .map((fac) => ({
        ...fac,
        programs:
          fac.name.toLowerCase().includes(q) || fac.code.toLowerCase().includes(q)
            ? facultyGroups.find((f) => f.id === fac.id)?.programs || fac.programs
            : fac.programs,
      }))
  }, [facultySearch, facultyGroups])

  const totalPrograms = facultyGroups.reduce((acc, f) => acc + f.programs.length, 0)

  // --- Prodi tab ---
  const filteredPrograms = useMemo(() => {
    let result = [...programs]
    if (prodiSearch.trim()) {
      const query = prodiSearch.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.facultyName.toLowerCase().includes(query) || p.code.toLowerCase().includes(query),
      )
    }
    if (facultyFilter) result = result.filter((p) => p.facultyId === facultyFilter)
    if (degreeFilter) result = result.filter((p) => p.degree === degreeFilter)
    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case "name": cmp = a.name.localeCompare(b.name); break
        case "students": cmp = a.students - b.students; break
        case "faculty": cmp = a.facultyName.localeCompare(b.facultyName); break
        case "rules": cmp = a.rulesCount - b.rulesCount; break
      }
      return sortOrder === "asc" ? cmp : -cmp
    })
    return result
  }, [programs, prodiSearch, facultyFilter, degreeFilter, sortBy, sortOrder])

  const handleSort = (field: "name" | "students" | "faculty" | "rules") => {
    if (field === sortBy) setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    else { setSortBy(field); setSortOrder("asc") }
  }

  const handleResetFilters = () => { setFacultyFilter(null); setDegreeFilter(null); setProdiSearch("") }

  const formatRuleType = (type: string | null) => (!type ? "Belum diatur" : type === "PER_CHAPTER" ? "Per Bab" : "Per Jenis Ujian")
  const formatDegree = (d: string) => {
    switch (d) { case "bachelor": return "S1"; case "master": return "S2"; case "doctoral": return "S3"; default: return d }
  }

  const totalStudents = programs.reduce((acc, p) => acc + p.students, 0)
  const withRules = programs.filter((p) => p.rulesCount > 0).length

  return (
    <PageTransition>
      <DashboardMainCard title="Fakultas & Program Studi" subtitle="Kelola fakultas, program studi, dan aturan similarity 🏛️" icon={GraduationCap}>
        {/* Stats */}
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Fakultas</CardTitle>
                <GraduationCap className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={facultyGroups.length} /></div>
                <p className="text-xs text-muted-foreground">Fakultas akademik</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Program Studi</CardTitle>
                <BookOpen className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalPrograms} /></div>
                <p className="text-xs text-muted-foreground">Di seluruh fakultas</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={totalStudents} /></div>
                <p className="text-xs text-muted-foreground">Terdaftar di sistem</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Aturan Aktif</CardTitle>
                <FileCheck className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"><AnimatedCounter value={withRules} /></div>
                <p className="text-xs text-muted-foreground">Dari {totalPrograms} prodi sudah diatur</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Tabs */}
        <Tabs defaultValue="faculties" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faculties">Fakultas</TabsTrigger>
            <TabsTrigger value="prodi">Program Studi</TabsTrigger>
          </TabsList>

          {/* === Fakultas Tab === */}
          <TabsContent value="faculties">
            <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10">
              <CardHeader>
                <CardTitle>Daftar Fakultas</CardTitle>
                <CardDescription>Fakultas beserta program studi di dalamnya</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="size-4 text-muted-foreground" />
                  <Input placeholder="Cari fakultas atau program..." value={facultySearch} onChange={(e) => setFacultySearch(e.target.value)} className="h-9" />
                </div>
                <div className="rounded-md border overflow-x-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <div className="space-y-2 pl-6">{Array(3).fill(0).map((_, j) => <Skeleton key={j} className="h-4 w-40" />)}</div>
                        </div>
                      ))}
                    </div>
                  ) : filteredFaculties.length === 0 ? (
                    <Empty>
                      <EmptyMedia variant="icon"><GraduationCap className="size-6" /></EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>Fakultas Tidak Ditemukan</EmptyTitle>
                        <EmptyDescription>Tidak ada fakultas yang sesuai dengan pencarian Anda.</EmptyDescription>
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
                        {filteredFaculties.map((faculty) => (
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
          </TabsContent>

          {/* === Program Studi Tab === */}
          <TabsContent value="prodi">
            <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10">
              <CardHeader>
                <CardTitle>Daftar Program Studi</CardTitle>
                <CardDescription>Kelola aturan similarity per program studi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input placeholder="Cari program studi atau fakultas..." value={prodiSearch} onChange={(e) => setProdiSearch(e.target.value)} className="pl-10" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="gap-2">
                      <Filter className="size-4" />Filter
                    </Button>
                    {(facultyFilter || degreeFilter) && (
                      <Button variant="outline" onClick={handleResetFilters} className="gap-2"><X className="size-4" />Reset</Button>
                    )}
                  </div>
                </div>

                {(facultyFilter || degreeFilter) && (
                  <div className="flex flex-wrap gap-2">
                    {facultyFilter && (
                      <Badge variant="secondary" className="gap-1">
                        Fakultas: {faculties.find((f) => f.id === facultyFilter)?.name}
                        <button onClick={() => setFacultyFilter(null)} className="ml-1 rounded-full hover:bg-secondary-foreground/20"><X className="size-3" /></button>
                      </Badge>
                    )}
                    {degreeFilter && (
                      <Badge variant="secondary" className="gap-1">
                        Jenjang: {degreeFilter}
                        <button onClick={() => setDegreeFilter(null)} className="ml-1 rounded-full hover:bg-secondary-foreground/20"><X className="size-3" /></button>
                      </Badge>
                    )}
                  </div>
                )}

                {showFilters && (
                  <FadeIn className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fakultas</label>
                      <Select value={facultyFilter || "all"} onValueChange={(v) => setFacultyFilter(v === "all" ? null : v)}>
                        <SelectTrigger><SelectValue placeholder="Semua Fakultas" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Fakultas</SelectItem>
                          {faculties.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jenjang</label>
                      <Select value={degreeFilter || "all"} onValueChange={(v) => setDegreeFilter(v === "all" ? null : v)}>
                        <SelectTrigger><SelectValue placeholder="Semua Jenjang" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Jenjang</SelectItem>
                          <SelectItem value="S1">S1 (Sarjana)</SelectItem>
                          <SelectItem value="S2">S2 (Magister)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FadeIn>
                )}

                <div className="rounded-md border overflow-x-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : filteredPrograms.length === 0 ? (
                    <Empty>
                      <EmptyMedia variant="icon"><BookOpen className="size-6" /></EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>Program Studi Tidak Ditemukan</EmptyTitle>
                        <EmptyDescription>Tidak ada program studi yang sesuai dengan pencarian Anda.</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("name")}>Program Studi<ArrowUpDown className="size-3" /></div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("faculty")}>Fakultas<ArrowUpDown className="size-3" /></div>
                          </TableHead>
                          <TableHead>Jenjang</TableHead>
                          <TableHead>
                            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("students")}>Mahasiswa<ArrowUpDown className="size-3" /></div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("rules")}>Aturan Similarity<ArrowUpDown className="size-3" /></div>
                          </TableHead>
                          <TableHead className="w-[120px]">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPrograms.map((program) => (
                          <TableRow key={program.id}>
                            <TableCell>
                              <div><div className="font-medium">{program.name}</div><div className="text-xs text-muted-foreground">{program.code}</div></div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2"><Building className="size-4 text-muted-foreground" /><span className="text-sm">{program.facultyName}</span></div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{program.degree}</Badge></TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1"><Users className="size-3 text-muted-foreground" /><span>{program.students}</span></div>
                            </TableCell>
                            <TableCell>
                              {program.rulesCount > 0 ? (
                                <Badge variant="default" className="bg-green-600">{program.rulesCount} aturan ({formatRuleType(program.ruleType)})</Badge>
                              ) : (
                                <Badge variant="secondary">Belum diatur</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/admin/prodi/${program.id}/rules`)} className="gap-1">
                                <Settings className="size-3" />Kelola Aturan
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {!isLoading && filteredPrograms.length > 0 && (
                  <p className="text-sm text-muted-foreground">Menampilkan {filteredPrograms.length} dari {programs.length} program studi</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardMainCard>
    </PageTransition>
  )
}
