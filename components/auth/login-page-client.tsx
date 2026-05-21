"use client"

import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, ShieldCheck, Sparkles, GraduationCap } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"

const highlights = [
  {
    icon: ShieldCheck,
    title: "Deteksi Plagiarisme Akurat",
    desc: "Verifikasi orisinalitas berbasis standar akademik.",
  },
  {
    icon: GraduationCap,
    title: "Terintegrasi SIMAK UNISMUH",
    desc: "Login langsung dengan akun kampus Anda.",
  },
  {
    icon: Sparkles,
    title: "Alur Pengajuan Modern",
    desc: "Antarmuka rapi, proses cepat, notifikasi real-time.",
  },
]

const stats = [
  { value: "12k+", label: "Mahasiswa" },
  { value: "320+", label: "Dosen" },
  { value: "98%", label: "Akurasi" },
]

export default function LoginPageClient() {
  return (
    <div className="relative flex h-screen min-h-[640px] w-full flex-col overflow-hidden bg-primary-lighter/30 dark:bg-gray-950 theme-transition">
      {/* Decorative background layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl animate-blob" />
        <div className="login-blob-delay-1 absolute top-1/3 -right-24 h-[26rem] w-[26rem] rounded-full bg-secondary/60 blur-3xl animate-blob" />
        <div className="login-blob-delay-2 absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-accent/25 blur-3xl animate-blob" />

        {/* Soft dot grid */}
        <div className="login-dot-grid absolute inset-0 opacity-[0.18] dark:opacity-[0.08]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 py-3 md:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/40 blur-md transition-all group-hover:bg-primary/60" />
            <Image
              src="/logo.jpg"
              alt="Logo Unismuh Makassar"
              width={32}
              height={32}
              className="rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-md"
            />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-primary-dark dark:text-white">
              Perpusmu
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              UNISMUH Makassar
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-white/70 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-md dark:bg-white/5 md:flex">
          <span className="relative inline-flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Layanan beroperasi normal
        </div>
      </header>

      {/* Main split card */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 min-h-0 items-center justify-center px-4 pb-4 md:px-8">
        <div className="grid h-full w-full overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/70 shadow-[0_25px_70px_-25px_rgba(63,118,179,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60 md:grid-cols-[1.05fr_1fr]">
          {/* LEFT: Brand / Highlights */}
          <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#2c5f8d] p-10 text-white md:flex lg:p-12">
            {/* Decorative shapes */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-16 size-72 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-10 -left-10 size-60 animate-blob rounded-[40%_60%_60%_40%/50%_50%_50%_50%] bg-secondary/30 blur-2xl" />
              <svg
                className="absolute inset-0 h-full w-full opacity-[0.07]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur">
                <Sparkles className="size-3.5" /> Sistem Cek Plagiarisme
              </span>

              <h1 className="mt-5 text-balance text-[2.5rem] font-bold leading-[1.05] tracking-tight lg:text-[2.75rem]">
                Karya akademik
                <br />
                <span className="text-secondary">terverifikasi</span>,
                <br />
                proses tugas lebih ringkas.
              </h1>

              <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
                Platform resmi Universitas Muhammadiyah Makassar untuk pengelolaan
                pengecekan plagiarisme tugas akhir, makalah, dan publikasi mahasiswa.
              </p>
            </div>

            <ul className="relative mt-8 space-y-3">
              {highlights.map((h, i) => (
                <li
                  key={h.title}
                  className={`animate-in slide-in-left flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition-colors hover:bg-white/10 stagger-${i + 1}`}
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <h.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold leading-tight">{h.title}</p>
                    <p className="mt-1 text-[12.5px] text-white/70">{h.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="relative mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[1.7rem] font-bold tracking-tight">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: Login form */}
          <section className="relative flex items-center justify-center p-6 sm:p-10 md:p-12 lg:p-14">
            {/* Mobile brand strip */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white md:hidden">
              <Sparkles className="size-3" /> Perpusmu UNISMUH
            </div>

            <div className="animate-in slide-in-bottom stagger-1 w-full max-w-[26rem] pt-8 md:pt-0">
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark dark:bg-primary/15 dark:text-primary-lighter">
                  <CheckCircle2 className="size-3.5" /> Masuk Akun
                </span>
                <h2 className="mt-4 text-[1.95rem] font-bold tracking-tight text-foreground">
                  Selamat datang kembali.
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  Gunakan NIM atau username SIMAK UNISMUH untuk melanjutkan ke
                  dashboard.
                </p>
              </div>

              <LoginForm />

              <div className="mt-8 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-dashed border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white/80 px-3 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur dark:bg-gray-900/80">
                      Butuh bantuan?
                    </span>
                  </div>
                </div>

                <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
                  Hubungi admin Perpusmu jika lupa password atau mengalami kendala
                  login melalui WhatsApp resmi kampus.
                </p>

                <p className="text-center text-[11.5px] text-muted-foreground">
                  Dengan masuk, Anda menyetujui{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-primary-dark underline-offset-4 hover:underline dark:text-primary-lighter"
                  >
                    Ketentuan Layanan
                  </Link>{" "}
                  &{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary-dark underline-offset-4 hover:underline dark:text-primary-lighter"
                  >
                    Kebijakan Privasi
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 shrink-0 pb-4 text-center text-[11px] tracking-wide text-muted-foreground">
        &copy; {new Date().getFullYear()} Perpusmu — Universitas Muhammadiyah Makassar
      </footer>
    </div>
  )
}
