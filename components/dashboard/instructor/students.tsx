"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Mail, FileText, UserPlus } from "lucide-react"

export function InstructorStudents() {
  const [searchQuery, setSearchQuery] = useState("")

  const students = [
    {
      id: "STU-001",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      course: "Computer Science 101",
      submissions: 8,
      lastActive: "2 days ago",
      status: "Active",
    },
    {
      id: "STU-002",
      name: "Emma Williams",
      email: "emma.williams@example.com",
      course: "Computer Science 101",
      submissions: 7,
      lastActive: "1 day ago",
      status: "Active",
    },
    {
      id: "STU-003",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      course: "Data Science 202",
      submissions: 6,
      lastActive: "3 days ago",
      status: "Active",
    },
    {
      id: "STU-004",
      name: "Sophia Davis",
      email: "sophia.davis@example.com",
      course: "Data Science 202",
      submissions: 5,
      lastActive: "5 days ago",
      status: "Inactive",
    },
    {
      id: "STU-005",
      name: "James Wilson",
      email: "james.wilson@example.com",
      course: "AI Ethics 301",
      submissions: 4,
      lastActive: "1 week ago",
      status: "Active",
    },
  ]

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Students</CardTitle>
            <CardDescription>Manage your students and their submissions</CardDescription>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="hidden md:table-cell">Submissions</TableHead>
                <TableHead className="hidden md:table-cell">Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.email}</div>
                  </TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.submissions}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.lastActive}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === "Active" ? "default" : "secondary"}>{student.status}</Badge>
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
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>View Submissions</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

