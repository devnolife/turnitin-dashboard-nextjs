"use client"

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ChartDataItem {
  name: string
  value: number
  color: string
}

interface SubmissionDataItem {
  name: string
  submissions: number
}

interface DashboardAnalyticsProps {
  submissionData: SubmissionDataItem[]
  studentsByExamStage: ChartDataItem[]
  similarityDistribution: ChartDataItem[]
}

export function DashboardAnalytics({
  submissionData,
  studentsByExamStage,
  similarityDistribution,
}: DashboardAnalyticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Submissions Over Time</CardTitle>
          <CardDescription>Weekly submission trends</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer
            config={{
              submissions: {
                label: "Submissions",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={submissionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="submissions" fill="var(--color-submissions)" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Student Distribution</CardTitle>
          <CardDescription>Students by exam stage</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={studentsByExamStage}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {studentsByExamStage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Similarity Distribution</CardTitle>
          <CardDescription>Perpusmu similarity scores</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={similarityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {similarityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} submissions`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>Overall performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Average Similarity Score</span>
                <span className="text-sm font-medium">18%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "18%" }}></div>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Submission Rate</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary-dark" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Feedback Response Rate</span>
                <span className="text-sm font-medium">72%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "72%" }}></div>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">On-time Submission Rate</span>
                <span className="text-sm font-medium">68%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: "68%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
