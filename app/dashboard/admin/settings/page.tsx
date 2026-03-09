"use client"

import { Settings, Bell, Shield, Globe, Database, Palette } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardMainCard } from "@/components/dashboard/main-card"

export default function AdminSettingsPage() {
  const settingsGroups = [
    {
      icon: Globe,
      title: "Pengaturan Umum",
      description: "Nama situs, bahasa, dan zona waktu",
      action: "Kelola",
    },
    {
      icon: Shield,
      title: "Keamanan",
      description: "Autentikasi, password policy, dan akses",
      action: "Kelola",
    },
    {
      icon: Bell,
      title: "Notifikasi",
      description: "Email, push notification, dan alerts",
      action: "Kelola",
    },
    {
      icon: Database,
      title: "Data & Backup",
      description: "Backup database, export, dan restore",
      action: "Kelola",
    },
    {
      icon: Palette,
      title: "Tampilan",
      description: "Tema, logo, dan branding situs",
      action: "Kelola",
    },
    {
      icon: Settings,
      title: "Turnitin API",
      description: "Konfigurasi integrasi Turnitin API",
      action: "Kelola",
    },
  ]

  return (
    <DashboardMainCard
      title="Pengaturan Sistem"
      subtitle="Kelola konfigurasi dan preferensi sistem ⚙️"
      icon={Settings}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsGroups.map((group) => (
          <Card
            key={group.title}
            className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover-lift"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <group.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{group.title}</CardTitle>
                  <CardDescription className="text-xs">{group.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full rounded-full">
                {group.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardMainCard>
  )
}
