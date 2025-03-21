import type { Metadata } from "next"
import { PaymentStatusChecker } from "@/components/payment/payment-status-checker"

export const metadata: Metadata = {
  title: "Status Pembayaran - Turnitin Campus",
  description: "Periksa status pembayaran Anda untuk akses Turnitin",
}

export default function PaymentPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Status Pembayaran Turnitin</h1>
        <p className="mt-2 text-muted-foreground">Periksa status pembayaran Anda untuk mengakses layanan Turnitin</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <PaymentStatusChecker />
      </div>
    </div>
  )
}

