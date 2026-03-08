import { create } from "zustand"
import type { ExamStage, TurnitinResult, Student } from "@/lib/types/student"

export type { ExamStage, TurnitinResult, Student } from "@/lib/types/student"

interface StudentState {
  students: Student[]
  filteredStudents: Student[]
  isLoading: boolean
  error: string | null

  // Filters
  facultyFilter: string | null
  programFilter: string | null
  examStageFilter: ExamStage | "all"
  searchQuery: string
  instructorFilter: string | null // Added instructor filter

  // Actions
  fetchStudents: () => Promise<void>
  setFacultyFilter: (facultyId: string | null) => void
  setProgramFilter: (programId: string | null) => void
  setExamStageFilter: (stage: ExamStage | "all") => void
  setSearchQuery: (query: string) => void
  setInstructorFilter: (instructorId: string | null) => void
  applyFilters: () => void

  // Turnitin result management
  addTurnitinResult: (result: Omit<TurnitinResult, "id">) => string
  updateTurnitinResult: (resultId: string, updates: Partial<TurnitinResult>) => boolean
  deleteTurnitinResult: (resultId: string) => boolean
  transferTurnitinResult: (resultId: string, targetExamStage: ExamStage) => boolean
  getStudentById: (id: string) => Student | undefined
  assignInstructorToStudent: (studentId: string, instructorId: string) => boolean
  removeInstructorFromStudent: (studentId: string) => boolean
}

// Generate random date in the past 30 days
const getRandomDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  return date.toISOString()
}

