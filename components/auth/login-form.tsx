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
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock response - in a real app, this would come from your API
      const mockResponse = {
        success: true,
        user: {
          id: "123",
          email: values.email,
          role: values.email.includes("admin")
            ? "admin"
            : values.email.includes("instructor")
              ? "instructor"
              : "student",
          hasCompletedPayment: !values.email.includes("unpaid"),
        },
      }

      if (mockResponse.success) {
        // Store user info in localStorage or state management
        localStorage.setItem("user", JSON.stringify(mockResponse.user))

        // Redirect based on role and payment status
        if (mockResponse.user.role === "student" && !mockResponse.user.hasCompletedPayment) {
          router.push("/payment")
        } else if (mockResponse.user.role === "student") {
          router.push("/dashboard/student")
        } else if (mockResponse.user.role === "instructor") {
          router.push("/dashboard/instructor")
        } else if (mockResponse.user.role === "admin") {
          router.push("/dashboard/admin")
        }

        toast({
          title: "Login successful",
          description: "Welcome to Turnitin Campus",
        })
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@example.com"
                  {...field}
                  className="focus:ring-2 focus:ring-turnitin-navy/50 transition-all"
                />
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
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  className="focus:ring-2 focus:ring-turnitin-navy/50 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-turnitin-navy hover:bg-turnitin-navy/90" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  )
}

