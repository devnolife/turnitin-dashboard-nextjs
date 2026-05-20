import axios from "axios"
import { useAuthStore } from "@/lib/store/auth-store"

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true, // kirim cookie HttpOnly otomatis
})

// Backward-compat: tetap kirim Authorization Bearer kalau ada token di store.
// Cookie HttpOnly tetap diutamakan oleh server.
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
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          if (data.token) {
            useAuthStore.getState().setToken(data.token)
          }
          return api(originalRequest)
        }
      } catch {
        // fall through
      }

      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  }
)

export default api
