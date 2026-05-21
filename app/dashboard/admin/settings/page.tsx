"use client"

import Link from "next/link"
import {
  Settings,
  CircleDollarSign,
  FileBarChart,
  BookOpen,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardMainCard } from "@/components/dashboard/main-card"

type SettingEntry = {
  href?: string
  icon: typeof Settings
  title: string
  description: string
  comingSoon?: boolean
}

const ENTRIES: SettingEntry[] = [
  {
    href: "/dashboard/admin/settings/pricing",
    icon: CircleDollarSign,
    title: "Tarif Pembayaran",
    description: "Atur tarif mahasiswa & honor instruktur per strata (S1/S2/S3).",
  },
  {
    href: "/dashboard/admin/faculties",
    icon: Building2,
    title: "Fakultas & Program Studi",
    description: "Kelola daftar fakultas dan program studi.",
  },
  {
    href: "/dashboard/admin/instructors",
    icon: GraduationCap,
    title: "Instruktur",
    description: "Tambah, edit, atau nonaktifkan instruktur Turnitin.",
  },
  {
    href: "/dashboard/admin/rekap",
    icon: FileBarChart,
    title: "Rekap Plagiasi",
    description: "Bangun rekap bulanan dan ekspor ke Excel.",
  },
  {
    title: "Aturan Similarity per Prodi",
    icon: BookOpen,
    href: "/dashboard/admin/students",
    description:
      "Atur batas % similarity per bab atau per ujian, dapat diatur per prodi dari halaman prodi.",
  },
  {
    title: "Tampilan & Branding",
    icon: Sparkles,
    description: "Logo, nama institusi, dan tema warna (segera hadir).",
    comingSoon: true,
  },
]

export default function AdminSettingsPage() {
  return (
    <DashboardMainCard
      title="Pengaturan Sistem"
      subtitle="Kelola konfigurasi dan preferensi sistem ⚙️"
      icon={Settings}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ENTRIES.map((entry) => {
          const content = (
            <Card
              className={`h-full rounded-3xl border border-border shadow-sm transition ${
                entry.comingSoon ? "opacity-70" : "hover-lift hover:border-primary/40"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <entry.icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{entry.title}</CardTitle>
                    </div>
                  </div>
                  {entry.comingSoon && (
                    <Badge variant="secondary" className="shrink-0">
                      Segera
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-2">{entry.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {entry.comingSoon ? (
                  <Button variant="outline" className="w-full rounded-full" disabled>
                    Belum tersedia
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full rounded-full">
                    Kelola <ArrowRight className="ml-2 size-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )

          if (entry.comingSoon || !entry.href) {
            return <div key={entry.title}>{content}</div>
          }
          return (
            <Link key={entry.title} href={entry.href} className="block">
              {content}
            </Link>
          )
        })}
      </div>
    </DashboardMainCard>
  )
}
