"use client"

import { useState } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { RpsGeneratorForm } from "@/components/rps-generator-form"
import { RpsResultsMenu } from "@/components/rps-results-menu"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FloatingElements } from "@/components/floating-elements"
import { AnimatedGradientText } from "@/components/animated-gradient-border"
import { toast } from "@/components/ui/use-toast"
import confetti from "canvas-confetti"

export default function RpsGeneratorPage() {
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRpsData, setGeneratedRpsData] = useState<any>(null)

  // This function would be called from the RpsGeneratorForm component
  const handleGenerationComplete = (data: any) => {
    setGeneratedRpsData(data)
    setShowResults(true)
    setIsGenerating(false)

    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    toast({
      title: "RPS berhasil dibuat! 🎉",
      description: `RPS untuk mata kuliah ${data.generateRps.matakuliah.nama} telah berhasil dibuat.`,
      variant: "success",
    })
  }

  // This function would be called when the user wants to go back to the form
  const handleBackToForm = () => {
    setShowResults(false)
  }

  // Handle saving changes to RPS
  const handleSaveRps = (data: any) => {
    setGeneratedRpsData(data)

    toast({
      title: "Perubahan disimpan",
      description: "Perubahan pada RPS telah berhasil disimpan.",
      variant: "success",
    })
  }

  // Handle exporting RPS
  const handleExportRps = (format: string) => {
    toast({
      title: `Mengekspor RPS sebagai ${format.toUpperCase()}`,
      description: "Dokumen RPS sedang diunduh...",
    })

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Ekspor berhasil",
        description: `RPS telah berhasil diekspor sebagai ${format.toUpperCase()}.`,
        variant: "success",
      })
    }, 1500)
  }

  return (
    <div className="p-6 relative">
      <FloatingElements />
      <TopNavigation />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 mr-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white p-2 rounded-2xl"
            >
              <FileSpreadsheet className="h-6 w-6" />
            </motion.div>
            <h1 className="text-3xl font-bold">Generator RPS</h1>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              className="px-3 py-1 bg-[#e6f1fa] dark:bg-[#2c4c6b] rounded-full text-[#5fa2db] dark:text-[#a8d1f0] text-xs font-medium flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </motion.div>
          </div>
          <p className="text-muted-foreground ml-14">
            {showResults
              ? "Hasil Rencana Pembelajaran Semester (RPS) yang dibuat dengan bantuan AI"
              : "Buat Rencana Pembelajaran Semester (RPS) dengan bantuan AI"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!showResults && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="rounded-full border-dashed border-2">
                  Lihat Template
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-full bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white border-0">
                  <AnimatedGradientText className="font-medium">Tutorial</AnimatedGradientText>
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      <div className="relative">
        <motion.div
          className="absolute -z-10 top-20 right-20 w-72 h-72 bg-[#d0e4f5] dark:bg-[#2c4c6b]/20 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute -z-10 bottom-20 left-20 w-80 h-80 bg-[#e6f1fa] dark:bg-[#3a5d7d]/20 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <RpsGeneratorForm onGenerationComplete={handleGenerationComplete} setIsGenerating={setIsGenerating} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <RpsResultsMenu
                data={generatedRpsData}
                onBack={handleBackToForm}
                onSave={handleSaveRps}
                onExport={handleExportRps}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toaster />
    </div>
  )
}

// Sample RPS data for demonstration
const sampleRpsData = {
  generateRps: {
    matakuliah: {
      kode: "IF2012",
      nama: "Algoritma dan Pemograman",
      rumpun_mk: "Pemograman",
      sks: 2,
      semester: 2,
    },
    bahan_kajian: [
      "Materi kuliah yang diambil dari berbagai sumber online yang dapat diakses melalui internet, termasuk tutorial, video, dan jurnal akademik.",
    ],
    dosen_pengembang: {
      dosen_pengampuh: ["Pak Akbar"],
      koordinator_matakuliah: "Pak Dhia",
      ketua_program_studi: "Pak Iqram",
    },
    deskripsi_matakuliah:
      "Mata kuliah Algoritma dan Pemograman ini memperkenalkan konsep dasar dalam merancang algoritma yang efisien dan implementasinya dalam pemrograman komputer. Mahasiswa akan mempelajari berbagai teknik algoritma dan struktur data, serta mampu membuat program sederhana menggunakan bahasa pemrograman yang dipilih.",
    capaian_pembelajaran_lulusan: {
      kode: ["CPL1", "CPL2", "CPL3"],
      nama: [
        "Menunjukkan sikap profesional dan bertanggung jawab dalam bidang keilmuan.",
        "Mampu memahami dan mengaplikasikan prinsip atau konsep ilmu yang diajarkan.",
        "Mampu menyelesaikan masalah atau proyek secara kolaboratif dan mandiri.",
      ],
    },
    capaian_pembelajaran_matakuliah: {
      kode: ["CPMK1", "CPMK2", "CPMK3"],
      nama: [
        "Memahami dasar teori dan konsep pemrograman.",
        "Mengaplikasikan konsep pemrograman dalam pembuatan program.",
        "Menyusun solusi atau produk berbasis algoritma.",
      ],
    },
    sub_cpmk: {
      kode: ["Sub-CPMK1", "Sub-CPMK2", "Sub-CPMK3"],
      nama: [
        "Mampu menjelaskan konsep dasar algoritma.",
        "Mampu menggunakan struktur kontrol dalam pemrograman.",
        "Mampu mendemonstrasikan penggunaan fungsi dalam pemrograman.",
      ],
    },
    topik_perpekan_item: [
      {
        pekan: 1,
        sub_cpmk: ["Sub-CPMK1"],
        indikator: ["Mahasiswa dapat menjelaskan pengertian algoritma dan pemrograman."],
        bahan_kajian: ["Pengertian algoritma", "Sejarah pemrograman", "Bahasa pemrograman umum"],
      },
      {
        pekan: 2,
        sub_cpmk: ["Sub-CPMK2"],
        indikator: ["Mahasiswa dapat menggunakan struktur kontrol dalam pemrograman."],
        bahan_kajian: [
          "Struktur kontrol: if, switch",
          "Struktur perulangan: for, while",
          "Contoh aplikasi struktur kontrol",
        ],
      },
      {
        pekan: 3,
        sub_cpmk: ["Sub-CPMK3"],
        indikator: ["Mahasiswa dapat mendemonstrasikan penggunaan fungsi dalam pemrograman."],
        bahan_kajian: [
          "Pengantar fungsi dalam pemrograman",
          "Pembagian program menjadi fungsi",
          "Contoh penggunaan fungsi",
        ],
      },
    ],
    komponen_penilaian: {
      kehadiran: 10,
      tugas: 30,
      praktikum: 30,
      UTS: 15,
      UAS: 15,
    },
  },
}
