"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, GraduationCap, BookOpen, ShieldCheck } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { StaggerContainer, StaggerItem, BounceIn } from "@/components/ui/motion"

export function RoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const { login, isLoading, error } = useAuthStore()

  const handleRoleSelection = async (role: string) => {
    setSelectedRole(role)

    try {
      // Login with the selected role
      const user = await login(role)

      // Show success toast
      toast({
        title: "Login berhasil",
        description: `Anda masuk sebagai ${role === "student" ? "Mahasiswa" : role === "instructor" ? "Instruktur" : "Admin"}`,
      })

      // Redirect based on role and payment status
      if (role === "student" && !user.hasCompletedPayment) {
        router.push("/payment")
      } else {
        router.push(`/dashboard/${role}`)
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login gagal",
        description: error || "Terjadi kesalahan saat masuk. Silakan coba lagi.",
      })
      setSelectedRole(null)
    }
  }

  return (
    <StaggerContainer className="grid gap-4">
      <StaggerItem>
        <Card
          className={`cursor-pointer transition-all duration-300 hover:border-primary-dark hover:shadow-lg hover:shadow-primary-dark/10 hover:-translate-y-1 ${
            selectedRole === "student" ? "border-2 border-primary-dark shadow-lg shadow-primary-dark/20" : ""
          }`}
          onClick={() => !isLoading && handleRoleSelection("student")}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <BounceIn>
              <div className="rounded-full bg-primary-lighter p-3">
                <GraduationCap className="h-6 w-6 text-primary-dark" />
              </div>
            </BounceIn>
            <div className="flex-1">
              <h3 className="font-medium">Masuk sebagai Mahasiswa</h3>
              <p className="text-sm text-muted-foreground">Akses dashboard mahasiswa</p>
            </div>
            {isLoading && selectedRole === "student" && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card
          className={`cursor-pointer transition-all duration-300 hover:border-primary-dark hover:shadow-lg hover:shadow-primary-dark/10 hover:-translate-y-1 ${
            selectedRole === "instructor" ? "border-2 border-primary-dark shadow-lg shadow-primary-dark/20" : ""
          }`}
          onClick={() => !isLoading && handleRoleSelection("instructor")}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <BounceIn delay={0.1}>
              <div className="rounded-full bg-primary-lighter p-3">
                <BookOpen className="h-6 w-6 text-primary-dark" />
              </div>
            </BounceIn>
            <div className="flex-1">
              <h3 className="font-medium">Masuk sebagai Instruktur</h3>
              <p className="text-sm text-muted-foreground">Akses dashboard instruktur</p>
            </div>
            {isLoading && selectedRole === "instructor" && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card
          className={`cursor-pointer transition-all duration-300 hover:border-primary-dark hover:shadow-lg hover:shadow-primary-dark/10 hover:-translate-y-1 ${
            selectedRole === "admin" ? "border-2 border-primary-dark shadow-lg shadow-primary-dark/20" : ""
          }`}
          onClick={() => !isLoading && handleRoleSelection("admin")}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <BounceIn delay={0.2}>
              <div className="rounded-full bg-primary-lighter p-3">
                <ShieldCheck className="h-6 w-6 text-primary-dark" />
              </div>
            </BounceIn>
            <div className="flex-1">
              <h3 className="font-medium">Masuk sebagai Admin</h3>
              <p className="text-sm text-muted-foreground">Akses dashboard admin</p>
            </div>
            {isLoading && selectedRole === "admin" && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

