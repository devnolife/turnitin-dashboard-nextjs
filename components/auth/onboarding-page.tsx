"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Check,
  Smartphone,
  CreditCard,
  ClipboardList,
  ArrowRight,
  Loader2,
  LogOut,
  PartyPopper,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/store/auth-store"
import { WhatsAppForm } from "@/components/payment/whatsapp-form"
import { PaymentStatusChecker } from "@/components/payment/payment-status-checker"
import { ExamDetailsForm } from "@/components/dashboard/student/exam-details-form"
import { cn } from "@/lib/utils"

type StepId = "whatsapp" | "payment" | "exam"

interface StepDef {
  id: StepId
  title: string
  description: string
  icon: typeof Smartphone
}

const STEPS: StepDef[] = [
  {
    id: "whatsapp",
    title: "Verifikasi WhatsApp",
    description: "Nomor untuk notifikasi & verifikasi",
    icon: Smartphone,
  },
  {
    id: "payment",
    title: "Pembayaran",
    description: "Konfirmasi pembayaran Turnitin",
    icon: CreditCard,
  },
  {
    id: "exam",
    title: "Detail Ujian",
    description: "Judul & jenis ujian skripsi",
    icon: ClipboardList,
  },
]

export function OnboardingPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const _hasHydrated = useAuthStore((s) => s._hasHydrated)
  const refreshSession = useAuthStore((s) => s.refreshSession)
  const logout = useAuthStore((s) => s.logout)

  const [bootLoading, setBootLoading] = useState(true)

  useEffect(() => {
    if (!_hasHydrated) return
    const run = async () => {
      if (!user) {
        const ok = await refreshSession()
        if (!ok) {
          router.push("/auth/login")
          return
        }
      }
      setBootLoading(false)
    }
    void run()
  }, [_hasHydrated, user, refreshSession, router])

  const currentStep: StepId | "done" = useMemo(() => {
    if (!user) return "whatsapp"
    if (!user.whatsappNumber) return "whatsapp"
    if (!user.hasCompletedPayment) return "payment"
    if (!user.examDetails || user.examDetails.approvalStatus === null) return "exam"
    return "done"
  }, [user])

  useEffect(() => {
    if (currentStep === "done" && user) {
      const t = setTimeout(() => {
        router.push(`/dashboard/${user.role}`)
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [currentStep, router, user])

  if (bootLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const completedCount = currentStep === "done" ? STEPS.length : stepIndex
  const progressPct = Math.round((completedCount / STEPS.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter/30 via-background to-secondary/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Perpusmu"
              width={40}
              height={40}
              className="rounded-full ring-2 ring-white shadow"
            />
            <div>
              <h1 className="text-lg font-bold leading-tight">Aktivasi Akun</h1>
              <p className="text-xs text-muted-foreground">Selamat datang, {user.name}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-1.5 size-3.5" /> Keluar
          </Button>
        </header>

        <Card className="mb-6 overflow-hidden rounded-3xl border-2 border-primary/20 bg-white/80 backdrop-blur dark:bg-gray-900/80">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {completedCount} / {STEPS.length}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">langkah</span>
                </p>
              </div>
              <Badge variant={currentStep === "done" ? "success" : "secondary"} className="text-sm">
                {progressPct}%
              </Badge>
            </div>

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <ol className="grid gap-3 sm:grid-cols-3">
              {STEPS.map((step, idx) => {
                const isDone = idx < stepIndex || currentStep === "done"
                const isCurrent = idx === stepIndex && currentStep !== "done"
                const Icon = step.icon
                return (
                  <li
                    key={step.id}
                    className={cn(
                      "relative rounded-2xl border p-4 transition",
                      isDone && "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
                      isCurrent && "border-primary bg-primary/5 shadow-md",
                      !isDone && !isCurrent && "border-border bg-muted/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl",
                          isDone && "bg-emerald-500 text-white",
                          isCurrent && "bg-primary text-white",
                          !isDone && !isCurrent && "bg-muted text-muted-foreground"
                        )}
                      >
                        {isDone ? <Check className="size-5" /> : <Icon className="size-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Langkah {idx + 1}</p>
                        <p className="truncate font-semibold">{step.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <ArrowRight className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                    )}
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>

        <div className="mx-auto max-w-2xl">
          {currentStep === "whatsapp" && <WhatsAppForm />}
          {currentStep === "payment" && <PaymentStatusChecker />}
          {currentStep === "exam" && (
            <div className="space-y-4">
              <ExamDetailsForm />
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/dashboard/${user.role}`)}
                  className="text-muted-foreground"
                >
                  Lewati untuk sekarang &mdash; isi nanti dari dashboard
                </Button>
              </div>
            </div>
          )}
          {currentStep === "done" && (
            <Card className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <PartyPopper className="size-12 text-emerald-500" />
                <h2 className="text-xl font-bold">Selamat! Akun siap digunakan.</h2>
                <p className="text-sm text-muted-foreground">
                  Semua langkah aktivasi sudah selesai. Anda akan diarahkan ke dashboard…
                </p>
                <Loader2 className="size-5 animate-spin text-emerald-600" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
