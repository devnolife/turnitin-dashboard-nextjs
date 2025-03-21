import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function InstructorOverview() {
  const submissionData = [
    { name: "Week 1", submissions: 42 },
    { name: "Week 2", submissions: 58 },
    { name: "Week 3", submissions: 75 },
    { name: "Week 4", submissions: 63 },
    { name: "Week 5", submissions: 82 },
    { name: "Week 6", submissions: 70 },
  ]

  const similarityData = [
    { name: "0-10%", value: 45, color: "#10b981" },
    { name: "11-20%", value: 30, color: "#0ea5e9" },
    { name: "21-30%", value: 15, color: "#f59e0b" },
    { name: "31%+", value: 10, color: "#ef4444" },
  ]

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
              <BarChart data={submissionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="submissions" fill="var(--color-submissions)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Similarity Distribution</CardTitle>
          <CardDescription>Percentage of submissions by similarity score</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={similarityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {similarityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} submissions`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Course Overview</CardTitle>
          <CardDescription>Submission statistics by course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="font-medium">Computer Science 101</div>
                <div className="mt-1 text-2xl font-bold">42</div>
                <div className="text-sm text-muted-foreground">Students</div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">124</span> submissions
                </div>
                <div className="text-sm">
                  <span className="font-medium">18%</span> avg. similarity
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="font-medium">Data Science 202</div>
                <div className="mt-1 text-2xl font-bold">38</div>
                <div className="text-sm text-muted-foreground">Students</div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">96</span> submissions
                </div>
                <div className="text-sm">
                  <span className="font-medium">15%</span> avg. similarity
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="font-medium">AI Ethics 301</div>
                <div className="mt-1 text-2xl font-bold">28</div>
                <div className="text-sm text-muted-foreground">Students</div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">84</span> submissions
                </div>
                <div className="text-sm">
                  <span className="font-medium">12%</span> avg. similarity
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

