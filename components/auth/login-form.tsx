"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, User, Lock } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username minimal 3 karakter.",
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter.",
  }),
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
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

      // Redirect based on role
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
        description: "Username atau password salah. Silakan coba lagi.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Masukkan username"
                    className="pl-10 focus:ring-2 focus:ring-primary/50 transition-all"
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 focus:ring-2 focus:ring-primary/50 transition-all"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          variant="gradient"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>
    </Form>
  )
}

