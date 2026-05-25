"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="size-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
      <p className="max-w-md text-muted-foreground">
        Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi tim dukungan jika masalah berlanjut.
      </p>
      <Button onClick={reset} variant="default">
        Coba Lagi
      </Button>
    </div>
  )
}
