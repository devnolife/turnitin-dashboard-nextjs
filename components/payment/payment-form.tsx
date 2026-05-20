"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CreditCard, Building, Landmark } from "lucide-react"

const formSchema = z.object({
  paymentMethod: z.enum(["credit_card", "bank_transfer", "direct_debit"]),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "credit_card") {
    if (!data.cardName || data.cardName.trim().length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nama pada kartu minimal 3 karakter", path: ["cardName"] })
    }
    if (!data.cardNumber || !/^\d{13,19}$/.test(data.cardNumber.replace(/\s/g, ""))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nomor kartu tidak valid (13-19 digit)", path: ["cardNumber"] })
    }
    if (!data.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Format tanggal harus MM/YY", path: ["expiryDate"] })
    }
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CVV harus 3-4 digit", path: ["cvv"] })
    }
  }
  if (data.paymentMethod === "bank_transfer" || data.paymentMethod === "direct_debit") {
    if (!data.accountName || data.accountName.trim().length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nama rekening minimal 3 karakter", path: ["accountName"] })
    }
    if (!data.accountNumber || !/^\d{6,20}$/.test(data.accountNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nomor rekening harus 6-20 digit", path: ["accountNumber"] })
    }
  }
  if (data.paymentMethod === "bank_transfer") {
    if (!data.routingNumber || !/^\d{3,10}$/.test(data.routingNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Kode bank harus 3-10 digit", path: ["routingNumber"] })
    }
  }
})

export function PaymentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "credit_card",
    },
  })

  const paymentMethod = form.watch("paymentMethod")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Pembayaran berhasil",
        description: "Terima kasih atas pembayaran Anda. Anda sekarang memiliki akses penuh ke layanan Perpusmu.",
      })

      // Redirect to student dashboard
      router.push("/dashboard/student")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Pembayaran gagal",
        description: "Terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-md border border-primary/30">
      <CardHeader className="bg-primary-dark text-white rounded-t-xl">
        <CardTitle>Detail Pembayaran</CardTitle>
        <CardDescription className="text-primary">Pilih metode pembayaran yang Anda inginkan</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <fieldset disabled={isLoading} className="space-y-6">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="credit_card" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <div className="flex items-center">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Kartu Kredit
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="bank_transfer" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <div className="flex items-center">
                              <Building className="mr-2 h-4 w-4" />
                              Transfer Bank
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="direct_debit" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <div className="flex items-center">
                              <Landmark className="mr-2 h-4 w-4" />
                              Debit Langsung
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentMethod === "credit_card" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama pada Kartu</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Kartu</FormLabel>
                        <FormControl>
                          <Input placeholder="4242 4242 4242 4242" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Kadaluarsa</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "bank_transfer" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="routingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Bank</FormLabel>
                        <FormControl>
                          <Input placeholder="987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {paymentMethod === "direct_debit" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </fieldset>

            <Button type="submit" className="w-full bg-primary-dark" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Bayar Rp 750.000"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Informasi pembayaran Anda dienkripsi dan aman. Kami tidak menyimpan detail kartu kredit Anda secara lengkap.
        </p>
      </CardFooter>
    </Card>
  )
}

