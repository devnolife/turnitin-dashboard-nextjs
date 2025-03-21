"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, LogOut } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/store/auth-store"
import { usePaymentStore } from "@/lib/store/payment-store"
import { WhatsAppForm } from "./whatsapp-form"

export function PaymentStatusChecker() {
  const [status, setStatus] = useState<string>("checking")
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { user, logout } = useAuthStore()
  const { payment, isLoading, lastChecked, error, checkPaymentStatus } = usePaymentStore()

  // Check payment status on initial load
  useEffect(() => {
    const initialCheck = async () => {
      try {
        const paymentStatus = await checkPaymentStatus()
        setStatus(paymentStatus)

        // If payment is completed, show WhatsApp form
        if (paymentStatus === "completed") {
          // Check if user already has a WhatsApp number
          if (user?.whatsappNumber) {
            // If user already has a WhatsApp number, redirect to dashboard
            toast({
              title: "Pembayaran berhasil dikonfirmasi",
              description: "Anda akan dialihkan ke dashboard dalam beberapa detik.",
            })

            setTimeout(() => {
              router.push(`/dashboard/${user.role}`)
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
          description: error || "Gagal memeriksa status pembayaran. Silakan coba lagi.",
        })
      }
    }

    initialCheck()
  }, [checkPaymentStatus, error, router, toast, user])

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

  const handleReturnToLogin = () => {
    // Logout user
    logout()

    // Redirect to login page
    router.push("/auth/login")

    toast({
      title: "Kembali ke halaman login",
      description: "Anda dapat memilih peran yang berbeda atau mencoba lagi nanti.",
    })
  }

  // If payment is completed and we need to show the WhatsApp form
  if (showWhatsAppForm) {
    return <WhatsAppForm />
  }

  return (
    <Card className="shadow-lg border border-turnitin-teal/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Status Pembayaran
          {status === "completed" && (
            <Badge className="bg-gradient-to-r from-turnitin-blue to-turnitin-teal text-white">Lunas</Badge>
          )}
          {status === "pending" && (
            <Badge variant="outline" className="border-turnitin-navy text-turnitin-navy">
              Menunggu Pembayaran
            </Badge>
          )}
          {status === "processing" && <Badge variant="secondary">Sedang Diproses</Badge>}
          {status === "failed" && <Badge variant="destructive">Gagal</Badge>}
          {status === "checking" && <Badge variant="secondary">Memeriksa...</Badge>}
        </CardTitle>
        <CardDescription>Periksa status pembayaran Anda untuk akses Turnitin</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Information */}
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Informasi Pembayaran</h3>
          <div className="mt-4 grid gap-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Layanan:</span>
              <span className="font-medium">Akses Mahasiswa Turnitin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah:</span>
              <span className="font-medium">Rp 750.000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Periode:</span>
              <span className="font-medium">1 Tahun Akademik</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Pembayaran:</span>
              <span className="font-medium">Transfer Bank / QRIS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Terakhir Diperiksa:</span>
              <span className="font-medium">{lastChecked || "Belum diperiksa"}</span>
            </div>
          </div>
        </div>

        {/* Status Visualization */}
        <div className="space-y-2">
          {status === "checking" && (
            <>
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <Progress
                value={66}
                className="h-2 bg-turnitin-mint/30"
                indicatorColor="bg-gradient-to-r from-turnitin-blue to-turnitin-teal"
              />
              <p className="text-center text-sm text-muted-foreground">Sedang memeriksa status pembayaran Anda...</p>
            </>
          )}

          {status === "completed" && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h3 className="mt-4 text-xl font-medium">Pembayaran Berhasil!</h3>
              <p className="mt-2 text-muted-foreground">
                Pembayaran Anda telah dikonfirmasi. Silakan lengkapi data WhatsApp Anda untuk melanjutkan.
              </p>
            </div>
          )}

          {status === "pending" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Pembayaran Belum Terdeteksi
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                    <p>
                      Sistem belum mendeteksi pembayaran Anda. Jika Anda sudah melakukan pembayaran, silakan klik tombol
                      "Perbarui" untuk memeriksa kembali status pembayaran.
                    </p>
                    <p className="mt-2">
                      Jika Anda ingin memilih peran yang berbeda, Anda dapat kembali ke halaman login.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <div className="flex">
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Pembayaran Sedang Diproses</h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <p>
                      Pembayaran Anda sedang diproses oleh sistem. Proses ini biasanya membutuhkan waktu 5-15 menit.
                      Silakan periksa kembali nanti.
                    </p>
                    <p className="mt-2">
                      Jika Anda ingin memilih peran yang berbeda, Anda dapat kembali ke halaman login.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Pembayaran Gagal</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                    <p>
                      Sistem tidak dapat mengonfirmasi pembayaran Anda. Silakan periksa metode pembayaran Anda dan coba
                      lagi.
                    </p>
                    <p className="mt-2">
                      Jika Anda ingin memilih peran yang berbeda, Anda dapat kembali ke halaman login.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Instructions */}
        {(status === "pending" || status === "failed") && (
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Petunjuk Pembayaran</h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>
                Transfer Rp 750.000 ke rekening berikut:
                <div className="mt-1 rounded bg-muted p-2 font-mono text-sm">
                  Bank Mandiri
                  <br />
                  No. Rekening: 1234-5678-9012-3456
                  <br />
                  Atas Nama: PT Turnitin Indonesia
                </div>
              </li>
              <li>
                Atau scan kode QRIS berikut menggunakan aplikasi e-wallet atau mobile banking Anda:
                <div className="mt-2 flex justify-center">
                  <div className="h-48 w-48 rounded-lg border bg-white p-2">
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <span className="text-sm text-gray-500">[Kode QRIS]</span>
                    </div>
                  </div>
                </div>
              </li>
              <li>Setelah melakukan pembayaran, klik tombol "Perbarui" untuk memeriksa status pembayaran.</li>
              <li>Jika pembayaran berhasil, Anda akan diminta untuk memasukkan nomor WhatsApp Anda.</li>
            </ol>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        {status !== "completed" && (
          <>
            <Button onClick={handleCheckPayment} disabled={isLoading || status === "checking"} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Memeriksa...
                </>
              )}
            </Button>

            {(status === "pending" || status === "processing" || status === "failed") && (
              <>
                <Separator className="my-2" />

                <Button variant="outline" onClick={handleReturnToLogin} className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Kembali ke Halaman Login
                </Button>
              </>
            )}
          </>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Jika Anda mengalami masalah dengan pembayaran, silakan hubungi tim dukungan kami di{" "}
          <span className="font-medium">support@turnitin.co.id</span> atau telepon{" "}
          <span className="font-medium">021-1234-5678</span>.
        </p>
      </CardFooter>
    </Card>
  )
}

