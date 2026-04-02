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
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
