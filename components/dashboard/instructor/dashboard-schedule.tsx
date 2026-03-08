"use client"

import { Users, BookOpen, Clock, Info, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface ScheduleEvent {
  id: number
  title: string
  description: string
  date: string
  location: string
  type: string
}

interface DashboardScheduleProps {
  events: ScheduleEvent[]
}

export function DashboardSchedule({ events }: DashboardScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Your schedule and deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="flex items-start space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                {event.type === "defense" && <FileCheck className="h-6 w-6 text-primary-dark" />}
                {event.type === "meeting" && <Users className="h-6 w-6 text-primary" />}
                {event.type === "deadline" && <Clock className="h-6 w-6 text-amber-500" />}
                {event.type === "lecture" && <BookOpen className="h-6 w-6 text-green-500" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge
                    variant={
                      event.type === "defense"
                        ? "default"
                        : event.type === "meeting"
                          ? "secondary"
                          : event.type === "deadline"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {event.date}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Info className="mr-1 h-3 w-3" />
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Calendar
        </Button>
      </CardFooter>
    </Card>
  )
}
