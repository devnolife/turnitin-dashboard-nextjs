"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, MessageSquare, Download } from "lucide-react"

export function InstructorSubmissions() {
  const [searchQuery, setSearchQuery] = useState("")

  const submissions = [
    {
      id: "SUB-001",
      title: "Research Paper on AI Ethics",
      student: "Alex Johnson",
      course: "Computer Science 101",
      date: "Apr 10, 2025",
      similarity: 15,
      status: "Pending Review",
    },
    {
      id: "SUB-002",
      title: "Literary Analysis: Hamlet",
      student: "Emma Williams",
      course: "English Literature",
      date: "Apr 5, 2025",
      similarity: 8,
      status: "Reviewed",
    },
    {
      id: "SUB-003",
      title: "Data Analysis Project",
      student: "Michael Brown",
      course: "Data Science 202",
      date: "Mar 28, 2025",
      similarity: 22,
      status: "Pending Review",
    },
    {
      id: "SUB-004",
      title: "Economic Theory Essay",
      student: "Sophia Davis",
      course: "Economics 101",
      date: "Mar 15, 2025",
      similarity: 12,
      status: "Reviewed",
    },
    {
      id: "SUB-005",
      title: "Machine Learning Algorithm Analysis",
      student: "James Wilson",
      course: "AI Ethics 301",
      date: "Mar 10, 2025",
      similarity: 18,
      status: "Reviewed",
    },
  ]

  const filteredSubmissions = submissions.filter(
    (submission) =>
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.course.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Submissions</CardTitle>
        <CardDescription>Review and provide feedback on student submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="hidden md:table-cell">Course</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Similarity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="font-medium">{submission.title}</div>
                    <div className="text-sm text-muted-foreground">{submission.id}</div>
                  </TableCell>
                  <TableCell>{submission.student}</TableCell>
                  <TableCell className="hidden md:table-cell">{submission.course}</TableCell>
                  <TableCell className="hidden md:table-cell">{submission.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        submission.similarity < 15
                          ? "outline"
                          : submission.similarity < 30
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {submission.similarity}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={submission.status === "Reviewed" ? "default" : "secondary"}>
                      {submission.status}
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Provide Feedback</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download</span>
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

