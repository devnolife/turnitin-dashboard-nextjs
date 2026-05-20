import { create } from "zustand"
import api from "@/lib/api/client"
import type { StudyProgram, Faculty } from "@/lib/types/common"

export type { StudyProgram, Faculty } from "@/lib/types/common"

interface FacultyState {
  faculties: Faculty[]
  programs: StudyProgram[]
  isLoading: boolean
  error: string | null
  fetchFaculties: () => Promise<void>
}

export const useFacultyStore = create<FacultyState>()((set) => ({
  faculties: [],
  programs: [],
  isLoading: false,
  error: null,

  fetchFaculties: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get("/admin/study-programs")
      set({
        faculties: res.data.faculties,
        programs: res.data.programs,
        isLoading: false,
      })
    } catch {
      set({ error: "Gagal mengambil data fakultas", isLoading: false })
    }
  },
}))

