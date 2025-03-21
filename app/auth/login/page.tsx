import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { RoleSelectionForm } from "@/components/auth/role-selection-form"
import { AnimatedBlob, AnimatedGradient } from "@/components/ui/motion"

export const metadata: Metadata = {
  title: "Login - Turnitin Campus",
  description: "Login to your Turnitin account",
}

export default function LoginPage() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-turnitin-navy via-turnitin-blue to-turnitin-teal" />

        {/* Animated background elements */}
        <AnimatedBlob color="secondary" size="lg" className="left-20 top-20 opacity-30" />
        <AnimatedBlob color="accent" size="md" className="right-20 bottom-20 opacity-30" />
        <AnimatedGradient className="opacity-30" />

        <div className="relative z-20 flex items-center text-2xl font-bold">
          <Image
            src="/placeholder.svg?height=48&width=48"
            alt="Turnitin Logo"
            width={48}
            height={48}
            className="mr-3"
          />
          <span className="text-white">Turnitin Campus</span>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl text-white">
              "Turnitin has transformed how we ensure academic integrity and provide valuable feedback to our students."
            </p>
            <footer className="text-sm text-turnitin-mint">Dr. Sarah Johnson - University of Education</footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8 relative">
        {/* Mobile background blobs */}
        <div className="absolute inset-0 overflow-hidden -z-10 lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-turnitin-navy/10 via-turnitin-blue/10 to-turnitin-teal/10" />
          <AnimatedBlob color="primary" size="lg" className="-left-40 -top-40 opacity-20" />
          <AnimatedBlob color="secondary" size="md" className="right-0 bottom-0 opacity-20" />
        </div>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] relative">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Pilih Peran Anda</h1>
            <p className="text-sm text-muted-foreground">Silakan pilih peran untuk masuk ke dashboard</p>
          </div>

          <RoleSelectionForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            Dengan masuk, Anda menyetujui{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-turnitin-navy">
              Ketentuan Layanan
            </Link>{" "}
            dan{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-turnitin-navy">
              Kebijakan Privasi
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

