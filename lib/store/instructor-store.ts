import { create } from "zustand"
import type { Student, TurnitinResult } from "@/lib/types/student"
import type { Instructor } from "@/lib/types/instructor"
import { useStudentStore } from "@/lib/store/student-store"

export type { Instructor } from "@/lib/types/instructor"

interface InstructorState {
  instructors: Instructor[]
  filteredInstructors: Instructor[]
  isLoading: boolean
  error: string | null

  // Filters
  facultyFilter: string | null
  programFilter: string | null
  searchQuery: string
  positionFilter: string | null
  statusFilter: string | null
  sortBy: "name" | "students" | "faculty" | "position" | "status"
  sortOrder: "asc" | "desc"

  // Actions
  fetchInstructors: () => Promise<void>
  setFacultyFilter: (facultyId: string | null) => void
  setProgramFilter: (programId: string | null) => void
  setSearchQuery: (query: string) => void
  setPositionFilter: (position: string | null) => void
  setStatusFilter: (status: string | null) => void
  setSortBy: (field: "name" | "students" | "faculty" | "position" | "status") => void
  setSortOrder: (order: "asc" | "desc") => void
  applyFilters: () => void
  getInstructorById: (id: string) => Instructor | undefined
  getStudentsByInstructor: (instructorId: string) => Student[]
  getStudentCountByInstructor: (instructorId: string) => number
  getStudentsByInstructorAndProgram: (instructorId: string, programId: string) => Student[]
  getStudentsByInstructorAndExamStage: (instructorId: string, examStage: string) => Student[]
  getTurnitinResultsByInstructor: (instructorId: string) => TurnitinResult[]
  assignStudentToInstructor: (studentId: string, instructorId: string) => boolean
  removeStudentFromInstructor: (studentId: string) => boolean
  reviewTurnitinResult: (resultId: string, comments: string) => boolean
}

// Generate random date in the past 5 years
const getRandomJoinDate = () => {
  const date = new Date()
  const years = Math.floor(Math.random() * 5) + 1
  date.setFullYear(date.getFullYear() - years)
  return date.toISOString().split("T")[0]
}

