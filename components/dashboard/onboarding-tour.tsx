"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Check } from "lucide-react"
import api from "@/lib/api/client"
import { useAuthStore } from "@/lib/store/auth-store"

interface TourStep {
  title: string
  body: string
  emoji: string
}

const STUDENT_STEPS: TourStep[] = [
  { emoji: "📤", title: "Unggah dokumen per bab", body: "Buka menu Pengajuan untuk mengirim file Bab 1–5 atau dokumen ujian. Sistem akan mengecek similarity otomatis." },
  { emoji: "📋", title: "Pantau hasil & feedback", body: "Lihat persentase similarity dan revisi dari instruktur di halaman Feedback." },
  { emoji: "🛟", title: "Ada kendala? Kirim pengaduan", body: "Gunakan menu Pengaduan untuk menghubungi admin jika ada masalah teknis atau pembayaran." },
  { emoji: "🎓", title: "Selesaikan semua tahap", body: "Lulus berarti semua bab/tahap ujian sudah memenuhi batas similarity prodi Anda. Status akan terupdate otomatis." },
]

const INSTRUCTOR_STEPS: TourStep[] = [
  { emoji: "📥", title: "Antrian pengajuan", body: "Menu Pengajuan menampilkan dokumen mahasiswa binaan yang menunggu review." },
  { emoji: "🔍", title: "Input hasil similarity", body: "Buka detail pengajuan, masukkan persentase similarity. Sistem otomatis menyarankan status REVIEWED/FLAGGED berdasarkan aturan prodi." },
  { emoji: "📊", title: "Analitik mahasiswa binaan", body: "Halaman Analitik menampilkan progres tiap mahasiswa Anda dalam menyelesaikan tahap ujian." },
]

const ADMIN_STEPS: TourStep[] = [
  { emoji: "👥", title: "Manajemen pengguna", body: "Kelola mahasiswa, instruktur, fakultas, dan prodi. Tetapkan instruktur ke mahasiswa di menu Mahasiswa." },
  { emoji: "⚖️", title: "Aturan similarity per prodi", body: "Atur batas persentase tiap bab/tahap di halaman Prodi → Aturan." },
  { emoji: "📈", title: "Rekap & arsip", body: "Buat rekap plagiasi periode tertentu dan simpan arsipnya di menu Rekap." },
  { emoji: "🛟", title: "Pengaduan & pengaturan", body: "Tanggapi pengaduan mahasiswa dan kelola tarif S1/S2/S3 di menu Pengaturan." },
]

export function OnboardingTour() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const steps = useMemo<TourStep[]>(() => {
    if (!user) return []
    if (user.role === "admin") return ADMIN_STEPS
    if (user.role === "instructor") return INSTRUCTOR_STEPS
    return STUDENT_STEPS
  }, [user])

  useEffect(() => {
    if (!user) return
    if (user.tourCompletedAt) return
    if (user.mustChangePassword) return
    if (user.role === "student" && (!user.hasCompletedPayment || !user.whatsappNumber)) return
    setOpen(true)
  }, [user])

  const finish = async () => {
    setSubmitting(true)
    try {
      await api.post("/auth/tour-complete")
      updateUser({ tourCompletedAt: new Date().toISOString() })
    } catch {
      // best-effort; user can still close
    } finally {
      setSubmitting(false)
      setOpen(false)
    }
  }

  if (!user || steps.length === 0) return null

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) void finish() }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Panduan singkat • Langkah {step + 1} dari {steps.length}
          </div>
          <DialogTitle className="flex items-center gap-2 pt-2 text-xl">
            <span className="text-2xl" aria-hidden>{current.emoji}</span>
            {current.title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-relaxed">
            {current.body}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5 pt-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => void finish()} disabled={submitting}>
            Lewati
          </Button>
          {!isLast ? (
            <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
              Selanjutnya
              <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button onClick={() => void finish()} disabled={submitting}>
              <Check className="mr-1 size-4" />
              Selesai
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
