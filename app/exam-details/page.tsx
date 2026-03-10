"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ExamDetailsForm } from "@/components/dashboard/student/exam-details-form"
import { useAuthStore } from "@/lib/store/auth-store"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function ExamDetailsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/auth/login")
      return
    }

    if (user?.role === "student" && !user?.hasCompletedPayment) {
      toast({
        variant: "destructive",
        title: "Pembayaran Diperlukan",
        description: "Anda harus menyelesaikan pembayaran terlebih dahulu sebelum mengisi detail ujian.",
      })
      router.push("/payment")
      return
    }

    setLoading(false)
  }, [checkAuth, router, toast, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Detail Ujian Skripsi</h1>
        <p className="mt-2 text-muted-foreground">
          Lengkapi detail ujian skripsi Anda untuk mengakses layanan Perpusmu
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <ExamDetailsForm />
      </div>
    </div>
  )
}

