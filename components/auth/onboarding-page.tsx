"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Check,
  Smartphone,
  CreditCard,
  ClipboardList,
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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-lighter/30 via-background to-secondary/20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const completedCount = currentStep === "done" ? STEPS.length : stepIndex
  const progressPct = Math.round((completedCount / STEPS.length) * 100)
  const firstName = user.name?.split(" ")[0] ?? user.name
  const activeStepNumber = currentStep === "done" ? STEPS.length : stepIndex + 1

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* ── Left: brand + vertical stepper ─────────────────────────────── */}
      <aside className="relative hidden w-[40%] min-w-[340px] max-w-[460px] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#10406F] via-primary-dark to-[#2E81CB] p-8 text-white lg:flex xl:p-10">
        {/* decorative glow */}
        <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 size-80 rounded-full bg-primary-light/20 blur-3xl" />

        {/* brand */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Perpusmu"
            width={48}
            height={48}
            className="rounded-2xl shadow-lg ring-2 ring-white/40"
          />
          <div>
            <p className="text-base font-bold leading-tight">Perpusmu</p>
            <p className="text-xs text-white/70">Aktivasi Akun</p>
          </div>
        </div>

        {/* heading + stepper */}
        <div className="relative z-10 my-8">
          <h1 className="text-2xl font-bold leading-snug xl:text-3xl">
            {currentStep === "done" ? (
              <>Aktivasi selesai, {firstName}!</>
            ) : (
              <>Beberapa langkah lagi, {firstName}.</>
            )}
          </h1>
          <p className="mt-2 max-w-xs text-sm text-white/75">
            Lengkapi aktivasi untuk mulai menggunakan layanan cek plagiarisme Turnitin.
          </p>

          <ol className="mt-8">
            {STEPS.map((step, idx) => {
              const isDone = idx < stepIndex || currentStep === "done"
              const isCurrent = idx === stepIndex && currentStep !== "done"
              const Icon = step.icon
              return (
                <li key={step.id} className="relative flex gap-4 pb-7 last:pb-0">
                  {/* connector line */}
                  {idx < STEPS.length - 1 && (
                    <span
                      className={cn(
                        "absolute left-[19px] top-11 h-[calc(100%-1.75rem)] w-0.5 rounded-full transition-colors",
                        isDone ? "bg-white/80" : "bg-white/20"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 grid size-10 shrink-0 place-items-center rounded-xl border transition",
                      isDone && "border-transparent bg-white text-primary-dark",
                      isCurrent && "border-white bg-white/15 text-white shadow-lg ring-4 ring-white/20",
                      !isDone && !isCurrent && "border-white/30 bg-white/5 text-white/50"
                    )}
                  >
                    {isDone ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </div>
                  <div className={cn("pt-1 transition", !isDone && !isCurrent && "opacity-60")}>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">
                      Langkah {idx + 1}
                    </p>
                    <p className="font-semibold leading-tight">{step.title}</p>
                    <p className="mt-0.5 text-xs text-white/70">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* footer: progress + logout */}
        <div className="relative z-10 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-white/70">
              <span>Progress aktivasi</span>
              <span className="font-semibold text-white">{progressPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <LogOut className="mr-1.5 size-3.5" /> Keluar
          </Button>
        </div>
      </aside>

      {/* ── Right: form content ────────────────────────────────────────── */}
      <main className="flex h-screen flex-1 flex-col overflow-hidden bg-gradient-to-br from-primary-lighter/30 via-background to-secondary/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* mobile header (shown when the brand panel is hidden) */}
        <div className="flex items-center justify-between border-b bg-card/80 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Perpusmu" width={32} height={32} className="rounded-lg" />
            <div>
              <p className="text-sm font-bold leading-tight">Aktivasi Akun</p>
              <p className="text-[11px] text-muted-foreground">
                Langkah {Math.min(activeStepNumber, STEPS.length)} dari {STEPS.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={currentStep === "done" ? "success" : "secondary"}>{progressPct}%</Badge>
            <Button variant="ghost" size="icon" onClick={logout} className="size-8">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-muted lg:hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* scrollable form area (only this panel scrolls if a step is tall) */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="my-auto w-full max-w-lg">
            {currentStep === "whatsapp" && <WhatsAppForm />}
            {currentStep === "payment" && <PaymentStatusChecker />}
            {currentStep === "exam" && (
              <div className="space-y-3">
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
      </main>
    </div>
  )
}
