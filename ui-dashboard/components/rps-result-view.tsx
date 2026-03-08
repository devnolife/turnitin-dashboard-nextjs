"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BookOpen,
  FileText,
  User,
  Calendar,
  Award,
  CheckCircle2,
  Download,
  Share,
  Printer,
  Edit,
  Clock,
  GraduationCap,
  BarChart4,
  ListChecks,
  Sparkles,
  Copy,
  ExternalLink,
  ChevronRight,
} from "lucide-react"

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

// Define the RPS data type based on the provided JSON
interface RpsData {
  matakuliah: {
    kode: string
    nama: string
    rumpun_mk: string
    sks: number
    semester: number
  }
  bahan_kajian: string[]
  dosen_pengembang: {
    dosen_pengampuh: string[]
    koordinator_matakuliah: string
    ketua_program_studi: string
  }
  deskripsi_matakuliah: string
  capaian_pembelajaran_lulusan: {
    kode: string[]
    nama: string[]
  }
  capaian_pembelajaran_matakuliah: {
    kode: string[]
    nama: string[]
  }
  sub_cpmk: {
    kode: string[]
    nama: string[]
  }
  topik_perpekan_item: {
    pekan: number
    sub_cpmk: string[]
    indikator: string[]
    bahan_kajian: string[]
  }[]
  komponen_penilaian: {
    kehadiran: number
    tugas: number
    praktikum: number
    UTS: number
    UAS: number
  }
}

// Skeleton loading component for RPS result
export function RpsResultSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
          <Skeleton className="h-4 w-40 rounded-lg bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-12 w-full rounded-full bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />

      {/* Content skeleton */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 rounded-2xl bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
          <Skeleton className="h-32 rounded-2xl bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
        </div>

        <Skeleton className="h-64 rounded-2xl bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-2xl bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
          <Skeleton className="h-24 rounded-2xl bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
          <Skeleton className="h-24 rounded-2xl bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-32 rounded-full bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
        <Skeleton className="h-10 w-32 rounded-full bg-[#e6f1fa] dark:bg-[#2c4c6b]/30" />
      </div>
    </div>
  )
}

