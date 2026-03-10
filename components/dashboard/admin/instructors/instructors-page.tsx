"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useInstructorStore } from "@/lib/store/instructor-store"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { Shield } from "lucide-react"
import { InstructorsStats } from "./instructors-stats"
import { InstructorsTable } from "./instructors-table"

export function AdminInstructorsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const router = useRouter()

  const {
    filteredInstructors,
    isLoading,
    fetchInstructors,
    setSearchQuery,
    setFacultyFilter,
    setProgramFilter,
    setPositionFilter,
    setStatusFilter,
    setSortBy,
    facultyFilter,
    programFilter,
    positionFilter,
    statusFilter,
    getStudentCountByInstructor,
  } = useInstructorStore()

  const { faculties } = useFacultyStore()

  useEffect(() => {
    fetchInstructors()
  }, [fetchInstructors])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInstructors.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage)

  // Get programs for selected faculty
  const availablePrograms = facultyFilter ? faculties.find((f) => f.id === facultyFilter)?.programs || [] : []

  // Format position for display
  const formatPosition = (position: string) => {
    return position
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "inactive":
        return "secondary"
      case "on_leave":
        return "warning"
      default:
        return "outline"
    }
  }

  // Get faculty name
  const getFacultyName = (facultyId: string) => {
    return faculties.find((f) => f.id === facultyId)?.name || "Fakultas Tidak Diketahui"
  }

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page on search
  }

  // Handle view instructor details
  const handleViewInstructor = (instructorId: string) => {
    router.push(`/dashboard/admin/instructors/${instructorId}`)
  }

  // Handle add new instructor
  const handleAddInstructor = () => {
    router.push("/dashboard/admin/instructors/new")
  }

  // Reset all filters
  const handleResetFilters = () => {
    setFacultyFilter(null)
    setProgramFilter(null)
    setPositionFilter(null)
    setStatusFilter(null)
    setSearchQuery("")
    setCurrentPage(1)
  }

  // Calculate statistics
  const totalInstructors = filteredInstructors.length
  const activeInstructors = filteredInstructors.filter((i) => i.status === "active").length
  const onLeaveInstructors = filteredInstructors.filter((i) => i.status === "on_leave").length
  const professorsCount = filteredInstructors.filter((i) => i.position === "professor").length

  return (
    <PageTransition>
      <DashboardMainCard title="Manajemen Instruktur" subtitle="Kelola instruktur pengawas dan pantau mahasiswa yang diawasi 🛡️" icon={Shield}>
        <InstructorsStats
          totalInstructors={totalInstructors}
          activeInstructors={activeInstructors}
          facultiesCount={faculties.length}
          professorsCount={professorsCount}
          onLeaveInstructors={onLeaveInstructors}
        />

        <InstructorsTable
          filteredInstructors={filteredInstructors}
          currentItems={currentItems}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onSearch={handleSearch}
          facultyFilter={facultyFilter}
          programFilter={programFilter}
          positionFilter={positionFilter}
          statusFilter={statusFilter}
          onFacultyFilterChange={setFacultyFilter}
          onProgramFilterChange={setProgramFilter}
          onPositionFilterChange={setPositionFilter}
          onStatusFilterChange={setStatusFilter}
          onResetFilters={handleResetFilters}
          onSortBy={setSortBy}
          faculties={faculties}
          availablePrograms={availablePrograms}
          formatPosition={formatPosition}
          getStatusBadgeVariant={getStatusBadgeVariant}
          getFacultyName={getFacultyName}
          getStudentCountByInstructor={getStudentCountByInstructor}
          onViewInstructor={handleViewInstructor}
          onAddInstructor={handleAddInstructor}
        />
      </DashboardMainCard>
    </PageTransition>
  )
}

