"use client"

import {
  FileText,
  Eye,
  Download,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type TurnitinResult, type ExamStage } from "@/lib/store/student-store"

export interface ResultsTableProps {
  results: TurnitinResult[]
  variant: "all" | "pending" | "reviewed" | "flagged"
  formatDate: (dateString: string | null) => string
  formatExamStage: (stage: ExamStage) => string
  getStudentName: (studentId: string) => string
  onViewReport: () => void
  onDownload: () => void
  onReview: (result: TurnitinResult) => void
  onTransfer: (result: TurnitinResult) => void
}

export function ResultsTable({
  results,
  variant,
  formatDate,
  formatExamStage,
  getStudentName,
  onViewReport,
  onDownload,
  onReview,
  onTransfer,
}: ResultsTableProps) {
  const filtered =
    variant === "all"
      ? results
      : results.filter((r) => r.status === variant)

  const showStatusColumn = variant === "all"
  const showDateColumn = variant === "reviewed" ? "reviewed" : "submitted"

  const emptyConfig = {
    all: { icon: FileText, title: "No Results Found", desc: "No Perpusmu results match your search criteria." },
    pending: { icon: CheckCircle, title: "No Pending Reviews", desc: "All Perpusmu results have been reviewed." },
    reviewed: { icon: FileText, title: "No Reviewed Results", desc: "No Perpusmu results have been reviewed yet." },
    flagged: { icon: AlertTriangle, title: "No Flagged Results", desc: "No Perpusmu results have been flagged for review." },
  }[variant]

  const EmptyIcon = emptyConfig.icon

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Exam Stage</TableHead>
            <TableHead>Similarity</TableHead>
            {showStatusColumn && <TableHead>Status</TableHead>}
            <TableHead>{showDateColumn === "reviewed" ? "Reviewed" : "Submitted"}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length > 0 ? (
            filtered.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  <div className="font-medium">{result.documentTitle}</div>
                </TableCell>
                <TableCell>{getStudentName(result.studentId)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{formatExamStage(result.examStage)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      variant === "flagged"
                        ? "destructive"
                        : result.similarityScore < 15
                          ? "outline"
                          : result.similarityScore < 30
                            ? "secondary"
                            : "destructive"
                    }
                  >
                    {result.similarityScore}%
                  </Badge>
                </TableCell>
                {showStatusColumn && (
                  <TableCell>
                    <Badge
                      variant={
                        result.status === "reviewed"
                          ? "success"
                          : result.status === "flagged"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  {showDateColumn === "reviewed"
                    ? formatDate(result.reviewedAt)
                    : formatDate(result.submittedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={onViewReport}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Report</span>
                    </Button>

                    {variant === "all" && (
                      <Button variant="ghost" size="icon" onClick={onDownload}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onReview(result)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">
                        {variant === "reviewed" ? "Edit Review" : "Review"}
                      </span>
                    </Button>

                    {variant === "all" && result.examStage === "proposal_exam" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTransfer(result)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Transfer</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showStatusColumn ? 7 : 6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-center">
                  <EmptyIcon className="h-8 w-8 text-muted-foreground/40" />
                  <h3 className="mt-2 text-lg font-medium">{emptyConfig.title}</h3>
                  <p className="text-sm text-muted-foreground">{emptyConfig.desc}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
