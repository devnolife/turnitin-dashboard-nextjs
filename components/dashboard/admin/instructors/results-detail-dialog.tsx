"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type TurnitinResult, type ExamStage } from "@/lib/store/student-store"

export interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedResult: TurnitinResult | null
  reviewComment: string
  onReviewCommentChange: (value: string) => void
  onSubmit: () => void
  formatExamStage: (stage: ExamStage) => string
  getStudentName: (studentId: string) => string
}

export function ReviewDialog({
  open,
  onOpenChange,
  selectedResult,
  reviewComment,
  onReviewCommentChange,
  onSubmit,
  formatExamStage,
  getStudentName,
}: ReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={(e) => onReviewCommentChange(e.target.value)}
                rows={5}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Submit Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Array<{ id: string; name: string }>
  uploadStudentId: string
  onUploadStudentIdChange: (value: string) => void
  uploadExamStage: ExamStage
  onUploadExamStageChange: (value: ExamStage) => void
  uploadFile: File | null
  onUploadFileChange: (file: File | null) => void
  onSubmit: () => void
}

export function UploadDialog({
  open,
  onOpenChange,
  students,
  uploadStudentId,
  onUploadStudentIdChange,
  uploadExamStage,
  onUploadExamStageChange,
  uploadFile,
  onUploadFileChange,
  onSubmit,
}: UploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Turnitin Result</DialogTitle>
          <DialogDescription>Upload a new document to check for similarity.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select value={uploadStudentId} onValueChange={onUploadStudentIdChange}>
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
            <Select value={uploadExamStage} onValueChange={(value) => onUploadExamStageChange(value as ExamStage)}>
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
                    onUploadFileChange(e.target.files[0])
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!uploadFile || !uploadStudentId}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedResult: TurnitinResult | null
  transferTargetStage: ExamStage
  onTransferTargetStageChange: (value: ExamStage) => void
  onSubmit: () => void
  formatExamStage: (stage: ExamStage) => string
}

export function TransferDialog({
  open,
  onOpenChange,
  selectedResult,
  transferTargetStage,
  onTransferTargetStageChange,
  onSubmit,
  formatExamStage,
}: TransferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onValueChange={(value) => onTransferTargetStageChange(value as ExamStage)}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
