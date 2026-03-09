"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Download } from "lucide-react"
import { useSubmissionStore } from "@/lib/store/submission-store"
import { Skeleton } from "@/components/ui/skeleton"

export function StudentSubmissions() {
  const { submissions, isLoading, error, fetchUserSubmissions } = useSubmissionStore()

  useEffect(() => {
    fetchUserSubmissions()
  }, [fetchUserSubmissions])

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Dokumen Saya</CardTitle>
          <CardDescription>Dokumen yang telah Anda kirimkan untuk dicek Turnitin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start justify-between gap-2 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:flex-row sm:items-center"
                >
                  <div className="grid gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                    <div className="mt-1 flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Dokumen Saya</CardTitle>
          <CardDescription>Dokumen yang telah Anda kirimkan untuk dicek Turnitin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-red-800 dark:text-red-300">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchUserSubmissions()}>
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Dokumen Saya</CardTitle>
        <CardDescription>Dokumen yang telah Anda kirimkan untuk dicek Turnitin</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Anda belum mengirimkan dokumen apapun.</p>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex flex-col items-start justify-between gap-2 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:flex-row sm:items-center"
              >
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{submission.title}</span>
                    <Badge variant={
                      submission.status === "Graded" ? "default" :
                      submission.status === "Menunggu Upload" ? "secondary" :
                      submission.status === "Diproses Instruktur" ? "outline" :
                      "secondary"
                    }>
                      {submission.status === "Graded" ? "Hasil Diterima" : submission.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dikirim pada {submission.date}
                  </div>
                  {submission.similarity > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm">Similarity:</span>
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
                    </div>
                  )}
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat
                  </Button>
                  {submission.status === "Graded" && (
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Unduh Hasil
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

