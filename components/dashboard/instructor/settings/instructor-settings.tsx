"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function InstructorSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>

      <Card>
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

      <Card>
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
  )
}

