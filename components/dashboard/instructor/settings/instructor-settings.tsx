"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Settings } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { PageTransition } from "@/components/ui/motion"

export function InstructorSettings() {
  return (
    <PageTransition>
      <DashboardMainCard title="Pengaturan" subtitle="Kelola preferensi dan informasi akun Anda ⚙️" icon={Settings}>
        <div className="space-y-6">
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Notifikasi</CardTitle>
              <CardDescription>Kelola preferensi notifikasi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif">Notifikasi Email</Label>
                <Switch id="email-notif" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="submission-notif">Submission Baru</Label>
                <Switch id="submission-notif" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="message-notif">Pesan Masuk</Label>
                <Switch id="message-notif" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Akun</CardTitle>
              <CardDescription>Kelola informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Nama Tampilan</Label>
                <Input id="display-name" placeholder="Nama Anda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <Separator />
              <Button>Simpan Perubahan</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardMainCard>
    </PageTransition>
  )
}