// Update the RpsResultView component to include animations
export function RpsResultView({ data, isLoading }: { data?: { generateRps: RpsData }; isLoading: boolean }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  // Scroll animation
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 150)

      return () => clearInterval(interval)
    } else {
      setLoadingProgress(100)
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-0">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#5fa2db]" />
                Memuat RPS
              </h2>
              <div className="text-right">
                <p className="text-sm font-medium">Progres</p>
                <p className="text-2xl font-bold text-[#5fa2db]">{loadingProgress}%</p>
              </div>
            </div>
            <Progress
              value={loadingProgress}
              className="h-3 rounded-full"
              indicatorClassName="bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6]"
            />
          </div>

          <RpsResultSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const rps = data.generateRps

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const cardHoverVariants = {
    initial: { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ opacity }}>
      <Card className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-0">
        <CardContent className="p-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white p-4 rounded-2xl shadow-md"
              >
                <FileText className="h-8 w-8" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{rps.matakuliah.nama}</h1>
                  <Badge className="bg-[#e6f1fa] text-[#5fa2db] dark:bg-[#2c4c6b] dark:text-[#a8d1f0] border-0">
                    {rps.matakuliah.kode}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {rps.matakuliah.rumpun_mk}
                  </span>
                  <span className="text-[#5fa2db]">•</span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {rps.matakuliah.sks} SKS
                  </span>
                  <span className="text-[#5fa2db]">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Semester {rps.matakuliah.semester}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <Share className="h-5 w-5 text-[#5fa2db]" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <Printer className="h-5 w-5 text-[#5fa2db]" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <Download className="h-5 w-5 text-[#5fa2db]" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full mb-8 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full">
                <TabsTrigger
                  value="overview"
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5fa2db] data-[state=active]:to-[#7ab8e6] data-[state=active]:text-white"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Ringkasan</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5fa2db] data-[state=active]:to-[#7ab8e6] data-[state=active]:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Mingguan</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="assessment"
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5fa2db] data-[state=active]:to-[#7ab8e6] data-[state=active]:text-white"
                >
                  <div className="flex items-center gap-2">
                    <BarChart4 className="h-4 w-4" />
                    <span>Penilaian</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="instructors"
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5fa2db] data-[state=active]:to-[#7ab8e6] data-[state=active]:text-white"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Pengajar</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* Tab content with animations */}
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="overview" className="animate-in fade-in-50 duration-300 mt-0">
                      <div className="space-y-8">
                        {/* Description */}
                        <motion.div
                          initial="initial"
                          whileHover="hover"
                          variants={cardHoverVariants}
                          className="bg-gradient-to-br from-[#e6f1fa] to-[#f0f7ff] dark:from-[#2c4c6b]/20 dark:to-[#1e3a5a]/30 p-6 rounded-3xl border border-[#a8d1f0]/50 dark:border-[#3a5d7d]/50 relative overflow-hidden"
                        >
                          <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-[#5fa2db]/10 rounded-full blur-xl"></div>
                          <div className="absolute -left-16 -top-16 w-32 h-32 bg-[#7ab8e6]/10 rounded-full blur-xl"></div>

                          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                            <FileText className="h-5 w-5 text-[#5fa2db]" />
                            Deskripsi Mata Kuliah
                          </h2>
                          <p className="text-base leading-relaxed relative z-10">{rps.deskripsi_matakuliah}</p>

                          <motion.div
                            className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity"
                            whileHover={{ scale: 1.1 }}
                          >
                            <Button size="sm" variant="ghost" className="rounded-full">
                              <Copy className="h-4 w-4 mr-1" />
                              Salin
                            </Button>
                          </motion.div>
                        </motion.div>

                        {/* Learning Outcomes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div
                            initial="initial"
                            whileHover="hover"
                            variants={cardHoverVariants}
                            onHoverStart={() => setHoveredSection("cpl")}
                            onHoverEnd={() => setHoveredSection(null)}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-[#e6f1fa] dark:border-[#2c4c6b]/50 shadow-md relative overflow-hidden"
                          >
                            <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-[#5fa2db]/5 rounded-full blur-xl"></div>

                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-[#5fa2db]" />
                              Capaian Pembelajaran Lulusan
                            </h2>
                            <ul className="space-y-3">
                              {rps.capaian_pembelajaran_lulusan.kode.map((kode, index) => (
                                <motion.li
                                  key={kode}
                                  className="flex items-start gap-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ x: 5 }}
                                >
                                  <div className="bg-[#e6f1fa] dark:bg-[#2c4c6b]/50 text-[#5fa2db] p-1 rounded-lg min-w-[28px] h-7 flex items-center justify-center font-medium">
                                    {kode}
                                  </div>
                                  <p className="text-sm">{rps.capaian_pembelajaran_lulusan.nama[index]}</p>
                                </motion.li>
                              ))}
                            </ul>

                            {hoveredSection === "cpl" && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-4 right-4"
                              >
                                <Button size="sm" variant="ghost" className="rounded-full text-[#5fa2db]">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Detail
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>

                          <motion.div
                            initial="initial"
                            whileHover="hover"
                            variants={cardHoverVariants}
                            onHoverStart={() => setHoveredSection("cpmk")}
                            onHoverEnd={() => setHoveredSection(null)}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-[#e6f1fa] dark:border-[#2c4c6b]/50 shadow-md relative overflow-hidden"
                          >
                            <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-[#7ab8e6]/5 rounded-full blur-xl"></div>

                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-[#5fa2db]" />
                              Capaian Pembelajaran Mata Kuliah
                            </h2>
                            <ul className="space-y-3">
                              {rps.capaian_pembelajaran_matakuliah.kode.map((kode, index) => (
                                <motion.li
                                  key={kode}
                                  className="flex items-start gap-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ x: 5 }}
                                >
                                  <div className="bg-[#e6f1fa] dark:bg-[#2c4c6b]/50 text-[#5fa2db] p-1 rounded-lg min-w-[28px] h-7 flex items-center justify-center font-medium">
                                    {kode}
                                  </div>
                                  <p className="text-sm">{rps.capaian_pembelajaran_matakuliah.nama[index]}</p>
                                </motion.li>
                              ))}
                            </ul>

                            {hoveredSection === "cpmk" && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-4 right-4"
                              >
                                <Button size="sm" variant="ghost" className="rounded-full text-[#5fa2db]">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Detail
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>

                        {/* Sub CPMK */}
                        <motion.div
                          initial="initial"
                          whileHover="hover"
                          variants={cardHoverVariants}
                          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-[#e6f1fa] dark:border-[#2c4c6b]/50 shadow-md"
                        >
                          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-[#5fa2db]" />
                            Sub Capaian Pembelajaran Mata Kuliah
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {rps.sub_cpmk.kode.map((kode, index) => (
                              <motion.div
                                key={kode}
                                className="bg-gradient-to-br from-[#e6f1fa] to-[#f0f7ff] dark:from-[#2c4c6b]/20 dark:to-[#1e3a5a]/30 p-4 rounded-xl"
                                whileHover={{ scale: 1.03, backgroundColor: "#d0e4f5" }}
                                transition={{ type: "spring", stiffness: 400 }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="bg-[#5fa2db] text-white p-1 rounded-lg min-w-[28px] h-7 flex items-center justify-center font-medium">
                                    {kode}
                                  </div>
                                </div>
                                <p className="text-sm">{rps.sub_cpmk.nama[index]}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        {/* Bahan Kajian */}
                        <motion.div
                          initial="initial"
                          whileHover="hover"
                          variants={cardHoverVariants}
                          className="bg-gradient-to-br from-[#e6f1fa] to-[#f0f7ff] dark:from-[#2c4c6b]/20 dark:to-[#1e3a5a]/30 p-6 rounded-3xl border border-[#a8d1f0]/50 dark:border-[#3a5d7d]/50 relative overflow-hidden"
                        >
                          <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-[#5fa2db]/10 rounded-full blur-xl"></div>
                          <div className="absolute -left-16 -top-16 w-32 h-32 bg-[#7ab8e6]/10 rounded-full blur-xl"></div>

                          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                            <BookOpen className="h-5 w-5 text-[#5fa2db]" />
                            Bahan Kajian
                          </h2>
                          <ul className="space-y-2 relative z-10">
                            {rps.bahan_kajian.map((bahan, index) => (
                              <motion.li
                                key={index}
                                className="flex items-start gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ x: 5 }}
                              >
                                <div className="bg-[#5fa2db] text-white p-1 rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs mt-0.5">
                                  {index + 1}
                                </div>
                                <p className="text-base">{bahan}</p>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === "weekly" && (
                  <motion.div
                    key="weekly"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="weekly" className="animate-in fade-in-50 duration-300 mt-0">
                      <div className="space-y-6">
                        {rps.topik_perpekan_item.map((item, idx) => (
                          <motion.div
                            key={item.pekan}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 ${
                              expandedWeek === item.pekan
                                ? "border-[#5fa2db] shadow-lg"
                                : "border-[#e6f1fa] dark:border-[#2c4c6b]/50 shadow-md"
                            } transition-all duration-300`}
                          >
                            <div
                              className="flex items-center gap-3 mb-4 cursor-pointer"
                              onClick={() => setExpandedWeek(expandedWeek === item.pekan ? null : item.pekan)}
                            >
                              <motion.div
                                whileHover={{ rotate: 10 }}
                                className={`${
                                  expandedWeek === item.pekan
                                    ? "bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6]"
                                    : "bg-[#e6f1fa] dark:bg-[#2c4c6b]/30"
                                } text-white p-3 rounded-xl shadow-md transition-colors duration-300`}
                              >
                                <Clock
                                  className={`h-6 w-6 ${expandedWeek === item.pekan ? "text-white" : "text-[#5fa2db]"}`}
                                />
                              </motion.div>
                              <div>
                                <h2 className="text-xl font-bold">Minggu {item.pekan}</h2>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {item.sub_cpmk.map((subcpmk) => (
                                    <Badge
                                      key={subcpmk}
                                      className={`${
                                        expandedWeek === item.pekan
                                          ? "bg-[#5fa2db]/20 text-[#5fa2db] dark:bg-[#5fa2db]/30 dark:text-[#a8d1f0]"
                                          : "bg-[#e6f1fa] text-[#5fa2db] dark:bg-[#2c4c6b] dark:text-[#a8d1f0]"
                                      } border-0`}
                                    >
                                      {subcpmk}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedWeek === item.pekan ? 90 : 0 }}
                                className="ml-auto"
                              >
                                <ChevronRight className="h-5 w-5 text-[#5fa2db]" />
                              </motion.div>
                            </div>

                            <AnimatePresence>
                              {expandedWeek === item.pekan && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-[#5fa2db]" />
                                        Indikator
                                      </h3>
                                      <ul className="space-y-2">
                                        {item.indikator.map((indikator, idx) => (
                                          <motion.li
                                            key={idx}
                                            className="flex items-start gap-2"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                          >
                                            <div className="bg-[#e6f1fa] dark:bg-[#2c4c6b]/50 text-[#5fa2db] p-1 rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs mt-0.5">
                                              {idx + 1}
                                            </div>
                                            <p className="text-sm">{indikator}</p>
                                          </motion.li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-[#5fa2db]" />
                                        Bahan Kajian
                                      </h3>
                                      <ul className="space-y-2">
                                        {item.bahan_kajian.map((bahan, idx) => (
                                          <motion.li
                                            key={idx}
                                            className="flex items-start gap-2"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 + 0.2 }}
                                          >
                                            <div className="bg-[#e6f1fa] dark:bg-[#2c4c6b]/50 text-[#5fa2db] p-1 rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs mt-0.5">
                                              {idx + 1}
                                            </div>
                                            <p className="text-sm">{bahan}</p>
                                          </motion.li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === "assessment" && (
                  <motion.div
                    key="assessment"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="assessment" className="animate-in fade-in-50 duration-300 mt-0">
                      <div className="space-y-6">
                        <motion.div
                          initial="initial"
                          whileHover="hover"
                          variants={cardHoverVariants}
                          className="bg-gradient-to-br from-[#e6f1fa] to-[#f0f7ff] dark:from-[#2c4c6b]/20 dark:to-[#1e3a5a]/30 p-6 rounded-3xl border border-[#a8d1f0]/50 dark:border-[#3a5d7d]/50 relative overflow-hidden"
                        >
                          <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-[#5fa2db]/10 rounded-full blur-xl"></div>
                          <div className="absolute -left-16 -top-16 w-32 h-32 bg-[#7ab8e6]/10 rounded-full blur-xl"></div>

                          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                            <BarChart4 className="h-5 w-5 text-[#5fa2db]" />
                            Komponen Penilaian
                          </h2>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                            {Object.entries(rps.komponen_penilaian).map(([key, value], idx) => (
                              <motion.div
                                key={key}
                                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                              >
                                <div className="flex flex-col items-center">
                                  <div className="w-16 h-16 rounded-full bg-[#e6f1fa] dark:bg-[#2c4c6b]/50 flex items-center justify-center mb-2 relative">
                                    <motion.div
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: value / 100 }}
                                      transition={{ duration: 1, delay: 0.5 }}
                                      className="w-16 h-16 rounded-full border-4 border-[#5fa2db] absolute"
                                      style={{
                                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - value}%)`,
                                      }}
                                    ></motion.div>
                                    <span className="text-lg font-bold text-[#5fa2db]">{value}%</span>
                                  </div>
                                  <h3 className="font-medium text-center">{key}</h3>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <div className="mt-8 relative z-10">
                            <h3 className="text-base font-semibold mb-3">Skala Penilaian</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {[
                                { grade: "A", range: "85-100", color: "#4ade80" },
                                { grade: "B", range: "70-84", color: "#60a5fa" },
                                { grade: "C", range: "55-69", color: "#facc15" },
                                { grade: "D", range: "40-54", color: "#f87171" },
                              ].map((item, idx) => (
                                <motion.div
                                  key={item.grade}
                                  className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 + idx * 0.1 }}
                                  whileHover={{ scale: 1.05, backgroundColor: "#e6f1fa" }}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold" style={{ color: item.color }}>
                                      {item.grade}
                                    </span>
                                    <span className="text-sm">{item.range}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === "instructors" && (
                  <motion.div
                    key="instructors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="instructors" className="animate-in fade-in-50 duration-300 mt-0">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <motion.div
                            initial="initial"
                            whileHover="hover"
                            variants={cardHoverVariants}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-[#e6f1fa] dark:border-[#2c4c6b]/50 shadow-md"
                          >
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                              <User className="h-5 w-5 text-[#5fa2db]" />
                              Dosen Pengampu
                            </h2>
                            <ul className="space-y-3">
                              {rps.dosen_pengembang.dosen_pengampuh.map((dosen, index) => (
                                <motion.li
                                  key={index}
                                  className="flex items-center gap-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.2 }}
                                  whileHover={{ x: 5 }}
                                >
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e6f1fa] to-[#d0e4f5] dark:from-[#2c4c6b]/50 dark:to-[#3a5d7d]/30 flex items-center justify-center">
                                    <User className="h-5 w-5 text-[#5fa2db]" />
                                  </div>
                                  <p className="font-medium">{dosen}</p>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>

                          <motion.div
                            initial="initial"
                            whileHover="hover"
                            variants={cardHoverVariants}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-[#e6f1fa] dark:border-[#2c4c6b]/50 shadow-md"
                          >
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                              <User className="h-5 w-5 text-[#5fa2db]" />
                              Koordinator Mata Kuliah
                            </h2>
                            <motion.div
                              className="flex items-center gap-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              whileHover={{ x: 5 }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e6f1fa] to-[#d0e4f5] dark:from-[#2c4c6b]/50 dark:to-[#3a5d7d]/30 flex items-center justify-center">
                                <User className="h-5 w-5 text-[#5fa2db]" />
                              </div>
                              <p className="font-medium">{rps.dosen_pengembang.koordinator_matakuliah}</p>
                            </motion.div>
                          </motion.div>

                          <motion.div
                            initial="initial"
                            whileHover="hover"
                            variants={cardHoverVariants}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-[#e6f1fa] dark:border-[#2c4c6b]/50 shadow-md"
                          >
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-[#5fa2db]" />
                              Ketua Program Studi
                            </h2>
                            <motion.div
                              className="flex items-center gap-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              whileHover={{ x: 5 }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e6f1fa] to-[#d0e4f5] dark:from-[#2c4c6b]/50 dark:to-[#3a5d7d]/30 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-[#5fa2db]" />
                              </div>
                              <p className="font-medium">{rps.dosen_pengembang.ketua_program_studi}</p>
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={itemVariants} className="flex justify-end gap-3 mt-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="rounded-full px-6 border-[#a8d1f0] text-[#5fa2db] hover:bg-[#e6f1fa]"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit RPS
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="rounded-full bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white border-0">
                <Download className="mr-2 h-4 w-4" />
                Unduh RPS
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
