"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AuthNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-xl rotate-12 shadow-md">
            <Sparkles className="h-4 w-4 text-[#5fa2db]" />
          </div>
          <h1 className="text-xl font-bold">EduGen</h1>
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative z-50">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium hover:text-[#5fa2db] transition-colors">
            Log In
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white hover:from-[#4a8bc7] hover:to-[#6aa7d9] shadow-sm">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-8 p-4"
            >
              <Link
                href="/login"
                className="text-xl font-medium hover:text-[#5fa2db] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Log In
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white hover:from-[#4a8bc7] hover:to-[#6aa7d9] shadow-md px-8"
                >
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
