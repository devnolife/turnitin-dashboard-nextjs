"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Moon, Sun, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/store/auth-store"
import { motion } from "framer-motion"
import { FadeIn, SlideInRight } from "@/components/ui/motion"

interface DashboardHeaderProps {
  user: any | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState(3)
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  const getInitials = (email: string | undefined) => {
    // Check if email is undefined or null
    if (!email) return "UN" // Return default initials for undefined

    // Safely access the email parts
    return email.split("@")[0].substring(0, 2).toUpperCase()
  }

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return "" // Return empty string if role is undefined

    switch (role) {
      case "student":
        return "Mahasiswa"
      case "instructor":
        return "Instruktur"
      case "admin":
        return "Admin"
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  return (
    <FadeIn>
      <header className="sticky top-0 z-10 border-b bg-turnitin-navy text-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <motion.div
            className="flex items-center gap-2 font-semibold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href={`/dashboard/${user?.role || ""}`} className="text-xl font-bold">
              Turnitin Campus
            </Link>
            <Badge variant="outline" className="ml-2 border-turnitin-teal text-turnitin-teal">
              {getRoleLabel(user?.role)}
            </Badge>
          </motion.div>

          <SlideInRight className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-turnitin-navy/80">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <motion.span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-turnitin-teal text-xs text-turnitin-navy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      {notifications}
                    </motion.span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="font-medium">Umpan balik baru diterima</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="font-medium">Pengiriman berhasil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="font-medium">Pembayaran dikonfirmasi</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setNotifications(0)}>Tandai semua sebagai dibaca</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-white hover:bg-turnitin-navy/80"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.email || "User"} />
                      <AvatarFallback className="bg-turnitin-teal text-turnitin-navy">
                        {getInitials(user?.email)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SlideInRight>
        </div>
      </header>
    </FadeIn>
  )
}

