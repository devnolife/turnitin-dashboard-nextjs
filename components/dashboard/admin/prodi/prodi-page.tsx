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
import { Skeleton } from "@/components/ui/skeleton"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter, FadeIn } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"

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

export function AdminProdiPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [facultyFilter, setFacultyFilter] = useState<string | null>(null)
  const [degreeFilter, setDegreeFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "students" | "faculty" | "rules">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const [programs, setPrograms] = useState<FlatProgram[]>([])
  const [faculties, setFaculties] = useState<FacultyAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/study-programs")
        const data = await res.json()
        const flatPrograms: FlatProgram[] = (data.programs || []).map((p: StudyProgramAPI) => ({
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
        setPrograms(flatPrograms)
        setFaculties(data.faculties || [])
      } catch (error) {
        console.error("Failed to fetch study programs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredPrograms = useMemo(() => {
    let result = [...programs]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.facultyName.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query)
      )
    }

    if (facultyFilter) {
      result = result.filter((p) => p.facultyId === facultyFilter)
    }

    if (degreeFilter) {
      result = result.filter((p) => p.degree === degreeFilter)
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "students":
          comparison = a.students - b.students
          break
        case "faculty":
          comparison = a.facultyName.localeCompare(b.facultyName)
          break
        case "rules":
          comparison = a.rulesCount - b.rulesCount
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return result
  }, [programs, searchQuery, facultyFilter, degreeFilter, sortBy, sortOrder])

  const handleSort = (field: "name" | "students" | "faculty" | "rules") => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleResetFilters = () => {
    setFacultyFilter(null)
    setDegreeFilter(null)
    setSearchQuery("")
  }

  const formatRuleType = (type: string | null) => {
    if (!type) return "Belum diatur"
    return type === "PER_CHAPTER" ? "Per Bab" : "Per Jenis Ujian"
  }

  const totalStudents = programs.reduce((acc, p) => acc + p.students, 0)
  const withRules = programs.filter((p) => p.rulesCount > 0).length
  const s1Count = programs.filter((p) => p.degree === "S1").length
  const s2Count = programs.filter((p) => p.degree === "S2").length

  return (
    <PageTransition>
      <DashboardMainCard title="Manajemen Program Studi" subtitle="Kelola program studi dan aturan similarity 📚" icon={BookOpen}>
        {/* Stats */}
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Prodi</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={programs.length} />
                </div>
                <p className="text-xs text-muted-foreground">Di {faculties.length} fakultas</p>
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
                <p className="text-xs text-muted-foreground">Terdaftar di sistem</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Aturan Aktif</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={withRules} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Dari {programs.length} prodi sudah diatur
                </p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Program S1</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={s1Count} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {s2Count > 0 && `${s2Count} program S2`}
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Table */}
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Daftar Program Studi</CardTitle>
            <CardDescription>Kelola aturan similarity per program studi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search & filter controls */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari program studi atau fakultas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>

                {(facultyFilter || degreeFilter) && (
                  <Button variant="outline" onClick={handleResetFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Active filters */}
            {(facultyFilter || degreeFilter) && (
              <div className="flex flex-wrap gap-2">
                {facultyFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Fakultas: {faculties.find((f) => f.id === facultyFilter)?.name}
                    <button onClick={() => setFacultyFilter(null)} className="ml-1 rounded-full hover:bg-secondary-foreground/20">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {degreeFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Jenjang: {degreeFilter}
                    <button onClick={() => setDegreeFilter(null)} className="ml-1 rounded-full hover:bg-secondary-foreground/20">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Expanded filters */}
            {showFilters && (
              <FadeIn className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fakultas</label>
                  <Select
                    value={facultyFilter || "all"}
                    onValueChange={(value) => setFacultyFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Fakultas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Fakultas</SelectItem>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenjang</label>
                  <Select
                    value={degreeFilter || "all"}
                    onValueChange={(value) => setDegreeFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenjang</SelectItem>
                      <SelectItem value="S1">S1 (Sarjana)</SelectItem>
                      <SelectItem value="S2">S2 (Magister)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FadeIn>
            )}

            {/* Data table */}
            <div className="rounded-md border overflow-x-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">Program Studi Tidak Ditemukan</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tidak ada program studi yang sesuai dengan pencarian Anda.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("name")}>
                          Program Studi
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("faculty")}>
                          Fakultas
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Jenjang</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("students")}>
                          Mahasiswa
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("rules")}>
                          Aturan Similarity
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrograms.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{program.name}</div>
                            <div className="text-xs text-muted-foreground">{program.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{program.facultyName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{program.degree}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{program.students}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {program.rulesCount > 0 ? (
                            <Badge variant="default" className="bg-green-600">
                              {program.rulesCount} aturan ({formatRuleType(program.ruleType)})
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Belum diatur</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/admin/prodi/${program.id}/rules`)}
                            className="gap-1"
                          >
                            <Settings className="h-3 w-3" />
                            Kelola Aturan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Results count */}
            {!isLoading && filteredPrograms.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Menampilkan {filteredPrograms.length} dari {programs.length} program studi
              </p>
            )}
          </CardContent>
        </Card>
      </DashboardMainCard>
    </PageTransition>
  )
}
