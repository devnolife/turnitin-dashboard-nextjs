import type { Metadata } from "next"
import { OnboardingPage } from "@/components/auth/onboarding-page"

export const metadata: Metadata = {
  title: "Aktivasi Akun - Perpusmu",
  description: "Lengkapi aktivasi akun untuk mengakses Perpusmu",
}

export default function Page() {
  return <OnboardingPage />
}
