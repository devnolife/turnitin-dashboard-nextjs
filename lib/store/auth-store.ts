import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "@/lib/api/client"
import type { ExamType, ExamDetails, User } from "@/lib/types/auth"

export type { ExamType, ExamDetails, User } from "@/lib/types/auth"

interface AuthState {
  user: User | null
  /**
   * Token opsional di memori untuk backward-compat.
   * Sumber kebenaran sekarang adalah cookie HttpOnly `perpusmu_session`.
   * Token TIDAK lagi di-persist ke localStorage.
   */
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  login: (username: string, password: string) => Promise<User>
  logout: () => void
  checkAuth: () => boolean
  refreshSession: () => Promise<boolean>
  setToken: (token: string) => void
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
      _hasHydrated: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include",
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.message || "Login gagal")
          }

          const { user, token } = data

          set({
            user,
            token: token ?? null,
            isAuthenticated: true,
            isLoading: false,
          })

          return user
        } catch (error) {
          const message = error instanceof Error ? error.message : "Login gagal. Periksa username dan password Anda."
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: () => {
        fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        }).catch(() => { })

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })

        if (typeof window !== "undefined") {
          localStorage.removeItem("perpusmu-auth-storage")
          window.location.href = "/auth/login"
        }
      },

      checkAuth: () => {
        return !!get().user
      },

      /**
       * Ambil ulang user dari /api/auth/me. Memvalidasi cookie sesi.
       */
      refreshSession: async () => {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" })
          if (!res.ok) {
            set({ user: null, token: null, isAuthenticated: false })
            return false
          }
          const data = await res.json()
          set({ user: data.user, isAuthenticated: true })
          return true
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
          return false
        }
      },

      setToken: (token: string) => {
        set({ token })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },

      updateWhatsappNumber: async (whatsappNumber: string) => {
        set({ isLoading: true, error: null })

        try {
          const user = get().user
          if (!user) throw new Error("User not authenticated")

          const response = await api.post("/users/update-whatsapp", { whatsappNumber })

          set({
            user: { ...user, whatsappNumber },
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
          if (!user) throw new Error("User not authenticated")

          const response = await api.post("/users/submit-exam-details", {
            thesisTitle: details.thesisTitle,
            examType: details.examType,
          })

          const examDetails = response.data.examDetails

          set({
            user: { ...user, examDetails },
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
      name: "perpusmu-auth-storage",
      // Hanya persist user (untuk UX cepat saat reload). Token TIDAK di-persist.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return () => {
          setTimeout(() => {
            useAuthStore.setState({ _hasHydrated: true })
          }, 0)
        }
      },
    },
  ),
)
