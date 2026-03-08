import type React from "react"
import { Outfit } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata = {
  title: "Turnitin Campus",
  description: "Student Registration Dashboard for Turnitin",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}