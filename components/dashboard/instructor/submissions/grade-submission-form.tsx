"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"

interface GradeSubmissionFormProps {
  submissionId: string
  studentName: string
  assignmentTitle: string
  maxPoints: number
  onSuccess: () => void
  onCancel: () => void
}

export function GradeSubmissionForm({
  submissionId,
  studentName,
  assignmentTitle,
  maxPoints,
  onSuccess,
  onCancel,
}: GradeSubmissionFormProps) {
  const { toast } = useToast()
  const [score, setScore] = useState(maxPoints * 0.8) // Default to 80%
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you would save the grade to your backend
      toast({
        title: "Pengiriman ditinjau",
        description: `Anda telah meninjau pengiriman ${studentName} dengan skor ${score}/${maxPoints}.`,
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error menyimpan review",
        description: "Terjadi kesalahan saat menyimpan review. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Pengiriman</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Student: {studentName}</p>
            <p className="text-sm font-medium">Assignment: {assignmentTitle}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="score">Score</Label>
              <span className="text-sm font-medium">
                {Math.round(score)}/{maxPoints}
              </span>
            </div>
            <Slider
              id="score"
              min={0}
              max={maxPoints}
              step={1}
              value={[score]}
              onValueChange={(values) => setScore(values[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide detailed feedback to the student..."
              className="min-h-[150px]"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

