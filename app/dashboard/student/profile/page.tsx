"use client"

import { useEffect, useState } from "react"
import { User, Phone, BookOpen, Mail, Calendar, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { useAuthStore } from "@/lib/store/auth-store"

export default function StudentProfilePage() {
  const { user } = useAuthStore()
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/student/stats")
        if (res.ok) {
          const data = await res.json()
          setPaymentStatus(data.paymentStatus)
        }
      } catch {
        // Silently fail
      }
    }
    fetchStatus()
  }, [])

  const formatWhatsAppNumber = (number: string | undefined) => {
    if (!number) return "Tidak tersedia"
    if (number.startsWith("+62")) return number
    if (number.startsWith("62")) return `+${number}`
    if (number.startsWith("0")) return `+62${number.substring(1)}`
    return number
  }

  const formatExamType = (examType: string | null | undefined) => {
    if (!examType) return "Tidak tersedia"
    switch (examType) {
      case "proposal_defense": return "Sidang Proposal"
      case "results_defense": return "Sidang Hasil"
      case "final_defense": return "Sidang Akhir"
      default: return examType
    }
  }

  return (
    <DashboardMainCard
      title="Profil Saya"
      subtitle="Informasi akun dan detail ujian Anda 👤"
      icon={User}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="gradient-text">Informasi Pribadi</CardTitle>
            <CardDescription>Data akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">{user?.name || "Tidak tersedia"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "Tidak tersedia"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Phone className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{formatWhatsAppNumber(user?.whatsappNumber)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="gradient-text">Detail Ujian</CardTitle>
            <CardDescription>Informasi sidang dan skripsi Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Judul Skripsi</p>
                <p className="font-medium">{user?.examDetails?.thesisTitle || "Tidak tersedia"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jenis Ujian</p>
                <p className="font-medium">{formatExamType(user?.examDetails?.examType)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Pembayaran</p>
                <Badge
                  variant="default"
                  className={`mt-1 ${paymentStatus === "COMPLETED" ? "bg-green-600" : "bg-yellow-600"}`}
                >
                  {paymentStatus === "COMPLETED" ? "Lunas ✓" : "Menunggu Pembayaran"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardMainCard>
  )
}
