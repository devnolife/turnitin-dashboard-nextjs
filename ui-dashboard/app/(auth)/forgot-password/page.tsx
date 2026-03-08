"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, AtSign, CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FloatingElements } from "@/components/floating-elements"

// Form schema with validation
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Initialize form
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  // Handle form submission
  async function onSubmit(data: ForgotPasswordValues) {
    setIsLoading(true)

    // Simulate API call
    console.log("Reset password for:", data.email)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f0f7ff] dark:bg-gray-900 p-4 md:p-8">
      {/* Floating background elements */}
      <FloatingElements />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 z-10"
      >
        <Link href="/login">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#e6f1fa] dark:bg-[#2c4c6b]/30 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[#5fa2db]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{isSubmitted ? "Check your email" : "Forgot password?"}</h2>
          <p className="text-muted-foreground">
            {isSubmitted
              ? "We've sent you a link to reset your password."
              : "No worries, we'll send you reset instructions."}
          </p>
        </div>

        {isSubmitted ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="font-medium">{form.getValues().email}</span>, you will receive
              an email with instructions to reset your password.
            </p>

            <div className="pt-4">
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white hover:from-[#4a8bc7] hover:to-[#6aa7d9] shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => setIsSubmitted(false)}
              >
                Back to reset password
              </Button>
            </div>

            <div className="pt-2">
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to login
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#5fa2db]" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="name@example.com"
                          className="pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus-visible:ring-[#5fa2db] h-12"
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
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white hover:from-[#4a8bc7] hover:to-[#6aa7d9] shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          </Form>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
        <p>
          Remember your password?{" "}
          <Link href="/login" className="text-[#5fa2db] hover:text-[#4a8bc7] hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </motion.div>

      {/* Background gradient blobs */}
      <div className="fixed -z-0 inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#5fa2db]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#7ab8e6]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>
    </div>
  )
}
