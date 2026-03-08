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
        return "Bachelor's"
      case "master":
        return "Master's"
      case "doctoral":
        return "Doctoral"
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
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Faculty Management</h1>
          <p className="text-muted-foreground">Manage faculties and study programs</p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Faculties</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">Study Programs</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={totalPrograms} />
                </div>
                <p className="text-xs text-muted-foreground">Across all faculties</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={totalStudents} />
                </div>
                <p className="text-xs text-muted-foreground">Enrolled students</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average per Faculty</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={Math.round(totalStudents / faculties.length)} />
                </div>
                <p className="text-xs text-muted-foreground">Students per faculty</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Faculties</CardTitle>
              <CardDescription>Manage faculties and their study programs</CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Faculty
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search faculties and programs..."
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
                  <h3 className="mt-4 text-lg font-medium">No Faculties Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">No faculties match your search criteria.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Programs</TableHead>
                      <TableHead>Students</TableHead>
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
                                  <span>Add Program</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
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
                            <TableCell colSpan={2}>{program.students} students</TableCell>
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
                                    <span>Delete</span>
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
      </div>
    </PageTransition>
  )
}

