"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  Building,
  Award,
  Clock,
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
import { useToast } from "@/components/ui/use-toast"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter, FadeIn } from "@/components/ui/motion"

export function AdminInstructorsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const router = useRouter()
  const { toast } = useToast()

  const {
    filteredInstructors,
    isLoading,
    fetchInstructors,
    setSearchQuery,
    setFacultyFilter,
    setProgramFilter,
    setPositionFilter,
    setStatusFilter,
    setSortBy,
    sortBy,
    sortOrder,
    facultyFilter,
    programFilter,
    positionFilter,
    statusFilter,
    getStudentCountByInstructor,
  } = useInstructorStore()

  const { faculties } = useFacultyStore()

  useEffect(() => {
    fetchInstructors()
  }, [fetchInstructors])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInstructors.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage)

  // Get programs for selected faculty
  const availablePrograms = facultyFilter ? faculties.find((f) => f.id === facultyFilter)?.programs || [] : []

  // Format position for display
  const formatPosition = (position: string) => {
    return position
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "inactive":
        return "secondary"
      case "on_leave":
        return "warning"
      default:
        return "outline"
    }
  }

  // Get faculty name
  const getFacultyName = (facultyId: string) => {
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown Faculty"
  }

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page on search
  }

  // Handle view instructor details
  const handleViewInstructor = (instructorId: string) => {
    router.push(`/dashboard/admin/instructors/${instructorId}`)
  }

  // Handle add new instructor
  const handleAddInstructor = () => {
    router.push("/dashboard/admin/instructors/new")
  }

  // Reset all filters
  const handleResetFilters = () => {
    setFacultyFilter(null)
    setProgramFilter(null)
    setPositionFilter(null)
    setStatusFilter(null)
    setSearchQuery("")
    setCurrentPage(1)
  }

  // Calculate statistics
  const totalInstructors = filteredInstructors.length
  const activeInstructors = filteredInstructors.filter((i) => i.status === "active").length
  const inactiveInstructors = filteredInstructors.filter((i) => i.status === "inactive").length
  const onLeaveInstructors = filteredInstructors.filter((i) => i.status === "on_leave").length

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Instructor Management</h1>
          <p className="text-muted-foreground">Manage instructors and view their supervised students</p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={totalInstructors} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeInstructors} active ({Math.round((activeInstructors / totalInstructors) * 100)}%)
                </p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Faculties Covered</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={faculties.length} />
                </div>
                <p className="text-xs text-muted-foreground">Academic faculties</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Professors</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={filteredInstructors.filter((i) => i.position === "professor").length} />
                </div>
                <p className="text-xs text-muted-foreground">Full professors</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={onLeaveInstructors} />
                </div>
                <p className="text-xs text-muted-foreground">Currently on leave</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Instructors</CardTitle>
              <CardDescription>Manage instructors and view their supervised students</CardDescription>
            </div>
            <Button onClick={handleAddInstructor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Instructor
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or specialization..."
                  onChange={handleSearch}
                  className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                {(facultyFilter || programFilter || positionFilter || statusFilter) && (
                  <Button variant="outline" onClick={handleResetFilters} className="gap-2">
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
                    Faculty: {getFacultyName(facultyFilter)}
                    <button
                      onClick={() => setFacultyFilter(null)}
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
                      onClick={() => setProgramFilter(null)}
                      className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </Badge>
                )}

                {positionFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Position: {formatPosition(positionFilter)}
                    <button
                      onClick={() => setPositionFilter(null)}
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
                      onClick={() => setStatusFilter(null)}
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
                  <label className="text-sm font-medium">Faculty</label>
                  <Select
                    value={facultyFilter || "all"}
                    onValueChange={(value) => setFacultyFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                      <SelectValue placeholder="All Faculties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Faculties</SelectItem>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Study Program</label>
                  <Select
                    value={programFilter || "all"}
                    onValueChange={(value) => setProgramFilter(value === "all" ? null : value)}
                    disabled={!facultyFilter}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                      <SelectValue placeholder={facultyFilter ? "All Programs" : "Select Faculty First"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {availablePrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Select
                    value={positionFilter || "all"}
                    onValueChange={(value) => setPositionFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="associate_professor">Associate Professor</SelectItem>
                      <SelectItem value="assistant_professor">Assistant Professor</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FadeIn>
            )}

            <div className="rounded-md border">
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
                  <h3 className="mt-4 text-lg font-medium">No Instructors Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">No instructors match your search criteria.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instructor</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setSortBy("faculty")}>
                          Faculty
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setSortBy("position")}>
                          Position
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setSortBy("students")}>
                          Students
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setSortBy("status")}>
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
                                  .map((n) => n[0])
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
                              <DropdownMenuItem onClick={() => handleViewInstructor(instructor.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Email</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
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
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                            <PaginationLink onClick={() => setCurrentPage(page)} isActive={page === currentPage}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      )
                    })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}

