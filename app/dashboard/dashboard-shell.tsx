"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
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

  const { user, checkAuth } = useAuthStore()

  const handleMobileOpenChange = useCallback((open: boolean) => {
    setMobileOpen(open)
  }, [])

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/auth/login")
      return
    }

    if (!user) {
      setLoading(false)
      return
    }

    if (user.role === "student" && !user.hasCompletedPayment) {
      toast({
        variant: "destructive",
        title: "Pembayaran Diperlukan",
        description: "Silakan periksa status pembayaran Anda untuk mengakses dashboard.",
      })
      router.push("/payment")
      return
    }

    if (user.role === "student" && user.hasCompletedPayment && !user.whatsappNumber) {
      toast({
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
  }, [pathname, router, toast, user, checkAuth])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
