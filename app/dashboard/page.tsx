"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"

export default function DashboardPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/auth/login")
      return
    }
    if (user?.role) {
      router.replace(`/dashboard/${user.role}`)
    }
  }, [router, user, checkAuth])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
