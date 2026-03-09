"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, UserPlus } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { DashboardMainCard } from "@/components/dashboard/main-card"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username minimal 3 karakter.",
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter.",
  }),
  confirmPassword: z.string(),
  name: z.string().optional(),
  email: z.string().email({ message: "Email tidak valid." }).optional().or(z.literal("")),
  whatsappNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok.",
  path: ["confirmPassword"],
})

export function AddInstructorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
      whatsappNumber: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Instruktur berhasil ditambahkan",
        description: `Instruktur "${values.username}" telah ditambahkan ke sistem.`,
      })

      router.push("/dashboard/admin/instructors")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan instruktur. Silakan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardMainCard
      title="Tambah Instruktur"
      subtitle="Tambahkan instruktur baru ke sistem 👤"
      icon={UserPlus}
    >
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin/instructors")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Kembali</span>
        </Button>
        <span className="text-sm text-muted-foreground">Kembali ke daftar instruktur</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Required fields */}
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="gradient-text">Informasi Wajib</CardTitle>
            <CardDescription>Username dan password untuk login instruktur</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="instruktur_baru" {...field} />
                      </FormControl>
                      <FormDescription>Username untuk login ke sistem</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Ulangi password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Optional fields */}
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="gradient-text">Informasi Tambahan</CardTitle>
            <CardDescription>Opsional — bisa diisi nanti</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama instruktur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="instruktur@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="+6281234567890" {...field} />
                      </FormControl>
                      <FormDescription>Untuk notifikasi dan komunikasi</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/admin/instructors")}>
          Batal
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Menyimpan..." : "Simpan Instruktur"}
        </Button>
      </div>
    </DashboardMainCard>
  )
}

