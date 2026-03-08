"use client"

import {
  FileText,
  MoreHorizontal,
  Download,
  Eye,
  MessageSquare,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface SubmissionsTableProps {
  filteredSubmissions: any[]
  totalSubmissions: number
  formatDate: (dateString: string) => string
  onViewSubmission: (submissionId: string) => void
  onProvideFeedback: (submission: any) => void
}

export function SubmissionsTable({
  filteredSubmissions,
  totalSubmissions,
  formatDate,
  onViewSubmission,
  onProvideFeedback,
}: SubmissionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions</CardTitle>
        <CardDescription>Review and provide feedback on student submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Similarity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{submission.documentTitle}</div>
                          <div className="text-xs text-muted-foreground">
                            Submitted on {formatDate(submission.submittedAt)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {submission.studentName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{submission.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{submission.courseName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Progress
                            value={submission.similarityScore}
                            max={100}
                            className="h-2"
                            indicatorColor={
                              submission.similarityScore < 15
                                ? "bg-green-500"
                                : submission.similarityScore < 30
                                  ? "bg-blue-500"
                                  : submission.similarityScore < 50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                            }
                          />
                        </div>
                        <span className="text-sm font-medium">{submission.similarityScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          submission.status === "reviewed"
                            ? "default"
                            : submission.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onViewSubmission(submission.id)}>
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewSubmission(submission.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onProvideFeedback(submission)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Provide Feedback
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={
                                submission.status !== "flagged"
                                  ? "text-amber-500 focus:text-amber-500"
                                  : "text-muted-foreground"
                              }
                              disabled={submission.status === "flagged"}
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Flag Submission
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/60" />
                      <h3 className="mt-2 text-lg font-medium">No Submissions</h3>
                      <p className="text-sm text-muted-foreground">
                        {totalSubmissions === 0
                          ? "There are no submissions to review."
                          : "No submissions match your current filters."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
