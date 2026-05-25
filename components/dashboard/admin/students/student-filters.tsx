"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useStudentStore } from "@/lib/store/student-store"
import { useFacultyStore } from "@/lib/store/faculty-store"

export function StudentFilters() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const {
    searchQuery,
    prodiFilter,
    setSearchQuery,
    setProdiFilter,
    fetchStudents,
  } = useStudentStore()

  const { faculties, programs, fetchFaculties } = useFacultyStore()

  useEffect(() => {
    fetchFaculties()
  }, [fetchFaculties])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // When debounced search changes, update store and fetch
  useEffect(() => {
    setSearchQuery(debouncedSearch)
    fetchStudents()
  }, [debouncedSearch, setSearchQuery, fetchStudents])

  const handleProdiChange = useCallback((value: string) => {
    setProdiFilter(value === "all" ? "" : value)
    fetchStudents()
  }, [setProdiFilter, fetchStudents])

  const uniqueProdi = Array.from(new Set(programs.map((p) => p.name))).sort()

  const activeFilters: string[] = []
  if (searchQuery) activeFilters.push(`Search: ${searchQuery}`)
  if (prodiFilter) activeFilters.push(`Prodi: ${prodiFilter}`)

  const clearFilters = () => {
    setSearchInput("")
    setSearchQuery("")
    setProdiFilter("")
    fetchStudents()
  }

  const clearFilter = (filter: string) => {
    if (filter.startsWith("Search:")) {
      setSearchInput("")
      setSearchQuery("")
    } else if (filter.startsWith("Prodi:")) {
      setProdiFilter("")
    }
    fetchStudents()
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari mahasiswa..."
                className="pl-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={prodiFilter || "all"} onValueChange={handleProdiChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Program Studi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Program Studi</SelectItem>
                  {uniqueProdi.map((prodi) => (
                    <SelectItem key={prodi} value={prodi}>
                      {prodi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center">
                <Filter className="mr-2 size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active filters:</span>
              </div>
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-4 p-0 hover:bg-transparent"
                    onClick={() => clearFilter(filter)}
                  >
                    <X className="size-3" />
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

