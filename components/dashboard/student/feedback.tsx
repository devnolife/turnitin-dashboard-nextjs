import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, ThumbsUp, AlertCircle } from "lucide-react"

export function StudentFeedback() {
  const feedback = [
    {
      id: "FB-001",
      document: "Research Paper on AI Ethics",
      instructor: "Dr. Smith",
      date: "Apr 12, 2025",
      type: "Comment",
      content: "Excellent analysis of ethical implications. Consider expanding on the privacy section.",
    },
    {
      id: "FB-002",
      document: "Literary Analysis: Hamlet",
      instructor: "Prof. Johnson",
      date: "Apr 7, 2025",
      type: "Praise",
      content:
        "Strong thesis statement and well-structured arguments. Your analysis of the character motivations is particularly insightful.",
    },
    {
      id: "FB-003",
      document: "Economic Theory Essay",
      instructor: "Dr. Williams",
      date: "Mar 18, 2025",
      type: "Suggestion",
      content:
        "Your application of the theory is correct, but you should include more recent examples to strengthen your argument.",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Feedback</CardTitle>
        <CardDescription>Feedback received on your submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <div>
                  <div className="font-medium">{item.document}</div>
                  <div className="text-sm text-muted-foreground">
                    From {item.instructor} • {item.date}
                  </div>
                </div>
                <Badge
                  variant={item.type === "Praise" ? "default" : item.type === "Comment" ? "secondary" : "outline"}
                  className="mt-2 sm:mt-0"
                >
                  {item.type === "Praise" && <ThumbsUp className="mr-1 h-3 w-3" />}
                  {item.type === "Comment" && <MessageSquare className="mr-1 h-3 w-3" />}
                  {item.type === "Suggestion" && <AlertCircle className="mr-1 h-3 w-3" />}
                  {item.type}
                </Badge>
              </div>
              <p className="mt-2 text-sm">{item.content}</p>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

