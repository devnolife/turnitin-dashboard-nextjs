"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Upload,
  Eye,
  Download,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type TurnitinResult, type ExamStage, useStudentStore } from "@/lib/store/student-store"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition } from "@/components/ui/motion"

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
  const { faculties } = useFacultyStore()

  const instructor = getInstructorById(instructorId)
  const students = getStudentsByInstructor(instructorId)
  const allResults = getTurnitinResultsByInstructor(instructorId)

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not reviewed"

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format exam stage for display
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

  // Get student name by ID
  const getStudentName = (studentId: string) => {
    const student = getStudentById(studentId)
    return student ? student.name : "Unknown Student"
  }

  // Filter results based on search and exam stage
  const filteredResults = allResults.filter((result) => {
    const matchesSearch =
      searchQuery === "" ||
      result.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getStudentName(result.studentId).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStage = examStageFilter === "all" || result.examStage === examStageFilter

    return matchesSearch && matchesStage
  })

  // Handle review submission
  const handleReviewSubmit = () => {
    if (!selectedResult) return

    reviewTurnitinResult(selectedResult.id, reviewComment)

    toast({
      title: "Review Submitted",
      description: "The Turnitin result has been reviewed successfully.",
    })

    setReviewDialogOpen(false)
    setReviewComment("")
  }

  // Handle file upload
  const handleFileUpload = () => {
    if (!uploadFile || !uploadStudentId) return

    // In a real app, this would upload the file to a server
    // For now, we'll just simulate adding a new result
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

    toast({
      title: "File Uploaded",
      description: "The document has been uploaded and processed successfully.",
    })

    setUploadDialogOpen(false)
    setUploadFile(null)
    setUploadStudentId("")
  }

  // Handle result transfer
  const handleTransferResult = () => {
    if (!selectedResult) return

    transferTurnitinResult(selectedResult.id, transferTargetStage)

    toast({
      title: "Result Transferred",
      description: `The Turnitin result has been transferred to the ${formatExamStage(transferTargetStage)}.`,
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

  return (
    <PageTransition>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Turnitin Results Management</CardTitle>
              <CardDescription>Upload, review, and manage Turnitin results for students</CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload New Result
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search results..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={examStageFilter} onValueChange={setExamStageFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Filter by Stage</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="proposal_exam">Proposal Exam</SelectItem>
                    <SelectItem value="results_exam">Results Exam</SelectItem>
                    <SelectItem value="final_exam">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam Stage</TableHead>
                      <TableHead>Similarity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.length > 0 ? (
                      filteredResults.map((result) => (
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
                                result.similarityScore < 15
                                  ? "outline"
                                  : result.similarityScore < 30
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {result.similarityScore}%
                            </Badge>
                          </TableCell>
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
                          <TableCell>{formatDate(result.submittedAt)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  // View report
                                  toast({
                                    title: "Viewing Report",
                                    description: "Opening Turnitin report in a new window.",
                                  })
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Report</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  // Download document
                                  toast({
                                    title: "Downloading Document",
                                    description: "The document is being downloaded.",
                                  })
                                }}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedResult(result)
                                  setReviewComment(result.comments || "")
                                  setReviewDialogOpen(true)
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span className="sr-only">Review</span>
                              </Button>

                              {result.examStage === "proposal_exam" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedResult(result)
                                    setTransferDialogOpen(true)
                                  }}
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
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-center">
                            <FileText className="h-8 w-8 text-muted-foreground/40" />
                            <h3 className="mt-2 text-lg font-medium">No Results Found</h3>
                            <p className="text-sm text-muted-foreground">
                              No Turnitin results match your search criteria.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam Stage</TableHead>
                      <TableHead>Similarity</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.filter((r) => r.status === "pending").length > 0 ? (
                      filteredResults
                        .filter((r) => r.status === "pending")
                        .map((result) => (
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
                                  result.similarityScore < 15
                                    ? "outline"
                                    : result.similarityScore < 30
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {result.similarityScore}%
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(result.submittedAt)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    // View report
                                    toast({
                                      title: "Viewing Report",
                                      description: "Opening Turnitin report in a new window.",
                                    })
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Report</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedResult(result)
                                    setReviewComment("")
                                    setReviewDialogOpen(true)
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="sr-only">Review</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-center">
                            <CheckCircle className="h-8 w-8 text-muted-foreground/40" />
                            <h3 className="mt-2 text-lg font-medium">No Pending Reviews</h3>
                            <p className="text-sm text-muted-foreground">All Turnitin results have been reviewed.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="reviewed">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam Stage</TableHead>
                      <TableHead>Similarity</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.filter((r) => r.status === "reviewed").length > 0 ? (
                      filteredResults
                        .filter((r) => r.status === "reviewed")
                        .map((result) => (
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
                                  result.similarityScore < 15
                                    ? "outline"
                                    : result.similarityScore < 30
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {result.similarityScore}%
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(result.reviewedAt)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    // View report
                                    toast({
                                      title: "Viewing Report",
                                      description: "Opening Turnitin report in a new window.",
                                    })
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Report</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedResult(result)
                                    setReviewComment(result.comments || "")
                                    setReviewDialogOpen(true)
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="sr-only">Edit Review</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-center">
                            <FileText className="h-8 w-8 text-muted-foreground/40" />
                            <h3 className="mt-2 text-lg font-medium">No Reviewed Results</h3>
                            <p className="text-sm text-muted-foreground">No Turnitin results have been reviewed yet.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="flagged">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam Stage</TableHead>
                      <TableHead>Similarity</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.filter((r) => r.status === "flagged").length > 0 ? (
                      filteredResults
                        .filter((r) => r.status === "flagged")
                        .map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div className="font-medium">{result.documentTitle}</div>
                            </TableCell>
                            <TableCell>{getStudentName(result.studentId)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{formatExamStage(result.examStage)}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">{result.similarityScore}%</Badge>
                            </TableCell>
                            <TableCell>{formatDate(result.submittedAt)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    // View report
                                    toast({
                                      title: "Viewing Report",
                                      description: "Opening Turnitin report in a new window.",
                                    })
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Report</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedResult(result)
                                    setReviewComment(result.comments || "")
                                    setReviewDialogOpen(true)
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="sr-only">Review</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground/40" />
                            <h3 className="mt-2 text-lg font-medium">No Flagged Results</h3>
                            <p className="text-sm text-muted-foreground">
                              No Turnitin results have been flagged for review.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Turnitin Result</DialogTitle>
            <DialogDescription>Provide feedback on the similarity report for this document.</DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Document</h3>
                  <Badge
                    variant={
                      selectedResult.similarityScore < 15
                        ? "outline"
                        : selectedResult.similarityScore < 30
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedResult.similarityScore}% Similarity
                  </Badge>
                </div>
                <p className="text-sm">{selectedResult.documentTitle}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Student</h3>
                <p className="text-sm">{getStudentName(selectedResult.studentId)}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Exam Stage</h3>
                <p className="text-sm">{formatExamStage(selectedResult.examStage)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Review Comments</Label>
                <Textarea
                  id="comment"
                  placeholder="Provide feedback on the similarity report..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Turnitin Result</DialogTitle>
            <DialogDescription>Upload a new document to check for similarity.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={uploadStudentId} onValueChange={setUploadStudentId}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examStage">Exam Stage</Label>
              <Select value={uploadExamStage} onValueChange={(value) => setUploadExamStage(value as ExamStage)}>
                <SelectTrigger id="examStage">
                  <SelectValue placeholder="Select exam stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal_exam">Proposal Exam</SelectItem>
                  <SelectItem value="results_exam">Results Exam</SelectItem>
                  <SelectItem value="final_exam">Final Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Document</Label>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="file" className="sr-only">
                  Document
                </Label>
                <Input
                  id="file"
                  type="file"
                  className="cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadFile(e.target.files[0])
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a document to check for similarity (PDF, DOCX, or TXT).
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFileUpload} disabled={!uploadFile || !uploadStudentId}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Turnitin Result</DialogTitle>
            <DialogDescription>Transfer this result to another exam stage.</DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Document</h3>
                <p className="text-sm">{selectedResult.documentTitle}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Exam Stage</h3>
                <p className="text-sm">{formatExamStage(selectedResult.examStage)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetStage">Target Exam Stage</Label>
                <Select
                  value={transferTargetStage}
                  onValueChange={(value) => setTransferTargetStage(value as ExamStage)}
                >
                  <SelectTrigger id="targetStage">
                    <SelectValue placeholder="Select target stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="results_exam">Results Exam</SelectItem>
                    <SelectItem value="final_exam">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferResult}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

