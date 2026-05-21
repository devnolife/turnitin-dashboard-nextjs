import type { Metadata } from "next"
import { ChangePasswordPage } from "@/components/auth/change-password-page"

export const metadata: Metadata = {
  title: "Ganti Password - Perpusmu",
  description: "Ganti password akun Perpusmu",
}

export default function Page() {
  return <ChangePasswordPage />
}
