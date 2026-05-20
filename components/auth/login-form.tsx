"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight, Eye, EyeOff, Loader2, Lock, User } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "NIM / Username minimal 3 karakter.",
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter.",
  }),
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const user = await login(values.username, values.password)

      toast({
        title: "Login berhasil",
        description: "Selamat datang di Perpusmu",
      })

      if (user.role === "student") {
        router.push("/dashboard/student")
      } else if (user.role === "instructor") {
        router.push("/dashboard/instructor")
      } else if (user.role === "admin") {
        router.push("/dashboard/admin")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login gagal",
        description:
          error instanceof Error
            ? error.message
            : "NIM/Username atau password salah.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <fieldset disabled={isLoading} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  NIM / Username
                </FormLabel>
                <FormControl>
                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      autoComplete="username"
                      placeholder="Masukkan NIM atau username"
                      className="h-12 rounded-2xl border-border/70 bg-white/70 pl-11 text-[15px] shadow-sm transition-all placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 dark:bg-white/5"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-12 rounded-2xl border-border/70 bg-white/70 pl-11 pr-12 text-[15px] shadow-sm transition-all placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 dark:bg-white/5"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Sembunyikan password" : "Tampilkan password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <Button
          type="submit"
          disabled={isLoading}
          className="group relative h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-dark to-[#2c5f8d] text-[15px] font-semibold tracking-wide text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-90"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
          {isLoading ? (
            <span className="relative flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </span>
          ) : (
            <span className="relative flex items-center justify-center">
              Masuk ke Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </form>
    </Form>
  )
}
