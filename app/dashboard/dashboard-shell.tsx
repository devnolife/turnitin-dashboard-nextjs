"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { ThemeIndicator } from "@/components/ui/theme-indicator"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const toastRef = useRef(toast)
  toastRef.current = toast

  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const _hasHydrated = useAuthStore((s) => s._hasHydrated)

  const handleMobileOpenChange = useCallback((open: boolean) => {
    setMobileOpen(open)
  }, [])

  useEffect(() => {
    // Tunggu store selesai hydrate dari localStorage
    if (!_hasHydrated) return

    if (!token) {
      router.push("/auth/login")
      return
    }

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role === "student" && !user.hasCompletedPayment) {
      toastRef.current({
        variant: "destructive",
        title: "Pembayaran Diperlukan",
        description: "Silakan periksa status pembayaran Anda untuk mengakses dashboard.",
      })
      router.push("/payment")
      return
    }

    if (user.role === "student" && user.hasCompletedPayment && !user.whatsappNumber) {
      toastRef.current({
        variant: "destructive",
        title: "Nomor WhatsApp Diperlukan",
        description: "Silakan lengkapi nomor WhatsApp Anda untuk mengakses dashboard.",
      })
      router.push("/payment")
      return
    }

    const currentRole = pathname.split("/")[2]
    if (currentRole && user.role !== currentRole) {
      router.push(`/dashboard/${user.role}`)
      return
    }

    setLoading(false)
  }, [pathname, router, user, token, _hasHydrated])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background" role="status" aria-label="Memuat...">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="sr-only">Memuat...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-primary-lighter/20 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={handleMobileOpenChange} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setMobileOpen(true)} />
        {children}
        <ThemeIndicator />
      </main>
    </div>
  )
}
