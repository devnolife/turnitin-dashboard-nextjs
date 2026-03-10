"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { cn } from "@/lib/utils"
import { type ReactNode, useState, useEffect } from "react"

// Fade in animation
export const FadeIn = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  ...props
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  [key: string]: any
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay, ease: [0.33, 1, 0.68, 1] }}
    className={className}
    {...props}
  >
    {typeof children === "function" ? children() : children}
  </motion.div>
)

// Slide up animation
export const SlideUp = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  distance = 20,
  ...props
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
  [key: string]: any
}) => (
  <motion.div
    initial={{ opacity: 0, y: distance }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: distance }}
    transition={{ duration, delay, ease: [0.33, 1, 0.68, 1] }}
    className={className}
    {...props}
  >
    {typeof children === "function" ? children() : children}
  </motion.div>
)

// Slide in from left animation
export const SlideInLeft = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  distance = 20,
  ...props
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
  [key: string]: any
}) => (
  <motion.div
    initial={{ opacity: 0, x: -distance }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -distance }}
    transition={{ duration, delay, ease: [0.33, 1, 0.68, 1] }}
    className={className}
    {...props}
  >
    {typeof children === "function" ? children() : children}
  </motion.div>
)

// Slide in from right animation
export const SlideInRight = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  distance = 20,
  ...props
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
  [key: string]: any
}) => (
  <motion.div
    initial={{ opacity: 0, x: distance }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: distance }}
    transition={{ duration, delay, ease: [0.33, 1, 0.68, 1] }}
    className={className}
    {...props}
  >
    {typeof children === "function" ? children() : children}
  </motion.div>
)

// Scale animation
export const ScaleIn = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  ...props
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  [key: string]: any
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration, delay, ease: [0.33, 1, 0.68, 1] }}
    className={className}
    {...props}
  >
    {typeof children === "function" ? children() : children}
  </motion.div>
)

// Bounce animation
export const BounceIn = ({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  [key: string]: any
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: [0.8, 1.05, 1] }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{
      duration,
      delay,
      times: [0, 0.6, 1],
      ease: [0.175, 0.885, 0.32, 1.275],
    }}
    className={className}
    {...props}
  >
    {typeof children === "function" ? children() : children}
  </motion.div>
)

// Staggered children animation
export const StaggerContainer = ({
  children,
  className,
  delay = 0,
  staggerDelay = 0.05,
  ...props
}: {
  children: ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
  [key: string]: any
}) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    }}
    className={className}
    {...props}
  >
    {typeof children === "function" ? children() : children}
  </motion.div>
)

// Child item for staggered animations
export const StaggerItem = ({
  children,
  className,
  direction = "up",
  ...props
}: {
  children: ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade"
  [key: string]: any
}) => {
  let variants = {}

  switch (direction) {
    case "up":
      variants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
      }
      break
    case "down":
      variants = {
        hidden: { opacity: 0, y: -10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
      }
      break
    case "left":
      variants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
      }
      break
    case "right":
      variants = {
        hidden: { opacity: 0, x: 10 },
        show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
      }
      break
    case "scale":
      variants = {
        hidden: { opacity: 0, scale: 0.97 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
      }
      break
    case "fade":
    default:
      variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
      }
  }

  return (
    <motion.div variants={variants} className={className} {...props}>
      {typeof children === "function" ? children() : children}
    </motion.div>
  )
}

// Page transition wrapper
export const PageTransition = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={cn("min-h-screen", className)}
    style={{ willChange: "opacity" }}
  >
    {typeof children === "function" ? children() : children}
  </motion.div>
)

// Hover animation wrapper
export const HoverCard = ({
  children,
  className,
  hoverEffect = "lift",
  ...props
}: {
  children: ReactNode
  className?: string
  hoverEffect?: "lift" | "scale" | "glow" | "none"
  [key: string]: any
}) => {
  let hoverClass = ""

  switch (hoverEffect) {
    case "lift":
      hoverClass = "transition-transform duration-300 hover:-translate-y-1"
      break
    case "scale":
      hoverClass = "transition-transform duration-300 hover:scale-105"
      break
    case "glow":
      hoverClass = "transition-all duration-300 hover:shadow-lg hover:shadow-primary-dark/25"
      break
    case "none":
    default:
      hoverClass = ""
  }

  return (
    <motion.div
      whileHover={{ scale: hoverEffect === "none" ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(hoverClass, className)}
      {...props}
    >
      {typeof children === "function" ? children() : children}
    </motion.div>
  )
}

// Animated background blob
export const AnimatedBlob = ({
  className,
  color = "primary",
  size = "md",
  ...props
}: {
  className?: string
  color?: "primary" | "secondary" | "accent"
  size?: "sm" | "md" | "lg"
  [key: string]: any
}) => {
  let sizeClass = ""
  let colorClass = ""

  switch (size) {
    case "sm":
      sizeClass = "w-32 h-32"
      break
    case "lg":
      sizeClass = "w-96 h-96"
      break
    case "md":
    default:
      sizeClass = "w-64 h-64"
  }

  switch (color) {
    case "secondary":
      colorClass = "bg-primary/30"
      break
    case "accent":
      colorClass = "bg-primary/30"
      break
    case "primary":
    default:
      colorClass = "bg-primary-dark/30"
  }

  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob",
        sizeClass,
        colorClass,
        className,
      )}
      {...props}
    />
  )
}

// Animated gradient background
export const AnimatedGradient = ({
  className,
  ...props
}: {
  className?: string
  [key: string]: any
}) => (
  <motion.div
    className={cn(
      "absolute inset-0 bg-gradient-to-r from-primary-dark/20 via-primary/20 to-primary/20 opacity-50",
      className,
    )}
    animate={{
      backgroundPosition: ["0% 0%", "100% 100%"],
    }}
    transition={{
      duration: 15,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: "linear",
    }}
    style={{
      backgroundSize: "400% 400%",
    }}
    {...props}
  />
)

// Animated counter
export const AnimatedCounter = ({
  value,
  className,
  ...props
}: {
  value: number
  className?: string
  [key: string]: any
}) => {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.floor(v))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: "easeOut",
    })
    return controls.stop
  }, [motionValue, value])

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v))
    return unsubscribe
  }, [rounded])

  return (
    <span className={className} {...props}>
      {display}
    </span>
  )
}

