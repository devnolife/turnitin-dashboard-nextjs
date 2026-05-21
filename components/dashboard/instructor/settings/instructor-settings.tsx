"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Loader2 } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { PageTransition, FadeIn } from "@/components/ui/motion"
import { useAuthStore } from "@/lib/store/auth-store"
import api from "@/lib/api/client"

export function InstructorSettings() {
  const { user } = useAuthStore()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await api.put("/instructor/profile", { name: displayName, email })
      const data = res.data

      setMessage({ type: "success", text: "Pengaturan berhasil disimpan!" })
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageTransition>
      <DashboardMainCard title="Pengaturan" subtitle="Kelola preferensi dan informasi akun Anda ⚙️" icon={Settings}>
        <div className="space-y-6">
          <Card className="rounded-3xl border border-border/60 shadow-sm dark:border-white/10">
            <CardHeader>
              <CardTitle>Akun</CardTitle>
              <CardDescription>Kelola informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Nama Tampilan</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama Anda"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {message && (
                <FadeIn>
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {message.text}
                  </div>
                </FadeIn>
              )}

              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardMainCard>
    </PageTransition>
  )
}

