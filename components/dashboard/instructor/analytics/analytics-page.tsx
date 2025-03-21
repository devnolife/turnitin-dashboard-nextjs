"use client"

import { useState } from "react"

export function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("semester")
  const [courses, setCourses]

