"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { GraduationCap, Sparkles, ShieldCheck, BookOpen } from "lucide-react"

import { RoleSelectionForm } from "@/components/auth/role-selection-form"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-border"
import { FloatingElements } from "@/components/ui/floating-elements"

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

export default function LoginPageClient() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-primary-lighter/20 dark:bg-gray-900 transition-colors duration-300">
      <FloatingElements />

      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10"
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-2xl rotate-12 shadow-md">
              <ShieldCheck className="h-6 w-6 text-primary-dark" />
            </div>
            <h1 className="text-2xl font-bold text-primary-dark dark:text-white">Turnitin Campus</h1>
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
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary-dark/20 to-primary/20 rounded-full blur-3xl transform scale-150" />
            <div className="w-48 h-48 md:w-64 md:h-64 gen-z-gradient rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden">
              <div className="absolute w-full h-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="h-24 w-24 text-white" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/30 rounded-full" />
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary-dark/30 rounded-full" />
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 text-primary-dark dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Selamat Datang di{" "}
            <AnimatedGradientText className="text-3xl md:text-4xl font-bold">
              Turnitin Campus
            </AnimatedGradientText>
          </motion.h2>

          <motion.p
            className="text-muted-foreground max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Platform manajemen integritas akademik untuk memastikan keaslian karya ilmiah mahasiswa.
          </motion.p>
        </motion.div>

        <motion.div
          className="z-10 text-sm text-muted-foreground text-center md:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <blockquote className="space-y-2">
            <p className="text-sm italic text-primary-dark/80 dark:text-primary-lighter/80">
              &ldquo;Turnitin telah mengubah cara kami memastikan integritas akademik dan memberikan umpan balik berharga kepada mahasiswa.&rdquo;
            </p>
            <footer className="text-xs text-muted-foreground">— Dr. Sarah Johnson, Universitas Pendidikan</footer>
          </blockquote>
        </motion.div>

        {/* Background gradient blobs */}
        <div className="absolute -z-0 top-0 right-0 w-full h-full overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-72 h-72 bg-primary-dark/20 rounded-full blur-3xl"
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
            className="absolute bottom-20 left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
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

      {/* Right side - Role selection form */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-2xl p-6 md:p-12 flex items-center justify-center relative z-10">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-2 text-primary-dark dark:text-white">Pilih Peran Anda</h2>
            <p className="text-muted-foreground mb-8">
              Silakan pilih peran untuk masuk ke dashboard Turnitin Campus.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <RoleSelectionForm />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <p className="text-center text-sm text-muted-foreground">
              Dengan masuk, Anda menyetujui{" "}
              <Link
                href="/terms"
                className="text-primary hover:text-primary-dark hover:underline font-medium"
              >
                Ketentuan Layanan
              </Link>{" "}
              dan{" "}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary-dark hover:underline font-medium"
              >
                Kebijakan Privasi
              </Link>
              .
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Turnitin Campus. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
