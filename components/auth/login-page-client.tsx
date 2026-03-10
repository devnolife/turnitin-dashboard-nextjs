"use client"

import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPageClient() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-primary-lighter/20 dark:bg-gray-900 transition-colors duration-300">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="z-10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Logo Unismuh Makassar"
              width={40}
              height={40}
              className="rounded-full shadow-md"
            />
            <h1 className="text-2xl font-bold text-primary-dark dark:text-white">Perpusmu</h1>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center z-10 py-12">
          <div className="mb-8 relative">
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary-dark/20 to-primary/20 rounded-full blur-3xl transform scale-150" />
            <Image
              src="/logo.jpg"
              alt="Logo Universitas Muhammadiyah Makassar"
              width={200}
              height={200}
              className="rounded-3xl shadow-xl"
              priority
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-dark dark:text-white">
            Selamat Datang di{" "}
            <span className="gradient-text">Perpusmu</span>
          </h2>

          <p className="text-muted-foreground max-w-md">
            Sistem Manajemen Perpustakaan Digital Universitas Muhammadiyah Makassar
          </p>
        </div>

        <div className="z-10 text-sm text-muted-foreground text-center md:text-left">
          <blockquote className="space-y-2">
            <p className="text-sm italic text-primary-dark/80 dark:text-primary-lighter/80">
              &ldquo;Perpusmu memudahkan mahasiswa dalam mengakses layanan perpustakaan digital kampus.&rdquo;
            </p>
            <footer className="text-xs text-muted-foreground">— Universitas Muhammadiyah Makassar</footer>
          </blockquote>
        </div>

        {/* Background blobs */}
        <div className="absolute -z-0 top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-dark/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-2xl p-6 md:p-12 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-primary-dark dark:text-white">Masuk</h2>
          <p className="text-muted-foreground mb-8">
            Masukkan email dan password Anda untuk mengakses dashboard.
          </p>

          <LoginForm />

          <div className="mt-8">
            <p className="text-center text-sm text-muted-foreground">
              Dengan masuk, Anda menyetujui{" "}
              <Link
                href="/terms"
                className="text-primary hover:text-primary-dark hover:underline font-medium"
              >
                Ketentuan Layanan
              </Link>{" "}
              dan{" "}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary-dark hover:underline font-medium"
              >
                Kebijakan Privasi
              </Link>
              .
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Perpusmu - Universitas Muhammadiyah Makassar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
