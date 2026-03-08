"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface PulseCircleProps {
  delay?: number
  size?: number
  color?: string
  duration?: number
  className?: string
}

export function PulseCircle({
  delay = 0,
  size = 100,
  color = "#4988C4",
  duration = 4,
  className = "",
}: PulseCircleProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color, opacity: 0.2 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
          delay,
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color, opacity: 0.4 }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
          delay: delay + 0.2,
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: duration * 0.6,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
          delay: delay + 0.4,
        }}
      />
    </div>
  )
}

interface FloatingBadgeProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FloatingBadge({ children, delay = 0, className = "" }: FloatingBadgeProps) {
  return (
    <motion.div
      className={`inline-flex ${className}`}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

interface TypewriterTextProps {
  text: string
  delay?: number
  className?: string
  speed?: number
}

export function TypewriterText({ text, delay = 0, className = "", speed = 50 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")

  useEffect(() => {
    let currentIndex = 0
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.substring(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [text, delay, speed])

  return <div className={className}>{displayText}</div>
}

export function SuccessCheckmark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.2,
        }}
      >
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-600 dark:text-green-400"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      </motion.div>
    </div>
  )
}

export function ConfettiTrigger() {
  useEffect(() => {
    const loadConfetti = async () => {
      const confetti = (await import("canvas-confetti")).default
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0F2854", "#1C4D8D", "#4988C4", "#BDE8F5"],
      })
    }
    loadConfetti()
  }, [])

  return null
}
