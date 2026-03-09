"use client"

import React from "react"

import {
  Plus,
  Search,
  Filter,
  X,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Users,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { FadeIn } from "@/components/ui/motion"

interface InstructorsTableProps {
  // Data
  filteredInstructors: any[]
  currentItems: any[]
  isLoading: boolean
  // Pagination
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  // Search & Filters
  showFilters: boolean
  onToggleFilters: () => void
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  // Filter values
  facultyFilter: string | null
  programFilter: string | null
  positionFilter: string | null
  statusFilter: string | null
  // Filter setters
  onFacultyFilterChange: (value: string | null) => void
  onProgramFilterChange: (value: string | null) => void
  onPositionFilterChange: (value: string | null) => void
  onStatusFilterChange: (value: string | null) => void
  onResetFilters: () => void
  // Sort
  onSortBy: (field: string) => void
  // Data/helpers
  faculties: any[]
  availablePrograms: any[]
  formatPosition: (position: string) => string
  getStatusBadgeVariant: (status: string) => string
  getFacultyName: (facultyId: string) => string
  getStudentCountByInstructor: (instructorId: string) => number
  // Actions
  onViewInstructor: (instructorId: string) => void
  onAddInstructor: () => void
}

export function InstructorsTable({
  filteredInstructors,
  currentItems,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  showFilters,
  onToggleFilters,
  onSearch,
  facultyFilter,
  programFilter,
  positionFilter,
  statusFilter,
  onFacultyFilterChange,
  onProgramFilterChange,
  onPositionFilterChange,
  onStatusFilterChange,
  onResetFilters,
  onSortBy,
  faculties,
  availablePrograms,
  formatPosition,
  getStatusBadgeVariant,
  getFacultyName,
  getStudentCountByInstructor,
  onViewInstructor,
  onAddInstructor,
}: InstructorsTableProps) {
  return (
    <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Instruktur</CardTitle>
          <CardDescription>Kelola instruktur dan lihat mahasiswa yang diawasi</CardDescription>
        </div>
        <Button onClick={onAddInstructor}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Instruktur
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, ID, atau spesialisasi..."
              onChange={onSearch}
              className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={onToggleFilters}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            {(facultyFilter || programFilter || positionFilter || statusFilter) && (
              <Button variant="outline" onClick={onResetFilters} className="gap-2">
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Active filters */}
        {(facultyFilter || programFilter || positionFilter || statusFilter) && (
          <div className="flex flex-wrap gap-2">
            {facultyFilter && (
              <Badge variant="secondary" className="gap-1">
                Fakultas: {getFacultyName(facultyFilter)}
                <button
                  onClick={() => onFacultyFilterChange(null)}
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </button>
              </Badge>
            )}

            {programFilter && (
              <Badge variant="secondary" className="gap-1">
                Program: {availablePrograms.find((p) => p.id === programFilter)?.name}
                <button
                  onClick={() => onProgramFilterChange(null)}
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </button>
              </Badge>
            )}

            {positionFilter && (
              <Badge variant="secondary" className="gap-1">
                Jabatan: {formatPosition(positionFilter)}
                <button
                  onClick={() => onPositionFilterChange(null)}
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </button>
              </Badge>
            )}

            {statusFilter && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("_", " ")}
                <button
                  onClick={() => onStatusFilterChange(null)}
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Expanded filters */}
        {showFilters && (
          <FadeIn className="grid gap-4 rounded-md border p-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fakultas</label>
              <Select
                value={facultyFilter || "all"}
                onValueChange={(value) => onFacultyFilterChange(value === "all" ? null : value)}
              >
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
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
              <label className="text-sm font-medium">Program Studi</label>
              <Select
                value={programFilter || "all"}
                onValueChange={(value) => onProgramFilterChange(value === "all" ? null : value)}
                disabled={!facultyFilter}
              >
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                  <SelectValue placeholder={facultyFilter ? "Semua Program" : "Pilih Fakultas Dulu"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Program</SelectItem>
                  {availablePrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jabatan</label>
              <Select
                value={positionFilter || "all"}
                onValueChange={(value) => onPositionFilterChange(value === "all" ? null : value)}
              >
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                  <SelectValue placeholder="Semua Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jabatan</SelectItem>
                  <SelectItem value="professor">Profesor</SelectItem>
                  <SelectItem value="associate_professor">Profesor Madya</SelectItem>
                  <SelectItem value="assistant_professor">Asisten Profesor</SelectItem>
                  <SelectItem value="lecturer">Pengawas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
              >
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="on_leave">Cuti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FadeIn>
        )}

        <div className="rounded-md border overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="ml-auto flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium">Instruktur Tidak Ditemukan</h3>
              <p className="mt-2 text-sm text-muted-foreground">Tidak ada instruktur yang sesuai dengan pencarian Anda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instruktur</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => onSortBy("faculty")}>
                      Fakultas
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => onSortBy("position")}>
                      Jabatan
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => onSortBy("students")}>
                      Mahasiswa
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => onSortBy("status")}>
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {instructor.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{instructor.name}</div>
                          <div className="text-sm text-muted-foreground">{instructor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getFacultyName(instructor.facultyId)}</TableCell>
                    <TableCell>{formatPosition(instructor.position)}</TableCell>
                    <TableCell>{getStudentCountByInstructor(instructor.id)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(instructor.status)}>
                        {instructor.status.charAt(0).toUpperCase() + instructor.status.slice(1).replace("_", " ")}
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
                          <DropdownMenuItem onClick={() => onViewInstructor(instructor.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Lihat Detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Kirim Email</span>
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
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current page
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                })
                .map((page, i, array) => {
                  // Add ellipsis if there are gaps
                  const prevPage = array[i - 1]
                  const showEllipsis = prevPage && page - prevPage > 1

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <PaginationItem>
                          <span className="flex h-10 w-10 items-center justify-center">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink onClick={() => onPageChange(page)} isActive={page === currentPage}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  )
                })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}
