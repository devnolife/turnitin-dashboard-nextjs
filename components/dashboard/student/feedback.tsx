"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, AlertCircle, Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"

interface FeedbackItem {
  id: string
  title: string
  date: string
  similarity: number
  feedback: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  rawStatus: string
}

export function StudentFeedback() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFeedback() {
      if (!user?.id) return
      try {
        const res = await fetch(`/api/submissions?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          const reviewed = (data.submissions || []).filter(
            (s: { rawStatus: string }) => s.rawStatus === "REVIEWED" || s.rawStatus === "FLAGGED"
          )
          setItems(reviewed.slice(0, 5))
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeedback()
  }, [user?.id])

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Umpan Balik Terbaru</CardTitle>
          <CardDescription>Hasil Perpusmu dan komentar dari instruktur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Memuat...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Umpan Balik Terbaru</CardTitle>
        <CardDescription>Hasil Perpusmu dan komentar dari instruktur</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada umpan balik dari instruktur.</p>
          ) : (
            items.map((item) => {
              const type = item.rawStatus === "FLAGGED" ? "Revisi" : "Hasil"
              return (
                <div key={item.id} className="rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4">
                  <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.reviewedBy ? `Dari ${item.reviewedBy}` : "Instruktur"} • {item.reviewedAt || item.date}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Badge
                        variant={type === "Hasil" ? "default" : "secondary"}
                      >
                        {type === "Hasil" && <ThumbsUp className="mr-1 h-3 w-3" />}
                        {type === "Revisi" && <AlertCircle className="mr-1 h-3 w-3" />}
                        {type}
                      </Badge>
                      {item.similarity > 0 && (
                        <Badge variant={
                          item.similarity < 15 ? "outline" : item.similarity < 30 ? "secondary" : "destructive"
                        }>
                          {item.similarity}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.feedback && (
                    <p className="mt-2 text-sm rounded-xl bg-muted/50 p-3">{item.feedback}</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

