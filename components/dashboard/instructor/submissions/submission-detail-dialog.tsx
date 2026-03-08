"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SubmissionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSubmission: any | null
  feedbackText: string
  onFeedbackTextChange: (text: string) => void
  onSubmitFeedback: () => void
  formatDate: (dateString: string) => string
}

export function SubmissionDetailDialog({
  open,
  onOpenChange,
  selectedSubmission,
  feedbackText,
  onFeedbackTextChange,
  onSubmitFeedback,
  formatDate,
}: SubmissionDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            Add your feedback for this submission. The student will be able to view your comments.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {selectedSubmission && (
            <div className="rounded-md border p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="font-medium">{selectedSubmission.documentTitle}</div>
                <Badge
                  variant={
                    selectedSubmission.similarityScore < 15
                      ? "outline"
                      : selectedSubmission.similarityScore < 30
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {selectedSubmission.similarityScore}% Similarity
                </Badge>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Submitted by {selectedSubmission.studentName} on {formatDate(selectedSubmission.submittedAt)}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Enter your feedback here..."
              value={feedbackText}
              onChange={(e) => onFeedbackTextChange(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmitFeedback}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
