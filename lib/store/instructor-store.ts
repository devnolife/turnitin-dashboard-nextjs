import { create } from "zustand"
import api from "@/lib/api/client"
import type { Instructor } from "@/lib/types/instructor"

export type { Instructor } from "@/lib/types/instructor"

interface InstructorState {
  instructors: Instructor[]
  isLoading: boolean
  error: string | null
  searchQuery: string

  fetchInstructors: () => Promise<void>
  setSearchQuery: (query: string) => void
  getInstructorById: (id: string) => Instructor | undefined
}

export const useInstructorStore = create<InstructorState>()((set, get) => ({
  instructors: [],
  isLoading: false,
  error: null,
  searchQuery: "",

  fetchInstructors: async () => {
    set({ isLoading: true, error: null })
    try {
      const { searchQuery } = get()
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)

      const res = await api.get(`/admin/instructors?${params.toString()}`)
      set({ instructors: res.data.instructors, isLoading: false })
    } catch {
      set({ error: "Gagal mengambil data instruktur", isLoading: false })
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  getInstructorById: (id) => {
    return get().instructors.find((i) => i.id === id)
  },
}))

