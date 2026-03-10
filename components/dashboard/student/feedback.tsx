import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, ThumbsUp, AlertCircle } from "lucide-react"

export function StudentFeedback() {
  const feedback = [
    {
      id: "FB-001",
      document: "Skripsi Bab 1 - Pendahuluan",
      instructor: "Instruktur Ahmad",
      date: "12 Apr 2025",
      type: "Hasil",
      content: "hasil Perpusmu menunjukkan similarity 12%. Dokumen Anda sudah memenuhi standar. Silakan lanjutkan ke bab berikutnya.",
    },
    {
      id: "FB-002",
      document: "Skripsi Bab 2 - Tinjauan Pustaka",
      instructor: "Instruktur Ahmad",
      date: "7 Apr 2025",
      type: "Revisi",
      content:
        "Similarity masih 35%. Perlu revisi pada bagian kajian teori. Harap parafrasa ulang referensi yang di-highlight.",
    },
    {
      id: "FB-003",
      document: "Proposal Penelitian",
      instructor: "Instruktur Budi",
      date: "18 Mar 2025",
      type: "Hasil",
      content:
        "Similarity 8%. Dokumen sudah baik. hasil Perpusmu sudah dilampirkan, silakan unduh.",
    },
  ]

  return (
    <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Umpan Balik Terbaru</CardTitle>
        <CardDescription>hasil Perpusmu dan komentar dari instruktur</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4">
              <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <div>
                  <div className="font-medium">{item.document}</div>
                  <div className="text-sm text-muted-foreground">
                    Dari {item.instructor} • {item.date}
                  </div>
                </div>
                <Badge
                  variant={item.type === "Hasil" ? "default" : "secondary"}
                  className="mt-2 sm:mt-0"
                >
                  {item.type === "Hasil" && <ThumbsUp className="mr-1 h-3 w-3" />}
                  {item.type === "Revisi" && <AlertCircle className="mr-1 h-3 w-3" />}
                  {item.type}
                </Badge>
              </div>
              <p className="mt-2 text-sm">{item.content}</p>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Balas
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

