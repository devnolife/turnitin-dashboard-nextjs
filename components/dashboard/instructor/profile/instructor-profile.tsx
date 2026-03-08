"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/store/auth-store"
import { Mail, Phone, BookOpen, Award } from "lucide-react"

export function InstructorProfile() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Profil Instruktur</h2>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt={user?.name || "Instructor"} />
              <AvatarFallback className="bg-turnitin-navy text-white text-xl">
                {user?.email?.substring(0, 2).toUpperCase() || "IN"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-semibold">{user?.name || "Instruktur"}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2" variant="secondary">Instruktur</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" /> Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{user?.email || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" /> Bidang Keahlian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Computer Science</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

