"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/store/auth-store"
import { Mail, Shield, Users, User } from "lucide-react"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import { PageTransition } from "@/components/ui/motion"

export function InstructorProfile() {
  const { user } = useAuthStore()

  return (
    <PageTransition>
      <DashboardMainCard title="Profil" subtitle="Lihat dan kelola informasi profil Anda 👤" icon={User}>
        <div className="space-y-6">
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={user?.name || "Instructor"} />
                  <AvatarFallback className="bg-primary-dark text-white text-xl">
                    {user?.email?.substring(0, 2).toUpperCase() || "IN"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold">{user?.name || "Instruktur"}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge className="mt-2" variant="secondary">Pengawas Perpusmu</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4" /> Kontak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{user?.email || "-"}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" /> Peran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Pengawas upload dokumen Perpusmu mahasiswa</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardMainCard>
    </PageTransition>
  )
}

