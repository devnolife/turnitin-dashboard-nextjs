"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface ResultsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  examStageFilter: string
  onExamStageFilterChange: (value: string) => void
}

export function ResultsFilters({
  searchQuery,
  onSearchChange,
  examStageFilter,
  onExamStageFilterChange,
}: ResultsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <TabsList>
        <TabsTrigger value="all">All Results</TabsTrigger>
        <TabsTrigger value="pending">Pending Review</TabsTrigger>
        <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        <TabsTrigger value="flagged">Flagged</TabsTrigger>
      </TabsList>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search results..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={examStageFilter} onValueChange={onExamStageFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filter by Stage</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="proposal_exam">Proposal Exam</SelectItem>
            <SelectItem value="results_exam">Results Exam</SelectItem>
            <SelectItem value="final_exam">Final Exam</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
