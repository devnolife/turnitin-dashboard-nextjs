import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Perpusmu - Universitas Muhammadiyah Makassar",
    template: "%s | Perpusmu",
  },
  description: "Sistem Manajemen Perpustakaan Digital Universitas Muhammadiyah Makassar",
  openGraph: {
    title: "Perpusmu - Universitas Muhammadiyah Makassar",
    description: "Sistem Manajemen Perpustakaan Digital Universitas Muhammadiyah Makassar",
    type: "website",
    locale: "id_ID",
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