// Generate random last active time
const getRandomLastActive = () => {
  const days = Math.floor(Math.random() * 14)
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`
}

// Generate random similarity score
const getRandomSimilarityScore = () => {
  return Math.floor(Math.random() * 40)
}

// Generate mock Turnitin results
const generateMockTurnitinResults = (studentId: string, examStage: ExamStage): TurnitinResult[] => {
  if (examStage === "applicant") return []

  const results: TurnitinResult[] = []
  const documentTypes = ["Research Proposal", "Literature Review", "Methodology", "Results Analysis", "Final Draft"]

  // Generate 1-3 results based on exam stage
  const numResults = Math.min(Math.floor(Math.random() * 3) + 1, examStage === "proposal_exam" ? 2 : 3)

  for (let i = 0; i < numResults; i++) {
    const submittedAt = getRandomDate()
    const similarityScore = getRandomSimilarityScore()
    const status = Math.random() > 0.3 ? "reviewed" : Math.random() > 0.5 ? "pending" : "flagged"

    results.push({
      id: `result-${studentId}-${i}`,
      studentId,
      examStage,
      documentTitle: `${documentTypes[i % documentTypes.length]} - ${examStage.replace("_", " ")}`,
      similarityScore,
      submittedAt,
      reviewedAt: status === "reviewed" ? getRandomDate() : null,
      reviewedBy: status === "reviewed" ? `instructor-${Math.floor(Math.random() * 10) + 1}` : null,
      status,
      reportUrl: `/reports/${studentId}/${examStage}/${i}`,
      documentUrl: `/documents/${studentId}/${examStage}/${i}`,
      comments:
        status === "reviewed"
          ? "Good work overall. Please address the highlighted sections to reduce similarity."
          : null,
    })
  }

  return results
}

// Generate mock student data
const generateMockStudents = (count: number): Student[] => {
  const examStages: ExamStage[] = ["applicant", "proposal_exam", "results_exam", "final_exam", "graduated"]
  const faculties = ["fac-1", "fac-2", "fac-3", "fac-4", "fac-5"]
  const programs = {
    "fac-1": ["prog-1", "prog-2", "prog-3", "prog-4"],
    "fac-2": ["prog-5", "prog-6", "prog-7", "prog-8"],
    "fac-3": ["prog-9", "prog-10", "prog-11", "prog-12"],
    "fac-4": ["prog-13", "prog-14", "prog-15"],
    "fac-5": ["prog-16", "prog-17", "prog-18", "prog-19"],
  }

  const thesisTitles = [
    "Analysis of Machine Learning Algorithms for Plagiarism Detection",
    "Comparative Study of Natural Language Processing Techniques",
    "Implementation of Blockchain Technology in Academic Record Verification",
    "Development of Mobile Application for Student Engagement",
    "Impact of Social Media on Academic Performance",
    "Optimization of Database Queries for Large Educational Datasets",
    "Security Analysis of Cloud-Based Learning Management Systems",
    "User Experience Design for Educational Technology Platforms",
    "Application of Artificial Intelligence in Automated Essay Grading",
    "Evaluation of Virtual Reality in Medical Education",
  ]

  return Array.from({ length: count }, (_, i) => {
    const facultyId = faculties[Math.floor(Math.random() * faculties.length)]
    const programId =
      programs[facultyId as keyof typeof programs][
        Math.floor(Math.random() * programs[facultyId as keyof typeof programs].length)
      ]
    const examStage = examStages[Math.floor(Math.random() * examStages.length)]
    const instructorId = Math.random() > 0.1 ? `instructor-${Math.floor(Math.random() * 50) + 1}` : null

    const student: Student = {
      id: `student-${i + 1}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@university.edu`,
      studentId: `S${(1000000 + i + 1).toString().substring(1)}`,
      facultyId,
      programId,
      instructorId,
      examStage,
      thesisTitle: examStage === "applicant" ? null : thesisTitles[Math.floor(Math.random() * thesisTitles.length)],
      examDate: examStage === "applicant" ? null : getRandomDate(),
      submittedAt: getRandomDate(),
      lastActive: getRandomLastActive(),
      status: Math.random() > 0.1 ? "active" : Math.random() > 0.5 ? "inactive" : "suspended",
      whatsappNumber: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
      turnitinResults: generateMockTurnitinResults(`student-${i + 1}`, examStage),
    }

    return student
  })
}

export const useStudentStore = create<StudentState>()((set, get) => ({
  students: generateMockStudents(200),
  filteredStudents: [],
  isLoading: false,
  error: null,

  facultyFilter: null,
  programFilter: null,
  examStageFilter: "all",
  searchQuery: "",
  instructorFilter: null,

  fetchStudents: async () => {
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
        error: "Failed to fetch students. Please try again.",
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

  setExamStageFilter: (stage) => {
    set({ examStageFilter: stage })
    get().applyFilters()
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
    get().applyFilters()
  },

  setInstructorFilter: (instructorId) => {
    set({ instructorFilter: instructorId })
    get().applyFilters()
  },

  applyFilters: () => {
    const { students, facultyFilter, programFilter, examStageFilter, searchQuery, instructorFilter } = get()

    let filtered = [...students]

    // Apply faculty filter
    if (facultyFilter) {
      filtered = filtered.filter((student) => student.facultyId === facultyFilter)
    }

    // Apply program filter
    if (programFilter) {
      filtered = filtered.filter((student) => student.programId === programFilter)
    }

    // Apply exam stage filter
    if (examStageFilter !== "all") {
      filtered = filtered.filter((student) => student.examStage === examStageFilter)
    }

    // Apply instructor filter
    if (instructorFilter) {
      filtered = filtered.filter((student) => student.instructorId === instructorFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query) ||
          (student.thesisTitle && student.thesisTitle.toLowerCase().includes(query)),
      )
    }

    set({ filteredStudents: filtered })
  },

  getStudentById: (id) => {
    return get().students.find((student) => student.id === id)
  },

  assignInstructorToStudent: (studentId, instructorId) => {
    const { students } = get()
    const studentIndex = students.findIndex((s) => s.id === studentId)

    if (studentIndex === -1) return false

    const updatedStudents = [...students]
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      instructorId,
    }

    set({ students: updatedStudents })
    get().applyFilters()
    return true
  },

  removeInstructorFromStudent: (studentId) => {
    const { students } = get()
    const studentIndex = students.findIndex((s) => s.id === studentId)

    if (studentIndex === -1) return false

    const updatedStudents = [...students]
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      instructorId: null,
    }

    set({ students: updatedStudents })
    get().applyFilters()
    return true
  },

  addTurnitinResult: (result) => {
    const { students } = get()
    const studentIndex = students.findIndex((s) => s.id === result.studentId)

    if (studentIndex === -1) return ""

    const resultId = `result-${result.studentId}-${Date.now()}`
    const newResult: TurnitinResult = {
      ...result,
      id: resultId,
    }

    const updatedStudents = [...students]
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      turnitinResults: [...updatedStudents[studentIndex].turnitinResults, newResult],
    }

    set({ students: updatedStudents })
    return resultId
  },

  updateTurnitinResult: (resultId, updates) => {
    const { students } = get()

    // Find the student with this result
    for (let i = 0; i < students.length; i++) {
      const resultIndex = students[i].turnitinResults.findIndex((r) => r.id === resultId)

      if (resultIndex !== -1) {
        const updatedStudents = [...students]
        const updatedResults = [...updatedStudents[i].turnitinResults]

        updatedResults[resultIndex] = {
          ...updatedResults[resultIndex],
          ...updates,
        }

        updatedStudents[i] = {
          ...updatedStudents[i],
          turnitinResults: updatedResults,
        }

        set({ students: updatedStudents })
        return true
      }
    }

    return false
  },

  deleteTurnitinResult: (resultId) => {
    const { students } = get()

    // Find the student with this result
    for (let i = 0; i < students.length; i++) {
      const resultIndex = students[i].turnitinResults.findIndex((r) => r.id === resultId)

      if (resultIndex !== -1) {
        const updatedStudents = [...students]
        const updatedResults = updatedStudents[i].turnitinResults.filter((r) => r.id !== resultId)

        updatedStudents[i] = {
          ...updatedStudents[i],
          turnitinResults: updatedResults,
        }

        set({ students: updatedStudents })
        return true
      }
    }

    return false
  },

  transferTurnitinResult: (resultId, targetExamStage) => {
    const { students } = get()

    // Find the student with this result
    for (let i = 0; i < students.length; i++) {
      const resultIndex = students[i].turnitinResults.findIndex((r) => r.id === resultId)

      if (resultIndex !== -1) {
        const result = students[i].turnitinResults[resultIndex]

        // Create a new result for the target exam stage
        const newResult: TurnitinResult = {
          ...result,
          id: `result-${result.studentId}-${Date.now()}`,
          examStage: targetExamStage,
          submittedAt: new Date().toISOString(),
          reviewedAt: null,
          reviewedBy: null,
          status: "pending",
          comments: `Transferred from ${result.examStage.replace("_", " ")} exam`,
        }

        const updatedStudents = [...students]
        updatedStudents[i] = {
          ...updatedStudents[i],
          turnitinResults: [...updatedStudents[i].turnitinResults, newResult],
        }

        set({ students: updatedStudents })
        return true
      }
    }

    return false
  },
}))

