"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ArrowLeft,
  AtSign,
  EyeIcon,
  EyeOffIcon,
  Github,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FloatingElements } from "@/components/floating-elements"

// Form schema with validation
const signupFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
})

type SignupFormValues = z.infer<typeof signupFormSchema>

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Initialize form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  })

  // Handle form submission
  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)

    // Simulate API call
    console.log("Signup data:", data)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    // In a real app, you would redirect to dashboard or handle errors
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f0f7ff] dark:bg-gray-900 transition-colors duration-300">
      {/* Floating background elements */}
      <FloatingElements />

      {/* Left side - Branding and illustration */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10"
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-2xl rotate-12 shadow-md">
              <Sparkles className="h-6 w-6 text-[#5fa2db]" />
            </div>
            <h1 className="text-2xl font-bold">EduGen</h1>
          </Link>
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col justify-center items-center text-center z-10 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="mb-6 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-[#5fa2db]/20 to-[#7ab8e6]/20 rounded-full blur-3xl transform scale-150"></div>
            <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden">
              <div className="absolute w-full h-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-24 w-24 text-white" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#a8d1f0]/30 rounded-full"></div>
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-[#5fa2db]/30 rounded-full"></div>
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Create Your Account
          </motion.h2>

          <motion.p
            className="text-muted-foreground max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Join EduGen and start creating amazing educational materials with the power of AI.
          </motion.p>
        </motion.div>

        <motion.div
          className="z-10 text-sm text-muted-foreground text-center md:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          &copy; 2023 EduGen. All rights reserved.
        </motion.div>

        {/* Background gradient blobs */}
        <div className="absolute -z-0 top-0 right-0 w-full h-full overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-72 h-72 bg-[#5fa2db]/20 rounded-full blur-3xl"
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
            className="absolute bottom-20 left-20 w-80 h-80 bg-[#7ab8e6]/20 rounded-full blur-3xl"
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

      {/* Right side - Signup form */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-2xl p-6 md:p-12 flex items-center justify-center relative z-10">
        <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex items-center mb-6">
            <Link href="/login" className="mr-4">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Button>
            </Link>
            <div className="flex-1">
              <h2 className="text-3xl font-bold">Sign Up</h2>
            </div>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-[#5fa2db]" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="John Doe"
                            className="pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus-visible:ring-[#5fa2db] h-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
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
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-[#5fa2db]" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus-visible:ring-[#5fa2db] h-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 rounded-lg"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#5fa2db] data-[state=checked]:border-[#5fa2db] mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          I agree to the{" "}
                          <Link
                            href="/terms"
                            className="text-[#5fa2db] hover:text-[#4a8bc7] hover:underline font-medium"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="text-[#5fa2db] hover:text-[#4a8bc7] hover:underline font-medium"
                          >
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white hover:from-[#4a8bc7] hover:to-[#6aa7d9] shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Create Account
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative flex items-center justify-center my-8">
                <Separator className="absolute w-full" />
                <span className="relative px-4 bg-white dark:bg-gray-800 text-muted-foreground text-sm">
                  Or continue with
                </span>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-2 hover:bg-[#e6f1fa] hover:text-[#5fa2db] hover:border-[#5fa2db] transition-all duration-300"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-2 hover:bg-[#e6f1fa] hover:text-[#5fa2db] hover:border-[#5fa2db] transition-all duration-300"
                >
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center mt-8">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#5fa2db] hover:text-[#4a8bc7] hover:underline font-medium">
                    Log in
                  </Link>
                </p>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  )
}
