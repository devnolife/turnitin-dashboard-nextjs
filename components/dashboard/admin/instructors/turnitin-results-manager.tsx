"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { PageTransition } from "@/components/ui/motion"
import { FileText } from "lucide-react"

interface TurnitinResultsManagerProps {
  instructorId: string
}

export function TurnitinResultsManager({ instructorId }: TurnitinResultsManagerProps) {
  const router = useRouter()
  const { toast } = useToast()

  return (
    <PageTransition>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Perpusmu Results Management</CardTitle>
              <CardDescription>View and manage Perpusmu similarity check results</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-xl font-medium">No Results Available</h3>
            <p className="mt-2 text-muted-foreground max-w-md">
              Perpusmu results will appear here when students submit documents for similarity checking.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/admin/instructors")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Instructors
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}

