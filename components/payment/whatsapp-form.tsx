"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"

// Validation schema for WhatsApp number
const formSchema = z.object({
  whatsappNumber: z
    .string()
    .min(10, {
      message: "Nomor WhatsApp harus minimal 10 digit.",
    })
    .max(15, {
      message: "Nomor WhatsApp tidak boleh lebih dari 15 digit.",
    })
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, {
      message: "Format nomor WhatsApp tidak valid. Gunakan format +62, 62, atau 0 diikuti dengan 9-13 digit angka.",
    }),
})

export function WhatsAppForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { user, updateWhatsappNumber } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whatsappNumber: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Update WhatsApp number in the store
      await updateWhatsappNumber(values.whatsappNumber)

      // Show success state
      setIsSuccess(true)

      toast({
        title: "Nomor WhatsApp berhasil disimpan",
        description: "Anda akan dialihkan ke dashboard dalam beberapa detik.",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push(`/dashboard/${user?.role}`)
      }, 3000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal menyimpan nomor WhatsApp",
        description: "Silakan periksa nomor WhatsApp Anda dan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Pendaftaran Berhasil</CardTitle>
          <CardDescription className="text-center">Nomor WhatsApp Anda telah berhasil disimpan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <p className="mt-4 text-center">Anda akan dialihkan ke dashboard dalam beberapa detik...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border border-turnitin-teal/20">
      <CardHeader>
        <CardTitle className="text-turnitin-navy">Verifikasi Nomor WhatsApp</CardTitle>
        <CardDescription>Silakan masukkan nomor WhatsApp Anda untuk menyelesaikan pendaftaran</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+628123456789"
                      {...field}
                      className="focus:ring-2 focus:ring-turnitin-blue/50 transition-all"
                    />
                  </FormControl>
                  <FormDescription>
                    Masukkan nomor WhatsApp aktif Anda dengan format +62, 62, atau 0 diikuti dengan nomor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-turnitin-navy to-turnitin-blue"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan dan Lanjutkan"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-center text-muted-foreground">
          Nomor WhatsApp Anda akan digunakan untuk komunikasi penting terkait layanan Turnitin.
        </p>
      </CardFooter>
    </Card>
  )
}

