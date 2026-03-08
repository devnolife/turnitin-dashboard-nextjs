import type { Metadata } from "next"
import LoginPageClient from "@/components/auth/login-page-client"

export const metadata: Metadata = {
  title: "Login - Turnitin Campus",
  description: "Login to your Turnitin account",
}

export default function LoginPage() {
  return <LoginPageClient />
}