// Generate mock instructor data
const generateMockInstructors = (count: number): Instructor[] => {
  const positions = ["professor", "associate_professor", "assistant_professor", "lecturer"]
  const faculties = ["fac-1", "fac-2", "fac-3", "fac-4", "fac-5"]
  const programs = {
    "fac-1": ["prog-1", "prog-2", "prog-3", "prog-4"],
    "fac-2": ["prog-5", "prog-6", "prog-7", "prog-8"],
    "fac-3": ["prog-9", "prog-10", "prog-11", "prog-12"],
    "fac-4": ["prog-13", "prog-14", "prog-15"],
    "fac-5": ["prog-16", "prog-17", "prog-18", "prog-19"],
  }

  const specializations = [
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Software Engineering",
    "Computer Networks",
    "Cybersecurity",
    "Database Systems",
    "Human-Computer Interaction",
    "Computer Graphics",
    "Distributed Systems",
    "Embedded Systems",
    "Robotics",
    "Bioinformatics",
    "Natural Language Processing",
    "Computer Vision",
    "Quantum Computing",
    "Cloud Computing",
    "Mobile Computing",
    "Web Technologies",
    "Information Retrieval",
  ]

  return Array.from({ length: count }, (_, i) => {
    const facultyId = faculties[Math.floor(Math.random() * faculties.length)]
    const facultyPrograms = programs[facultyId as keyof typeof programs]

    // Assign 1-3 programs from the faculty
    const numPrograms = Math.floor(Math.random() * 3) + 1
    const programIds: string[] = []

    for (let j = 0; j < numPrograms; j++) {
      const programId = facultyPrograms[Math.floor(Math.random() * facultyPrograms.length)]
      if (!programIds.includes(programId)) {
        programIds.push(programId)
      }
    }

    // First instructor matches the mock auth user (user-2)
    const isAuthUser = i === 0

    return {
      id: isAuthUser ? "user-2" : `instructor-${i + 1}`,
      name: isAuthUser ? "Jane Instructor" : `Dr. Instructor ${i + 1}`,
      email: isAuthUser ? "instructor@example.com" : `instructor${i + 1}@university.edu`,
      employeeId: `I${(1000 + i + 1).toString().substring(1)}`,
      facultyId,
      programIds,
      position: positions[Math.floor(Math.random() * positions.length)] as any,
      specialization: specializations[Math.floor(Math.random() * specializations.length)],
      joinDate: getRandomJoinDate(),
      status: isAuthUser ? "active" as const : (Math.random() > 0.2 ? "active" : Math.random() > 0.5 ? "inactive" : "on_leave"),
      phoneNumber: isAuthUser ? "+6281234567890" : `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
      officeLocation: `Building ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}, Room ${Math.floor(Math.random() * 500) + 100}`,
      officeHours: `${Math.floor(Math.random() * 3) + 9}:00 - ${Math.floor(Math.random() * 3) + 13}:00, ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][Math.floor(Math.random() * 5)]} & ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][Math.floor(Math.random() * 5)]}`,
      bio: `Experienced educator with a focus on ${specializations[Math.floor(Math.random() * specializations.length)]} and ${specializations[Math.floor(Math.random() * specializations.length)]}. Published numerous papers in leading journals and conferences.`,
    }
  })
}

export const useInstructorStore = create<InstructorState>()((set, get) => ({
  instructors: generateMockInstructors(10),
  filteredInstructors: [],
  isLoading: false,
  error: null,

  facultyFilter: null,
  programFilter: null,
  searchQuery: "",
  positionFilter: null,
  statusFilter: null,
  sortBy: "name",
  sortOrder: "asc",

  fetchInstructors: async () => {
    set({ isLoading: true, error: null })

    try {
      // In a real app, this would be an API call
      // For now, we're using the mock data already set in the state

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Apply initial filters
      get().applyFilters()

      set({ isLoading: false })
    } catch (error) {
      set({
        error: "Failed to fetch instructors. Please try again.",
        isLoading: false,
      })
    }
  },

  setFacultyFilter: (facultyId) => {
    set({
      facultyFilter: facultyId,
      // Reset program filter if faculty changes
      programFilter: null,
    })
    get().applyFilters()
  },

  setProgramFilter: (programId) => {
    set({ programFilter: programId })
    get().applyFilters()
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
    get().applyFilters()
  },

  setPositionFilter: (position) => {
    set({ positionFilter: position })
    get().applyFilters()
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status })
    get().applyFilters()
  },

  setSortBy: (field) => {
    const { sortBy, sortOrder } = get()

    // If clicking the same field, toggle sort order
    if (field === sortBy) {
      set({ sortOrder: sortOrder === "asc" ? "desc" : "asc" })
    } else {
      set({ sortBy: field, sortOrder: "asc" })
    }

    get().applyFilters()
  },

  setSortOrder: (order) => {
    set({ sortOrder: order })
    get().applyFilters()
  },

  applyFilters: () => {
    const { instructors, facultyFilter, programFilter, searchQuery, positionFilter, statusFilter, sortBy, sortOrder } =
      get()

    let filtered = [...instructors]

    // Apply faculty filter
    if (facultyFilter) {
      filtered = filtered.filter((instructor) => instructor.facultyId === facultyFilter)
    }

    // Apply program filter
    if (programFilter) {
      filtered = filtered.filter((instructor) => instructor.programIds.includes(programFilter))
    }

    // Apply position filter
    if (positionFilter) {
      filtered = filtered.filter((instructor) => instructor.position === positionFilter)
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((instructor) => instructor.status === statusFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (instructor) =>
          instructor.name.toLowerCase().includes(query) ||
          instructor.email.toLowerCase().includes(query) ||
          instructor.employeeId.toLowerCase().includes(query) ||
          instructor.specialization.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "students":
          comparison = get().getStudentCountByInstructor(a.id) - get().getStudentCountByInstructor(b.id)
          break
        case "faculty":
          comparison = a.facultyId.localeCompare(b.facultyId)
          break
        case "position":
          comparison = a.position.localeCompare(b.position)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    set({ filteredInstructors: filtered })
  },

  getInstructorById: (id) => {
    return get().instructors.find((instructor) => instructor.id === id)
  },

  getStudentsByInstructor: (instructorId) => {
    // Get all students from the student store
    const allStudents = useStudentStore.getState().students

    // Filter students who have this instructor assigned
    return allStudents.filter((student) => student.instructorId === instructorId)
  },

  getStudentCountByInstructor: (instructorId) => {
    return get().getStudentsByInstructor(instructorId).length
  },

  getStudentsByInstructorAndProgram: (instructorId, programId) => {
    // Get all students from the student store
    const allStudents = useStudentStore.getState().students

    // Filter students who have this instructor assigned and are in the specific program
    return allStudents.filter((student) => student.instructorId === instructorId && student.programId === programId)
  },

  getStudentsByInstructorAndExamStage: (instructorId, examStage) => {
    // Get all students from the student store
    const allStudents = useStudentStore.getState().students

    // Filter students who have this instructor assigned and are in the specific exam stage
    return allStudents.filter((student) => student.instructorId === instructorId && student.examStage === examStage)
  },

  getTurnitinResultsByInstructor: (instructorId) => {
    const students = get().getStudentsByInstructor(instructorId)

    // Collect all Perpusmu results from these students
    return students.flatMap((student) => student.turnitinResults)
  },

  assignStudentToInstructor: (studentId, instructorId) => {
    return useStudentStore.getState().assignInstructorToStudent(studentId, instructorId)
  },

  removeStudentFromInstructor: (studentId) => {
    return useStudentStore.getState().removeInstructorFromStudent(studentId)
  },

  reviewTurnitinResult: (resultId, comments) => {
    return useStudentStore.getState().updateTurnitinResult(resultId, {
      status: "reviewed",
      reviewedAt: new Date().toISOString(),
      reviewedBy: "current-instructor-id", // In a real app, this would be the current user's ID
      comments,
    })
  },
}))

