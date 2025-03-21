import type { Metadata } from "next"
import { WhatsAppForm } from "@/components/payment/whatsapp-form"

export const metadata: Metadata = {
  title: "WhatsApp Verification - Turnitin Campus",
  description: "Verify your WhatsApp number for Turnitin Campus",
}

export default function WhatsAppVerificationPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Verifikasi WhatsApp</h1>
        <p className="mt-2 text-muted-foreground">Lengkapi nomor WhatsApp Anda untuk mengakses layanan Turnitin</p>
      </div>

      <div className="mx-auto max-w-md">
        <WhatsAppForm />
      </div>
    </div>
  )
}

