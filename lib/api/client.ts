import axios from "axios"
import { useAuthStore } from "@/lib/store/auth-store"

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const token = useAuthStore.getState().token
        if (!token) throw new Error("No token")

        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          useAuthStore.getState().setToken(data.token)
          originalRequest.headers["Authorization"] = `Bearer ${data.token}`
          return api(originalRequest)
        }
      } catch {
        // Refresh failed — fall through to logout
      }

      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login"
      }
    }

    return Promise.reject(error)
  }
)

export default api
