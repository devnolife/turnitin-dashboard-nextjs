import type { Metadata } from "next"
import LoginPageClient from "@/components/auth/login-page-client"

export const metadata: Metadata = {
  title: "Login - Perpusmu",
  description: "Login ke akun Perpusmu Universitas Muhammadiyah Makassar",
}

export default function LoginPage() {
  return <LoginPageClient />
}


