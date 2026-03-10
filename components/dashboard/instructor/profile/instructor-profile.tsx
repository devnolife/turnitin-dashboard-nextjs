"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/store/auth-store"
import { Mail, Shield, User, Save, Loader2, Phone } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { PageTransition, FadeIn } from "@/components/ui/motion"

export function InstructorProfile() {
  const { user } = useAuthStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [hp, setHp] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setHp((user as any).hp || "")
      setWhatsappNumber(user.whatsappNumber || "")
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/instructor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, hp, whatsappNumber }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" })
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
      <DashboardMainCard title="Profil" subtitle="Lihat dan kelola informasi profil Anda 👤" icon={User}>
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={user?.name || "Instructor"} />
                  <AvatarFallback className="bg-primary-dark text-white text-xl">
                    {(user?.name || "IN").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold">{user?.name || "Instruktur"}</h3>
                  <p className="text-muted-foreground">{user?.email || user?.username}</p>
                  <Badge className="mt-2" variant="secondary">Pengawas Perpusmu</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Edit Profil</CardTitle>
              <CardDescription>Perbarui informasi profil Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hp">No. Telepon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hp"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa">WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="wa"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="628xxxxxxxxxx"
                      className="pl-10"
                    />
                  </div>
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

          {/* Info Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4" /> Kontak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-medium">{user?.username || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Telepon</span>
                  <span className="font-medium">{(user as any)?.hp || "-"}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" /> Peran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Pengawas upload dokumen Perpusmu mahasiswa
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bergabung</span>
                  <span className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
                      : "-"
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardMainCard>
    </PageTransition>
  )
}

