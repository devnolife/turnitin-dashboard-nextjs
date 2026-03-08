import type React from "react"
import { AuthNav } from "@/components/auth-nav"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <AuthNav />
      {children}
    </div>
  )
}
