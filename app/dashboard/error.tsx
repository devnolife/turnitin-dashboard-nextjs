"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="size-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold">Terjadi Kesalahan di Dashboard</h2>
      <p className="max-w-md text-muted-foreground">
        Maaf, terjadi kesalahan saat memuat halaman dashboard. Silakan coba lagi.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default">
          Coba Lagi
        </Button>
        <Button onClick={() => router.push("/auth/login")} variant="outline">
          Kembali ke Login
        </Button>
      </div>
    </div>
  )
}
