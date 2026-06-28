"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthStore } from "@/lib/store/auth-store"
import { usePaymentStore } from "@/lib/store/payment-store"
import { WhatsAppForm } from "./whatsapp-form"
import { ConfettiTrigger, SuccessCheckmark } from "@/components/ui/animations"

export function PaymentStatusChecker() {
  const [status, setStatus] = useState<string>("checking")
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { user } = useAuthStore()
  const { payment, isLoading, lastChecked, error, checkPaymentStatus } = usePaymentStore()

  // Guard to ensure the initial check runs only once per mount
  const hasCheckedRef = useRef(false)

  // Check payment status on initial load
  useEffect(() => {
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true

    const initialCheck = async () => {
      try {
        const paymentStatus = await checkPaymentStatus()
        setStatus(paymentStatus)

        // If payment is completed, show WhatsApp form
        if (paymentStatus === "completed") {
          // Read the latest user from the store to avoid stale closure
          const currentUser = useAuthStore.getState().user

          if (currentUser?.whatsappNumber) {
            // If user already has a WhatsApp number, redirect to dashboard
            toast({
              title: "Pembayaran berhasil dikonfirmasi",
              description: "Anda akan dialihkan ke dashboard dalam beberapa detik.",
            })

            setTimeout(() => {
              router.push(`/dashboard/${currentUser.role}`)
            }, 3000)
          } else {
            // If user doesn't have a WhatsApp number, show the form
            setShowWhatsAppForm(true)
          }
        }
      } catch (err) {
        setStatus("failed")
        toast({
          variant: "destructive",
          title: "Terjadi kesalahan",
          description: "Gagal memeriksa status pembayaran. Silakan coba lagi.",
        })
      }
    }

    initialCheck()
    // Intentionally run only once on mount. Including `toast`/`user`/`error`
    // here causes an infinite loop because those references change after
    // each call to `checkPaymentStatus`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCheckPayment = async () => {
    setStatus("checking")

    try {
      const paymentStatus = await checkPaymentStatus()
      setStatus(paymentStatus)

      // Show appropriate toast based on payment status
      if (paymentStatus === "completed") {
        toast({
          title: "Pembayaran berhasil dikonfirmasi",
          description: "Silakan lengkapi data WhatsApp Anda.",
        })

        // Show WhatsApp form if user doesn't have a WhatsApp number
        if (!user?.whatsappNumber) {
          setShowWhatsAppForm(true)
        } else {
          // If user already has a WhatsApp number, redirect to dashboard
          setTimeout(() => {
            router.push(`/dashboard/${user.role}`)
          }, 3000)
        }
      } else if (paymentStatus === "failed") {
        toast({
          variant: "destructive",
          title: "Pembayaran gagal",
          description: "Sistem tidak dapat mengonfirmasi pembayaran Anda. Silakan coba lagi nanti.",
        })
      } else if (paymentStatus === "processing") {
        toast({
          title: "Pembayaran sedang diproses",
          description: "Pembayaran Anda sedang diproses. Silakan periksa kembali nanti.",
        })
      } else {
        toast({
          title: "Pembayaran belum terdeteksi",
          description: "Sistem belum mendeteksi pembayaran Anda. Silakan coba lagi nanti.",
        })
      }
    } catch (err) {
      setStatus("failed")
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error || "Gagal memeriksa status pembayaran. Silakan coba lagi.",
      })
    }
  }

  // If payment is completed and we need to show the WhatsApp form
  if (showWhatsAppForm) {
    return <WhatsAppForm />
  }

  return (
    <Card className="shadow-lg border border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Status Pembayaran
          {status === "completed" && (
            <Badge className="bg-gradient-to-r from-primary to-primary text-white">Lunas</Badge>
          )}
          {status === "pending" && (
            <Badge variant="outline" className="border-primary-dark text-primary-dark">
              Menunggu Pembayaran
            </Badge>
          )}
          {status === "processing" && <Badge variant="secondary">Sedang Diproses</Badge>}
          {status === "failed" && <Badge variant="destructive">Gagal</Badge>}
          {status === "checking" && <Badge variant="secondary">Memeriksa...</Badge>}
        </CardTitle>
        <CardDescription>Periksa status pembayaran Anda untuk akses Perpusmu</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Information */}
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold">Informasi Pembayaran</h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Nama</dt>
              <dd className="font-medium">{payment?.nama || user?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">NIM</dt>
              <dd className="font-medium">{payment?.nim || user?.nim || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Jenis Pembayaran</dt>
              <dd className="font-medium">{payment?.jenisPembayaran || "TURNITIN DIPLOMA S1"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Jumlah</dt>
              <dd className="font-medium">
                {payment?.jumlahPembayaran
                  ? `Rp ${payment.jumlahPembayaran.toLocaleString("id-ID")}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Periode</dt>
              <dd className="font-medium">{payment?.periode || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status Pembayaran</dt>
              <dd className="font-medium">{payment?.statusPembayaran || "Belum ada data"}</dd>
            </div>
            {payment?.waktuPembayaran && (
              <div>
                <dt className="text-xs text-muted-foreground">Waktu Pembayaran</dt>
                <dd className="font-medium">{payment.waktuPembayaran}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Terakhir Diperiksa</dt>
              <dd className="font-medium">{lastChecked || "Belum diperiksa"}</dd>
            </div>
          </dl>
        </div>

        {/* Status Visualization */}
        <div className="space-y-2">
          {status === "checking" && (
            <>
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-12 animate-spin text-primary" />
              </div>
              <Progress
                value={66}
                className="h-2 bg-primary-lighter/30"
                indicatorColor="bg-gradient-to-r from-primary to-primary"
              />
              <p className="text-center text-sm text-muted-foreground">Sedang memeriksa status pembayaran Anda...</p>
            </>
          )}

          {status === "completed" && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ConfettiTrigger />
              <SuccessCheckmark />
              <h3 className="mt-4 text-xl font-medium">Pembayaran Berhasil!</h3>
              <p className="mt-2 text-muted-foreground">
                Pembayaran Anda telah dikonfirmasi. Silakan lengkapi data WhatsApp Anda untuk melanjutkan.
              </p>
            </div>
          )}

          {status === "pending" && (
            <Alert variant="warning">
              <AlertCircle className="size-5" />
              <AlertTitle>Pembayaran Belum Terdeteksi</AlertTitle>
              <AlertDescription>
                Sistem belum mendeteksi pembayaran Anda. Jika Anda sudah melakukan pembayaran, silakan klik tombol
                &quot;Perbarui Status&quot; untuk memeriksa kembali.
              </AlertDescription>
            </Alert>
          )}

          {status === "processing" && (
            <Alert variant="info">
              <RefreshCw className="size-5" />
              <AlertTitle>Pembayaran Sedang Diproses</AlertTitle>
              <AlertDescription>
                Pembayaran Anda sedang diproses oleh sistem. Proses ini biasanya membutuhkan waktu 5-15 menit.
                Silakan periksa kembali nanti.
              </AlertDescription>
            </Alert>
          )}

          {status === "failed" && (
            <Alert variant="destructive">
              <AlertCircle className="size-5" />
              <AlertTitle>Pembayaran Gagal</AlertTitle>
              <AlertDescription>
                Sistem tidak dapat mengonfirmasi pembayaran Anda. Silakan hubungi bagian administrasi kampus
                untuk bantuan.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Payment Instructions */}
        {(status === "pending" || status === "failed") && (
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Cara Pembayaran</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pembayaran dilakukan melalui pihak universitas. Hubungi bagian administrasi kampus untuk
              menyelesaikan pembayaran akses Perpusmu, lalu klik{" "}
              <span className="font-medium text-foreground">&quot;Perbarui Status&quot;</span> untuk memeriksa kembali.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {status !== "completed" && (
          <Button onClick={handleCheckPayment} disabled={isLoading || status === "checking"} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Memeriksa...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Perbarui Status
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Ada kendala pembayaran? Hubungi{" "}
          <span className="font-medium">support@perpusmu.ac.id</span> atau{" "}
          <span className="font-medium">021-1234-5678</span>.
        </p>
      </CardFooter>
    </Card>
  )
}

