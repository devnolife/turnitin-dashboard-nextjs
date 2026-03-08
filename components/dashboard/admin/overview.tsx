import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function AdminOverview() {
  const userGrowthData = [
    { month: "Jan", students: 2100, instructors: 180 },
    { month: "Feb", students: 2200, instructors: 190 },
    { month: "Mar", students: 2350, instructors: 205 },
    { month: "Apr", students: 2450, instructors: 215 },
    { month: "May", students: 2584, instructors: 225 },
  ]

  const revenueData = [
    { month: "Jan", revenue: 110000 },
    { month: "Feb", revenue: 118000 },
    { month: "Mar", revenue: 125000 },
    { month: "Apr", revenue: 134500 },
    { month: "May", revenue: 142384 },
  ]

  const submissionData = [
    { month: "Jan", submissions: 15200 },
    { month: "Feb", submissions: 16100 },
    { month: "Mar", submissions: 16800 },
    { month: "Apr", submissions: 17550 },
    { month: "May", submissions: 18392 },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Monthly user growth by role</CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-80">
          <ChartContainer
            config={{
              visitors: {
                label: "Visitors",
              },
              students: {
                label: "Students",
                color: "hsl(209, 51%, 53%)",
              },
              instructors: {
                label: "Instructors",
                color: "hsl(218, 70%, 19%)",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="var(--color-students)" strokeWidth={2} />
                <Line type="monotone" dataKey="instructors" stroke="var(--color-instructors)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Monthly revenue in USD</CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-80">
          <ChartContainer
            config={{
              visitors: {
                label: "Visitors",
              },
              revenue: {
                label: "Revenue",
                color: "hsl(209, 51%, 53%)",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>Monthly submission count</CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-80">
          <ChartContainer
            config={{
              visitors: {
                label: "Visitors",
              },
              submissions: {
                label: "Submissions",
                color: "hsl(214, 67%, 33%)",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="submissions" fill="var(--color-submissions)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

