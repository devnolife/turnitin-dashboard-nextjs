"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Loader2 } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { PageTransition, FadeIn } from "@/components/ui/motion"
import { useAuthStore } from "@/lib/store/auth-store"

export function InstructorSettings() {
  const { user } = useAuthStore()

  const [emailNotif, setEmailNotif] = useState(true)
  const [submissionNotif, setSubmissionNotif] = useState(true)
  const [messageNotif, setMessageNotif] = useState(true)

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
      const res = await fetch("/api/instructor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, email }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "Pengaturan berhasil disimpan!" })
      } else {
        setMessage({ type: "error", text: data.message || "Gagal menyimpan" })
      }
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
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Notifikasi</CardTitle>
              <CardDescription>Kelola preferensi notifikasi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notif">Notifikasi Email</Label>
                  <p className="text-xs text-muted-foreground">Terima pemberitahuan via email</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={emailNotif}
                  onCheckedChange={setEmailNotif}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="submission-notif">Pengiriman Baru</Label>
                  <p className="text-xs text-muted-foreground">Notifikasi saat ada pengiriman baru</p>
                </div>
                <Switch
                  id="submission-notif"
                  checked={submissionNotif}
                  onCheckedChange={setSubmissionNotif}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="message-notif">Pesan Masuk</Label>
                  <p className="text-xs text-muted-foreground">Notifikasi saat ada pesan baru</p>
                </div>
                <Switch
                  id="message-notif"
                  checked={messageNotif}
                  onCheckedChange={setMessageNotif}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
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

