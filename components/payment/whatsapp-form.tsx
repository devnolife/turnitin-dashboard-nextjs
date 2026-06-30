"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import api from "@/lib/api/client"

interface WaTokenInfo {
  configured: boolean
  token: string
  message: string
  waUrl: string | null
  officialNumber: string | null
  verified: boolean
  whatsappNumber: string | null
}

export function WhatsAppForm() {
  const [info, setInfo] = useState<WaTokenInfo | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get("/users/whatsapp-token")
      .then((res) => {
        if (!cancelled) setInfo(res.data)
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Belum tahu konfigurasi → loading singkat.
  if (!info && !loadFailed) {
    return (
      <Card className="border border-primary/20 shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  // WhatsApp Cloud API terkonfigurasi → verifikasi via "chat duluan".
  if (info?.configured) {
    return <WaChatVerify info={info} />
  }

  // Fallback: input nomor manual (WA belum dikonfigurasi).
  return <ManualWhatsAppForm />
}

/**
 * Verifikasi via "chat duluan": mahasiswa mengirim kode ke nomor resmi, lalu
 * sistem menyimpan nomornya otomatis (terverifikasi). UI mem-polling status.
 */
function WaChatVerify({ info }: { info: WaTokenInfo }) {
  const router = useRouter()
  const { toast } = useToast()
  const refreshSession = useAuthStore((s) => s.refreshSession)
  const user = useAuthStore((s) => s.user)

  const [opened, setOpened] = useState(false)
  const [verified, setVerified] = useState(info.verified)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const handleVerified = useCallback(async () => {
    stopPolling()
    setVerified(true)
    await refreshSession() // perbarui user → onboarding lanjut ke langkah berikutnya
    toast({ title: "WhatsApp terverifikasi", description: "Nomor Anda berhasil disimpan." })
    setTimeout(() => {
      if (user?.role) router.push(`/dashboard/${user.role}`)
    }, 1500)
  }, [refreshSession, router, stopPolling, toast, user?.role])

  // Polling status setelah user membuka WhatsApp.
  useEffect(() => {
    if (!opened || verified) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get("/users/whatsapp-token")
        if (res.data?.verified) {
          await handleVerified()
        }
      } catch {
        // abaikan; coba lagi pada interval berikutnya
      }
    }, 4000)
    return stopPolling
  }, [opened, verified, handleVerified, stopPolling])

  if (verified) {
    return (
      <Card className="border-2 border-emerald-300 shadow-lg dark:border-emerald-700">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <CheckCircle2 className="size-14 text-emerald-500" />
          <h3 className="text-lg font-bold">WhatsApp Terverifikasi</h3>
          <p className="text-sm text-muted-foreground">
            Nomor Anda tersimpan. Anda akan menerima notifikasi hasil di WhatsApp.
          </p>
          <Loader2 className="size-5 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-dark">
          <ShieldCheck className="size-5" /> Verifikasi WhatsApp
        </CardTitle>
        <CardDescription>
          Verifikasi nomor WhatsApp Anda dengan mengirim satu pesan ke nomor resmi kami. Nomor
          yang Anda pakai mengirim chat akan otomatis tersimpan untuk notifikasi hasil.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">1</span>
            <p className="text-sm">Tekan tombol di bawah untuk membuka WhatsApp dengan pesan yang sudah terisi.</p>
          </li>
          <li className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">2</span>
            <p className="text-sm">Kirim pesan tersebut (jangan diubah kodenya).</p>
          </li>
          <li className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">3</span>
            <p className="text-sm">Tunggu beberapa detik — halaman ini akan otomatis lanjut setelah terverifikasi.</p>
          </li>
        </ol>

        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Kode verifikasi Anda:</p>
          <p className="break-all font-mono text-sm font-semibold">{info.token}</p>
        </div>

        {opened && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <Loader2 className="size-4 animate-spin" />
            Menunggu pesan Anda… biarkan halaman ini terbuka.
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          asChild
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
          onClick={() => setOpened(true)}
        >
          <a href={info.waUrl ?? "#"} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 size-4" /> Verifikasi via WhatsApp
          </a>
        </Button>
        {opened && (
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setOpened(true)}>
            Saya sudah kirim — cek lagi
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// ── Fallback: input nomor manual (dipakai bila WA belum dikonfigurasi) ──────────
const formSchema = z.object({
  whatsappNumber: z
    .string()
    .min(10, { message: "Nomor WhatsApp harus minimal 10 digit." })
    .max(15, { message: "Nomor WhatsApp tidak boleh lebih dari 15 digit." })
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, {
      message: "Format nomor WhatsApp tidak valid. Gunakan format +62, 62, atau 0 diikuti dengan 9-13 digit angka.",
    }),
})

function ManualWhatsAppForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, updateWhatsappNumber } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { whatsappNumber: "" },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await updateWhatsappNumber(values.whatsappNumber)
      setIsSuccess(true)
      toast({
        title: "Nomor WhatsApp berhasil disimpan",
        description: "Anda akan dialihkan ke dashboard dalam beberapa detik.",
      })
      setTimeout(() => {
        router.push(`/dashboard/${user?.role}`)
      }, 3000)
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal menyimpan nomor WhatsApp",
        description: "Silakan periksa nomor WhatsApp Anda dan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Pendaftaran Berhasil</CardTitle>
          <CardDescription className="text-center">Nomor WhatsApp Anda telah berhasil disimpan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <CheckCircle2 className="size-16 text-green-500" />
          <p className="mt-4 text-center">Anda akan dialihkan ke dashboard dalam beberapa detik...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary-dark">Verifikasi Nomor WhatsApp</CardTitle>
        <CardDescription>Silakan masukkan nomor WhatsApp Anda untuk menyelesaikan pendaftaran</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <fieldset disabled={isSubmitting} className="space-y-4">
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+628123456789"
                        {...field}
                        className="focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </FormControl>
                    <FormDescription>
                      Masukkan nomor WhatsApp aktif Anda dengan format +62, 62, atau 0 diikuti dengan nomor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-dark to-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan dan Lanjutkan"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-center text-muted-foreground">
          Nomor WhatsApp Anda akan digunakan untuk komunikasi penting terkait layanan Perpusmu.
        </p>
      </CardFooter>
    </Card>
  )
}
