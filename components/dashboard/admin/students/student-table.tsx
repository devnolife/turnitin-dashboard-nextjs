"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, MoreHorizontal, Eye, Edit, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { DataPagination } from "@/components/ui/data-pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { type Student, useStudentStore } from "@/lib/store/student-store"

export function StudentTable() {
  const [sortColumn, setSortColumn] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { students, isLoading, fetchStudents } = useStudentStore()

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedStudents = [...students].sort((a, b) => {
    const aVal = String((a as Record<string, unknown>)[sortColumn] ?? "")
    const bVal = String((b as Record<string, unknown>)[sortColumn] ?? "")
    return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage)

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/admin/students/${studentId}`)
  }

  const handleDeleteStudent = (studentId: string) => {
    toast({ variant: "destructive", title: "Delete Student", description: "This feature is not implemented yet." })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Loading student data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>No students found.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 flex-col items-center justify-center">
            <User className="size-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-xl font-medium">No Students Found</h3>
            <p className="mt-2 text-center text-muted-foreground">No students are registered in the system yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <CardDescription>
          Showing {paginatedStudents.length} of {students.length} students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  <div className="flex items-center">
                    Student
                    {sortColumn === "name" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("prodi")}>
                  <div className="flex items-center">
                    Program Studi
                    {sortColumn === "prodi" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Avg Similarity</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.nim}</div>
                  </TableCell>
                  <TableCell>{student.prodi}</TableCell>
                  <TableCell>{student.submissionsCount}</TableCell>
                  <TableCell>
                    <Badge variant={student.avgSimilarity > 30 ? "destructive" : student.avgSimilarity > 20 ? "secondary" : "outline"}>
                      {student.avgSimilarity}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.hasCompletedPayment ? "success" : "secondary"}>
                      {student.hasCompletedPayment ? "Paid" : "Pending"}
                    </Badge>
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
                          <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                            <Eye className="mr-2 size-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteStudentId(student.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={students.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            showPageNumbers={false}
            className="mt-4"
          />
        )}
      </CardContent>

      <AlertDialog open={!!deleteStudentId} onOpenChange={(open) => !open && setDeleteStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Mahasiswa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data mahasiswa akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteStudentId) {
                  handleDeleteStudent(deleteStudentId)
                  setDeleteStudentId(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

