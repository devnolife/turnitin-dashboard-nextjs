"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, KeyRound, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store/auth-store"
import api from "@/lib/api/client"

export function ChangePasswordPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const refreshSession = useAuthStore((s) => s.refreshSession)
  const _hasHydrated = useAuthStore((s) => s._hasHydrated)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      void refreshSession().then((ok) => {
        if (!ok) router.push("/auth/login")
      })
    }
  }, [_hasHydrated, user, refreshSession, router])

  const mustChange = !!user?.mustChangePassword

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak sama")
      return
    }
    if (newPassword === currentPassword) {
      setError("Password baru harus berbeda dari password saat ini")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword })
      updateUser({ mustChangePassword: false })
      setSuccess(true)
      setTimeout(() => {
        const role = user?.role || "student"
        router.push(`/dashboard/${role}`)
      }, 1500)
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal mengubah password"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-lighter/30 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-7" />
          </div>
          <CardTitle className="text-2xl">Ganti Password</CardTitle>
          <CardDescription>
            {mustChange
              ? "Password Anda telah direset oleh admin. Silakan buat password baru untuk melanjutkan."
              : "Buat password baru untuk akun Anda."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <ShieldCheck className="size-12 text-emerald-500" />
              <p className="font-semibold">Password berhasil diubah</p>
              <p className="text-sm text-muted-foreground">Mengarahkan ke dashboard…</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">
                  {mustChange ? "Password Sementara" : "Password Saat Ini"}
                </Label>
                <div className="relative">
                  <Input
                    id="current"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="new"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Minimal 8 karakter</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Konfirmasi Password Baru</Label>
                <Input
                  id="confirm"
                  type={showNew ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan…
                  </>
                ) : (
                  "Ganti Password"
                )}
              </Button>

              {!mustChange && (
                <div className="text-center">
                  <Link
                    href={`/dashboard/${user?.role || "student"}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Kembali ke dashboard
                  </Link>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
