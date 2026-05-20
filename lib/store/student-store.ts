import { create } from "zustand"
import api from "@/lib/api/client"
import type { Student } from "@/lib/types/student"

export type { ExamStage, TurnitinResult, Student } from "@/lib/types/student"

interface StudentState {
  students: Student[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  prodiFilter: string

  fetchStudents: () => Promise<void>
  setSearchQuery: (query: string) => void
  setProdiFilter: (prodi: string) => void
  getStudentById: (id: string) => Student | undefined
}

export const useStudentStore = create<StudentState>()((set, get) => ({
  students: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  prodiFilter: "",

  fetchStudents: async () => {
    set({ isLoading: true, error: null })
    try {
      const { searchQuery, prodiFilter } = get()
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      if (prodiFilter && prodiFilter !== "all") params.set("prodi", prodiFilter)

      const res = await api.get(`/admin/students?${params.toString()}`)
      set({ students: res.data.students, isLoading: false })
    } catch {
      set({ error: "Gagal mengambil data mahasiswa", isLoading: false })
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  setProdiFilter: (prodi) => {
    set({ prodiFilter: prodi })
  },

  getStudentById: (id) => {
    return get().students.find((s) => s.id === id)
  },
}))

