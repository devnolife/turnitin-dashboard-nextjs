import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "@/lib/api/mock-api"
import type { ExamType, ExamDetails, User } from "@/lib/types/auth"

export type { ExamType, ExamDetails, User } from "@/lib/types/auth"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (role: string) => Promise<void>
  logout: () => void
  checkAuth: () => boolean
  updateUser: (userData: Partial<User>) => void
  updateWhatsappNumber: (whatsappNumber: string) => Promise<void>
  submitExamDetails: (details: { thesisTitle: string; examType: ExamType }) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (role: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await api.post("/auth/login", { role })
          const { user, token } = response.data

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })

          return user
        } catch (error) {
          set({
            error: "Login failed. Please try again.",
            isLoading: false,
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      checkAuth: () => {
        const { token } = get()
        return !!token
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user

        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...userData,
            },
          })
        }
      },

      updateWhatsappNumber: async (whatsappNumber: string) => {
        set({ isLoading: true, error: null })

        try {
          const user = get().user

          if (!user) {
            throw new Error("User not authenticated")
          }

          // Call API to update WhatsApp number
          const response = await api.post("/users/update-whatsapp", {
            userId: user.id,
            whatsappNumber,
          })

          // Update user in store
          set({
            user: {
              ...user,
              whatsappNumber,
            },
            isLoading: false,
          })

          return response.data
        } catch (error) {
          set({
            error: "Failed to update WhatsApp number. Please try again.",
            isLoading: false,
          })
          throw error
        }
      },

      submitExamDetails: async (details: { thesisTitle: string; examType: ExamType }) => {
        set({ isLoading: true, error: null })

        try {
          const user = get().user

          if (!user) {
            throw new Error("User not authenticated")
          }

          // Call API to submit exam details
          const response = await api.post("/users/submit-exam-details", {
            userId: user.id,
            thesisTitle: details.thesisTitle,
            examType: details.examType,
          })

          const examDetails = response.data.examDetails

          // Update user in store
          set({
            user: {
              ...user,
              examDetails,
            },
            isLoading: false,
          })

          return response.data
        } catch (error) {
          set({
            error: "Failed to submit exam details. Please try again.",
            isLoading: false,
          })
          throw error
        }
      },
    }),
    {
      name: "turnitin-auth-storage",
    },
  ),
)

