"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type ExamStage, useStudentStore } from "@/lib/store/student-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { useInstructorStore } from "@/lib/store/instructor-store"

export function StudentFilters() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const {
    facultyFilter,
    programFilter,
    examStageFilter,
    instructorFilter,
    setFacultyFilter,
    setProgramFilter,
    setExamStageFilter,
    setSearchQuery: setStoreSearchQuery,
    setInstructorFilter,
  } = useStudentStore()

  const { faculties } = useFacultyStore()
  const { instructors } = useInstructorStore()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update store search query when debounced query changes
  useEffect(() => {
    setStoreSearchQuery(debouncedSearchQuery)
  }, [debouncedSearchQuery, setStoreSearchQuery])

  // Update active filters when filters change
  useEffect(() => {
    const filters: string[] = []

    if (facultyFilter) {
      const faculty = faculties.find((f) => f.id === facultyFilter)
      if (faculty) {
        filters.push(`Faculty: ${faculty.name}`)
      }
    }

    if (programFilter) {
      for (const faculty of faculties) {
        const program = faculty.programs.find((p) => p.id === programFilter)
        if (program) {
          filters.push(`Program: ${program.name}`)
          break
        }
      }
    }

    if (examStageFilter !== "all") {
      filters.push(`Stage: ${formatExamStage(examStageFilter as ExamStage)}`)
    }

    if (instructorFilter) {
      const instructor = instructors.find((i) => i.id === instructorFilter)
      if (instructor) {
        filters.push(`Instructor: ${instructor.name}`)
      }
    }

    setActiveFilters(filters)
  }, [facultyFilter, programFilter, examStageFilter, instructorFilter, faculties, instructors])

  // Format exam stage for display
  const formatExamStage = (stage: ExamStage) => {
    switch (stage) {
      case "applicant":
        return "Applicant"
      case "proposal_exam":
        return "Proposal Exam"
      case "results_exam":
        return "Results Exam"
      case "final_exam":
        return "Final Exam"
      case "graduated":
        return "Graduated"
      default:
        return stage
    }
  }

  // Get programs for selected faculty
  const getPrograms = () => {
    if (!facultyFilter) return []
    const faculty = faculties.find((f) => f.id === facultyFilter)
    return faculty ? faculty.programs : []
  }

  // Clear all filters
  const clearFilters = () => {
    setFacultyFilter(null)
    setProgramFilter(null)
    setExamStageFilter("all")
    setInstructorFilter(null)
    setSearchQuery("")
    setDebouncedSearchQuery("")
  }

  // Clear specific filter
  const clearFilter = (filter: string) => {
    if (filter.startsWith("Faculty:")) {
      setFacultyFilter(null)
      setProgramFilter(null) // Also clear program filter when faculty is cleared
    } else if (filter.startsWith("Program:")) {
      setProgramFilter(null)
    } else if (filter.startsWith("Stage:")) {
      setExamStageFilter("all")
    } else if (filter.startsWith("Instructor:")) {
      setInstructorFilter(null)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={facultyFilter || ""} onValueChange={(value) => setFacultyFilter(value || null)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={programFilter || ""}
                onValueChange={(value) => setProgramFilter(value || null)}
                disabled={!facultyFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {getPrograms().map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={examStageFilter} onValueChange={(value) => setExamStageFilter(value as ExamStage | "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Exam Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="applicant">Applicant</SelectItem>
                  <SelectItem value="proposal_exam">Proposal Exam</SelectItem>
                  <SelectItem value="results_exam">Results Exam</SelectItem>
                  <SelectItem value="final_exam">Final Exam</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={instructorFilter || ""} onValueChange={(value) => setInstructorFilter(value || null)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Instructors</SelectItem>
                  {instructors
                    .filter((i) => i.status === "active")
                    .map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active filters:</span>
              </div>
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => clearFilter(filter)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {filter} filter</span>
                  </Button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

