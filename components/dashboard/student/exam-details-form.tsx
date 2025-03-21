"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, FileText, CheckCircle2 } from "lucide-react"
import { useAuthStore, type ExamType } from "@/lib/store/auth-store"
import { motion } from "framer-motion"
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion"

// Validation schema for exam details
const formSchema = z.object({
  thesisTitle: z
    .string()
    .min(10, {
      message: "Judul skripsi harus minimal 10 karakter.",
    })
    .max(200, {
      message: "Judul skripsi tidak boleh lebih dari 200 karakter.",
    }),
  examType: z.enum(["proposal_defense", "results_defense", "final_defense"], {
    required_error: "Silakan pilih jenis ujian.",
  }),
})

export function ExamDetailsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const { submitExamDetails } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thesisTitle: "",
      examType: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Submit exam details
      await submitExamDetails({
        thesisTitle: values.thesisTitle,
        examType: values.examType as ExamType,
      })

      // Show success animation
      setIsSuccess(true)

      toast({
        title: "Detail ujian berhasil dikirim",
        description: "Detail ujian Anda sedang diverifikasi oleh administrator.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal mengirim detail ujian",
        description: "Silakan periksa data Anda dan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <FadeIn>
        <Card className="shadow-lg border-2 border-success/20">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/20"
            >
              <CheckCircle2 className="h-10 w-10 text-success" />
            </motion.div>
            <CardTitle className="text-2xl">Detail Ujian Terkirim!</CardTitle>
            <CardDescription>
              Detail ujian Anda telah berhasil dikirim dan sedang menunggu verifikasi administrator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Anda akan mendapatkan notifikasi melalui WhatsApp ketika detail ujian Anda telah diverifikasi.
            </p>
            <p className="text-muted-foreground">Proses verifikasi biasanya membutuhkan waktu 1-2 hari kerja.</p>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  return (
    <SlideUp>
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="gradient-text">Detail Ujian Skripsi</span>
          </CardTitle>
          <CardDescription>
            Silakan lengkapi detail ujian skripsi Anda untuk mengakses dashboard Turnitin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <StaggerContainer>
                <StaggerItem>
                  <FormField
                    control={form.control}
                    name="thesisTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Skripsi</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Masukkan judul skripsi Anda"
                              className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Masukkan judul lengkap skripsi Anda sesuai dengan dokumen resmi.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </StaggerItem>

                <StaggerItem>
                  <FormField
                    control={form.control}
                    name="examType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Ujian</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                              <SelectValue placeholder="Pilih jenis ujian" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="proposal_defense">Sidang Proposal</SelectItem>
                            <SelectItem value="results_defense">Sidang Hasil</SelectItem>
                            <SelectItem value="final_defense">Sidang Akhir</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Pilih jenis ujian yang akan Anda ikuti.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </StaggerItem>

                <StaggerItem>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    variant="gradient"
                    withRipple
                    isLoading={isSubmitting}
                    loadingText="Mengirim..."
                  >
                    Kirim Detail Ujian
                  </Button>
                </StaggerItem>
              </StaggerContainer>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-center text-muted-foreground">
            Detail ujian Anda akan diverifikasi oleh administrator sebelum Anda dapat mengakses dashboard Turnitin.
          </p>
        </CardFooter>
      </Card>
    </SlideUp>
  )
}

