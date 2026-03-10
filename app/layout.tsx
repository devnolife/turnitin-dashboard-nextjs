import type React from "react"
import { Outfit } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata = {
  title: "Perpusmu - Universitas Muhammadiyah Makassar",
  description: "Sistem Manajemen Perpustakaan Digital Universitas Muhammadiyah Makassar",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
