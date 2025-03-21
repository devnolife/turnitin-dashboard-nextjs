import { create } from "zustand"
import api from "@/lib/api/mock-api"
import { useAuthStore } from "./auth-store"

interface Submission {
  id: string
  userId: string
  title: string
  course: string
  date: string
  similarity: number
  status: string
}

interface SubmissionState {
  submissions: Submission[]
  isLoading: boolean
  error: string | null
  fetchUserSubmissions: () => Promise<void>
  fetchAllSubmissions: () => Promise<void>
}

export const useSubmissionStore = create<SubmissionState>()((set) => ({
  submissions: [],
  isLoading: false,
  error: null,

  fetchUserSubmissions: async () => {
    set({ isLoading: true, error: null })

    try {
      const user = useAuthStore.getState().user

      if (!user) {
        throw new Error("User not authenticated")
      }

      const response = await api.get("/submissions", {
        params: { userId: user.id },
      })

      set({
        submissions: response.data.submissions,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: "Failed to fetch submissions. Please try again.",
        isLoading: false,
      })
    }
  },

  fetchAllSubmissions: async () => {
    set({ isLoading: true, error: null })

    try {
      const token = useAuthStore.getState().token

      const response = await api.get("/submissions/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      set({
        submissions: response.data.submissions,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: "Failed to fetch submissions. Please try again.",
        isLoading: false,
      })
    }
  },
}))

