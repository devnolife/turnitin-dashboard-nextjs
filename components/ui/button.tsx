"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-primary-dark to-primary text-white hover:opacity-90 shadow-sm transition-all",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        accent: "bg-primary text-primary-dark hover:bg-primary/90",
        mint: "bg-primary-lighter text-primary-dark hover:bg-primary-lighter/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  withRipple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, withRipple = true, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([])

    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!withRipple) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = Date.now()

      setRipples([...ripples, { x, y, id }])

      setTimeout(() => {
        setRipples((ripples) => ripples.filter((ripple) => ripple.id !== id))
      }, 600)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden active:scale-[0.98] transition-transform")}
        ref={ref}
        onClick={handleRipple}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText || props.children}
          </>
        ) : (
          props.children
        )}

        {withRipple &&
          ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 animate-ripple"
              style={{
                top: ripple.y,
                left: ripple.x,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          ))}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

