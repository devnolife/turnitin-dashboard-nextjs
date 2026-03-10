"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { type TurnitinResult, type ExamStage, useStudentStore } from "@/lib/store/student-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { PageTransition } from "@/components/ui/motion"
import { ResultsFilters } from "./results-filters"
import { ResultsTable } from "./results-table"
import { ReviewDialog, UploadDialog, TransferDialog } from "./results-detail-dialog"

interface TurnitinResultsManagerProps {
  instructorId: string
}

export function TurnitinResultsManager({ instructorId }: TurnitinResultsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [examStageFilter, setExamStageFilter] = useState<string>("all")
  const [selectedResult, setSelectedResult] = useState<TurnitinResult | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadStudentId, setUploadStudentId] = useState("")
  const [uploadExamStage, setUploadExamStage] = useState<ExamStage>("proposal_exam")
  const [transferTargetStage, setTransferTargetStage] = useState<ExamStage>("final_exam")

  const router = useRouter()
  const { toast } = useToast()
  const { getInstructorById, getStudentsByInstructor, getTurnitinResultsByInstructor, reviewTurnitinResult } =
    useInstructorStore()
  const { addTurnitinResult, transferTurnitinResult, getStudentById } = useStudentStore()

  const instructor = getInstructorById(instructorId)
  const students = getStudentsByInstructor(instructorId)
  const allResults = getTurnitinResultsByInstructor(instructorId)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not reviewed"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatExamStage = (stage: ExamStage) => {
    switch (stage) {
      case "applicant":
        return "Applicant"
      case "proposal_exam":
        return "Proposal Exam"
      case "results_exam":
        return "Results Exam"
      case "final_exam":
        return "Final Exam"
      case "graduated":
        return "Graduated"
      default:
        return stage
    }
  }

  const getStudentName = (studentId: string) => {
    const student = getStudentById(studentId)
    return student ? student.name : "Unknown Student"
  }

  const filteredResults = allResults.filter((result) => {
    const matchesSearch =
      searchQuery === "" ||
      result.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getStudentName(result.studentId).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStage = examStageFilter === "all" || result.examStage === examStageFilter
    return matchesSearch && matchesStage
  })

  const handleViewReport = () => {
    toast({ title: "Viewing Report", description: "Opening Perpusmu report in a new window." })
  }

  const handleDownload = () => {
    toast({ title: "Downloading Document", description: "The document is being downloaded." })
  }

  const handleReviewOpen = (result: TurnitinResult) => {
    setSelectedResult(result)
    setReviewComment(result.comments || "")
    setReviewDialogOpen(true)
  }

  const handleTransferOpen = (result: TurnitinResult) => {
    setSelectedResult(result)
    setTransferDialogOpen(true)
  }

  const handleReviewSubmit = () => {
    if (!selectedResult) return
    reviewTurnitinResult(selectedResult.id, reviewComment)
    toast({ title: "Review Submitted", description: "The Perpusmu result has been reviewed successfully." })
    setReviewDialogOpen(false)
    setReviewComment("")
  }

  const handleFileUpload = () => {
    if (!uploadFile || !uploadStudentId) return
    const newResult = {
      studentId: uploadStudentId,
      examStage: uploadExamStage,
      documentTitle: uploadFile.name,
      similarityScore: Math.floor(Math.random() * 40),
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      status: "pending" as const,
      reportUrl: `/reports/${uploadStudentId}/${uploadExamStage}/${Date.now()}`,
      documentUrl: `/documents/${uploadStudentId}/${uploadExamStage}/${Date.now()}`,
      comments: null,
    }
    addTurnitinResult(newResult)
    toast({ title: "File Uploaded", description: "The document has been uploaded and processed successfully." })
    setUploadDialogOpen(false)
    setUploadFile(null)
    setUploadStudentId("")
  }

  const handleTransferResult = () => {
    if (!selectedResult) return
    transferTurnitinResult(selectedResult.id, transferTargetStage)
    toast({
      title: "Result Transferred",
      description: `The Perpusmu result has been transferred to the ${formatExamStage(transferTargetStage)}.`,
    })
    setTransferDialogOpen(false)
  }

  if (!instructor) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Instructor Not Found</h2>
        <p className="text-muted-foreground">The requested instructor could not be found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/admin/instructors")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Instructors
        </Button>
      </div>
    )
  }

  const tableProps = {
    results: filteredResults,
    formatDate,
    formatExamStage,
    getStudentName,
    onViewReport: handleViewReport,
    onDownload: handleDownload,
    onReview: handleReviewOpen,
    onTransfer: handleTransferOpen,
  } as const

  return (
    <PageTransition>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Perpusmu Results Management</CardTitle>
              <CardDescription>Upload, review, and manage Perpusmu results for students</CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload New Result
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <ResultsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              examStageFilter={examStageFilter}
              onExamStageFilterChange={setExamStageFilter}
            />

            <TabsContent value="all">
              <ResultsTable {...tableProps} variant="all" />
            </TabsContent>
            <TabsContent value="pending">
              <ResultsTable {...tableProps} variant="pending" />
            </TabsContent>
            <TabsContent value="reviewed">
              <ResultsTable {...tableProps} variant="reviewed" />
            </TabsContent>
            <TabsContent value="flagged">
              <ResultsTable {...tableProps} variant="flagged" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        selectedResult={selectedResult}
        reviewComment={reviewComment}
        onReviewCommentChange={setReviewComment}
        onSubmit={handleReviewSubmit}
        formatExamStage={formatExamStage}
        getStudentName={getStudentName}
      />

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        students={students}
        uploadStudentId={uploadStudentId}
        onUploadStudentIdChange={setUploadStudentId}
        uploadExamStage={uploadExamStage}
        onUploadExamStageChange={setUploadExamStage}
        uploadFile={uploadFile}
        onUploadFileChange={setUploadFile}
        onSubmit={handleFileUpload}
      />

      <TransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        selectedResult={selectedResult}
        transferTargetStage={transferTargetStage}
        onTransferTargetStageChange={setTransferTargetStage}
        onSubmit={handleTransferResult}
        formatExamStage={formatExamStage}
      />
    </PageTransition>
  )
}

