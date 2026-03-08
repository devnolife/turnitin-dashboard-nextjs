"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  FileSpreadsheet,
  ArrowLeft,
  Share,
  Edit,
  Star,
  Printer,
  Trash2,
  Calendar,
  User,
  Download,
  Info,
  BookOpen,
  GraduationCap,
  BarChart4,
  CheckCircle2,
  FileText,
  ListChecks,
  Award,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { FloatingElements } from "@/components/floating-elements"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Sample RPS data for demonstration
const sampleRpsResults = [
  {
    id: "rps-001",
    title: "Algoritma dan Pemrograman",
    code: "IF2012",
    semester: 2,
    credits: 3,
    lastUpdated: "2023-11-15T10:30:00",
    createdAt: "2023-11-10T14:20:00",
    instructor: "Dr. Jane Doe",
    status: "published",
    favorite: true,
    department: "Computer Science",
    completionPercentage: 85,
    data: {
      generateRps: {
        matakuliah: {
          kode: "IF2012",
          nama: "Algoritma dan Pemrograman",
          rumpun_mk: "Pemrograman",
          sks: 3,
          semester: 2,
        },
        bahan_kajian: [
          "Materi kuliah yang diambil dari berbagai sumber online yang dapat diakses melalui internet, termasuk tutorial, video, dan jurnal akademik.",
          "Buku teks Algoritma dan Pemrograman edisi terbaru",
          "Jurnal ilmiah terkait algoritma dan struktur data",
          "Studi kasus dan contoh implementasi algoritma dalam kehidupan nyata",
        ],
        dosen_pengembang: {
          dosen_pengampuh: ["Dr. Jane Doe", "Prof. Robert Johnson", "Dr. Emily Chen"],
          koordinator_matakuliah: "Prof. John Smith",
          ketua_program_studi: "Prof. Sarah Williams",
        },
        deskripsi_matakuliah:
          "Mata kuliah Algoritma dan Pemrograman ini memperkenalkan konsep dasar dalam merancang algoritma yang efisien dan implementasinya dalam pemrograman komputer. Mahasiswa akan mempelajari berbagai teknik algoritma dan struktur data, serta mampu membuat program sederhana menggunakan bahasa pemrograman yang dipilih. Mata kuliah ini juga mencakup analisis kompleksitas algoritma, teknik pemecahan masalah, dan penerapan algoritma dalam berbagai bidang.",
        capaian_pembelajaran_lulusan: {
          kode: ["CPL1", "CPL2", "CPL3", "CPL4"],
          nama: [
            "Menunjukkan sikap profesional dan bertanggung jawab dalam bidang keilmuan.",
            "Mampu memahami dan mengaplikasikan prinsip atau konsep ilmu yang diajarkan.",
            "Mampu menyelesaikan masalah atau proyek secara kolaboratif dan mandiri.",
            "Mampu mengkomunikasikan hasil pemikiran dan analisis secara lisan dan tertulis.",
          ],
        },
        capaian_pembelajaran_matakuliah: {
          kode: ["CPMK1", "CPMK2", "CPMK3", "CPMK4"],
          nama: [
            "Memahami dasar teori dan konsep pemrograman.",
            "Mengaplikasikan konsep pemrograman dalam pembuatan program.",
            "Menyusun solusi atau produk berbasis algoritma.",
            "Menganalisis kompleksitas algoritma dan efisiensi program.",
          ],
        },
        sub_cpmk: {
          kode: ["Sub-CPMK1", "Sub-CPMK2", "Sub-CPMK3", "Sub-CPMK4", "Sub-CPMK5"],
          nama: [
            "Mampu menjelaskan konsep dasar algoritma.",
            "Mampu menggunakan struktur kontrol dalam pemrograman.",
            "Mampu mendemonstrasikan penggunaan fungsi dalam pemrograman.",
            "Mampu mengimplementasikan struktur data dasar.",
            "Mampu menganalisis kompleksitas waktu dan ruang algoritma.",
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
          {
            pekan: 4,
            sub_cpmk: ["Sub-CPMK4"],
            indikator: ["Mahasiswa dapat mengimplementasikan struktur data dasar."],
            bahan_kajian: ["Pengenalan struktur data", "Array dan linked list", "Stack dan queue"],
          },
          {
            pekan: 5,
            sub_cpmk: ["Sub-CPMK5"],
            indikator: ["Mahasiswa dapat menganalisis kompleksitas waktu dan ruang algoritma."],
            bahan_kajian: ["Notasi Big-O", "Analisis kompleksitas waktu", "Analisis kompleksitas ruang"],
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
    },
  },
  // Add more sample data as needed
]

// Custom components for the redesigned page
const SectionTitle = ({ icon, children, className = "" }) => (
  <h2 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${className}`}>
    {icon}
    {children}
  </h2>
)

const InfoCard = ({ icon, title, value, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-primary-lighter/30 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-medium mt-1">{value}</p>
      </div>
    </div>
  </div>
)

const ActionButton = ({ icon, children, variant = "outline", onClick = () => {}, className = "" }) => (
  <Button
    variant={variant}
    onClick={onClick}
    className={`rounded-full ${variant === "outline" ? "border-gray-200 hover:border-primary hover:bg-primary-lighter/10" : ""} ${className}`}
  >
    {icon}
    <span className="ml-2 hidden sm:inline">{children}</span>
  </Button>
)

const WeeklyTopicCard = ({ week, subCpmk, indicators, materials, isExpanded, onToggle }) => (
  <Card
    className={`mb-4 overflow-hidden transition-all duration-300 ${isExpanded ? "shadow-md border-primary" : "shadow-sm"}`}
  >
    <div className="p-4 cursor-pointer flex items-center justify-between" onClick={onToggle}>
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpanded ? "bg-primary text-white" : "bg-primary-lighter/30 text-primary"}`}
        >
          <span className="font-semibold">{week}</span>
        </div>
        <div>
          <h3 className="font-medium">Minggu {week}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {subCpmk.map((cpmk, i) => (
              <Badge key={i} variant="outline" className="bg-primary-lighter/20 text-primary-dark border-0">
                {cpmk}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <ChevronDown
        className={`h-5 w-5 text-primary transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
      />
    </div>

    {isExpanded && (
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Indikator
            </h4>
            <ul className="space-y-2">
              {indicators.map((indicator, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary-lighter/30 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-primary" />
              Bahan Kajian
            </h4>
            <ul className="space-y-2">
              {materials.map((material, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary-lighter/30 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span>{material}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )}
  </Card>
)

const AssessmentCard = ({ title, percentage }) => (
  <Card className="overflow-hidden">
    <div className="bg-primary-lighter/20 dark:bg-primary-dark/20 p-3 text-center">
      <h3 className="font-medium">{title}</h3>
    </div>
    <CardContent className="p-4 flex flex-col items-center">
      <div className="relative w-20 h-20 mb-3">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e6e6e6" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${percentage * 2.51} 251`}
            strokeDashoffset="0"
            className="text-primary"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{percentage}%</span>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Main component
export default function RpsResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [rpsData, setRpsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [favorite, setFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
  const [showFullMenu, setShowFullMenu] = useState(false)

  // Refs for scrolling
  const overviewRef = useRef(null)
  const weeklyRef = useRef(null)
  const assessmentRef = useRef(null)
  const instructorsRef = useRef(null)

  // Scroll animation
  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95])
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98])

  useEffect(() => {
    // Simulate API call to fetch RPS data
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch from an API
        const result = sampleRpsResults.find((item) => item.id === id)

        if (result) {
          setRpsData(result)
          setFavorite(result.favorite)
        } else {
          // Handle not found
          toast({
            title: "RPS not found",
            description: "The requested RPS document could not be found.",
            variant: "destructive",
          })
          router.push("/rps-results")
        }
      } catch (error) {
        console.error("Error fetching RPS data:", error)
        toast({
          title: "Error",
          description: "Failed to load RPS data. Please try again later.",
          variant: "destructive",
        })
        router.push("/rps-results")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  // Handle saving changes to RPS
  const handleSaveRps = (data: any) => {
    setRpsData({
      ...rpsData,
      data: data,
    })

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

  // Toggle favorite status
  const toggleFavorite = () => {
    setFavorite(!favorite)
    toast({
      title: favorite ? "Removed from favorites" : "Added to favorites",
      description: favorite
        ? "This RPS has been removed from your favorites."
        : "This RPS has been added to your favorites.",
      variant: "success",
    })
  }

  // Handle delete
  const handleDelete = () => {
    setShowDeleteDialog(false)
    toast({
      title: "RPS deleted",
      description: "The RPS document has been successfully deleted.",
      variant: "success",
    })
    router.push("/rps-results")
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Scroll to section
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary-lighter opacity-30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-medium mb-2">Loading RPS Data</h3>
          <p className="text-muted-foreground">Please wait while we fetch your document</p>
        </motion.div>
      </div>
    )
  }

  if (!rpsData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3">RPS Not Found</h3>
          <p className="text-muted-foreground mb-8">
            The requested RPS document could not be found or may have been deleted.
          </p>
          <Link href="/rps-results">
            <Button className="rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2 h-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to RPS Results
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // Animation variants
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FloatingElements />
      <TopNavigation />

      {/* Sticky header */}
      <motion.div
        className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700"
        style={{ opacity: headerOpacity, scale: headerScale }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/rps-results">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-xs">{rpsData.title}</h1>
                  <Badge
                    className={`${
                      rpsData.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                    }`}
                  >
                    {rpsData.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${favorite ? "text-yellow-500 hover:text-yellow-600" : ""}`}
                onClick={toggleFavorite}
              >
                <Star className={`h-5 w-5 ${favorite ? "fill-yellow-500" : ""}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>RPS Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/rps-results/${id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit RPS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportRps("pdf")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="h-4 w-4 mr-2" />
                    Print RPS
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share RPS
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete RPS
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                className="rounded-full bg-primary hover:bg-primary-dark text-white hidden sm:flex"
                onClick={() => router.push(`/rps-results/${id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit RPS
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24">
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">RPS Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="px-2 py-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-lg mb-1 font-medium"
                      onClick={() => scrollToSection(overviewRef)}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Overview
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-lg mb-1 font-medium"
                      onClick={() => scrollToSection(weeklyRef)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Weekly Topics
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-lg mb-1 font-medium"
                      onClick={() => scrollToSection(assessmentRef)}
                    >
                      <BarChart4 className="h-4 w-4 mr-2" />
                      Assessment
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-lg mb-1 font-medium"
                      onClick={() => scrollToSection(instructorsRef)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Instructors
                    </Button>
                  </div>
                </CardContent>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm font-medium">{rpsData.completionPercentage}%</span>
                  </div>
                  <Progress value={rpsData.completionPercentage} className="h-2" />
                </div>
              </Card>

              <Card className="mt-6 overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg"
                      onClick={() => handleExportRps("pdf")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg"
                      className="w-full justify-start rounded-lg"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print RPS
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-lg">
                      <Share className="h-4 w-4 mr-2" />
                      Share RPS
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete RPS
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Document Info</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">{formatDate(rpsData.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">{formatDate(rpsData.lastUpdated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code</span>
                      <span className="font-medium font-mono">{rpsData.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credits</span>
                      <span className="font-medium">{rpsData.credits} SKS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Semester</span>
                      <span className="font-medium">{rpsData.semester}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
              {/* Overview section */}
              <section ref={overviewRef} className="scroll-mt-24">
                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary-lighter/10 dark:bg-primary-dark/10 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-lighter/30 dark:bg-primary-dark/30 flex items-center justify-center">
                          <Info className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Overview</CardTitle>
                          <CardDescription>Course information and learning outcomes</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Course description */}
                        <div>
                          <SectionTitle icon={<FileText className="h-5 w-5 text-primary" />} className="text-lg">
                            Course Description
                          </SectionTitle>
                          <Card className="bg-primary-lighter/5 dark:bg-primary-dark/5 border-0 p-4 rounded-xl">
                            <p className="text-base leading-relaxed">{rpsData.data.generateRps.deskripsi_matakuliah}</p>
                          </Card>
                        </div>

                        {/* Learning outcomes */}
                        <div>
                          <SectionTitle icon={<GraduationCap className="h-5 w-5 text-primary" />} className="text-lg">
                            Learning Outcomes
                          </SectionTitle>

                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="cpl" className="border-b-0 mb-3">
                              <AccordionTrigger className="py-3 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex items-center gap-2 text-left">
                                  <Award className="h-4 w-4 text-primary" />
                                  <span className="font-medium">Graduate Learning Outcomes</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-4 px-4">
                                <ul className="space-y-3">
                                  {rpsData.data.generateRps.capaian_pembelajaran_lulusan.kode.map((kode, index) => (
                                    <li key={kode} className="flex items-start gap-3">
                                      <div className="bg-primary-lighter/20 dark:bg-primary-dark/20 text-primary p-1 rounded-lg min-w-[50px] h-7 flex items-center justify-center font-medium shrink-0">
                                        {kode}
                                      </div>
                                      <p className="text-sm pt-1">
                                        {rpsData.data.generateRps.capaian_pembelajaran_lulusan.nama[index]}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="cpmk" className="border-b-0 mb-3">
                              <AccordionTrigger className="py-3 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex items-center gap-2 text-left">
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                  <span className="font-medium">Course Learning Outcomes</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-4 px-4">
                                <ul className="space-y-3">
                                  {rpsData.data.generateRps.capaian_pembelajaran_matakuliah.kode.map((kode, index) => (
                                    <li key={kode} className="flex items-start gap-3">
                                      <div className="bg-primary-lighter/20 dark:bg-primary-dark/20 text-primary p-1 rounded-lg min-w-[50px] h-7 flex items-center justify-center font-medium shrink-0">
                                        {kode}
                                      </div>
                                      <p className="text-sm pt-1">
                                        {rpsData.data.generateRps.capaian_pembelajaran_matakuliah.nama[index]}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="subcpmk" className="border-b-0">
                              <AccordionTrigger className="py-3 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex items-center gap-2 text-left">
                                  <ListChecks className="h-4 w-4 text-primary" />
                                  <span className="font-medium">Sub-Course Learning Outcomes</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-4 px-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {rpsData.data.generateRps.sub_cpmk.kode.map((kode, index) => (
                                    <Card
                                      key={kode}
                                      className="bg-primary-lighter/5 dark:bg-primary-dark/5 border-0 p-3 rounded-xl"
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-primary text-white p-1 rounded-lg min-w-[80px] h-7 flex items-center justify-center font-medium">
                                          {kode}
                                        </div>
                                      </div>
                                      <p className="text-sm">{rpsData.data.generateRps.sub_cpmk.nama[index]}</p>
                                    </Card>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>

                        {/* Study materials */}
                        <div>
                          <SectionTitle icon={<BookOpen className="h-5 w-5 text-primary" />} className="text-lg">
                            Study Materials
                          </SectionTitle>
                          <Card className="bg-white dark:bg-gray-800 border p-4 rounded-xl">
                            <ul className="space-y-3">
                              {rpsData.data.generateRps.bahan_kajian.map((bahan, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="bg-primary-lighter/20 dark:bg-primary-dark/20 text-primary p-1 rounded-full min-w-[28px] h-7 flex items-center justify-center font-medium shrink-0">
                                    {index + 1}
                                  </div>
                                  <p className="text-sm pt-1">{bahan}</p>
                                </li>
                              ))}
                            </ul>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </section>

              {/* Weekly topics section */}
              <section ref={weeklyRef} className="scroll-mt-24">
                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary-lighter/10 dark:bg-primary-dark/10 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-lighter/30 dark:bg-primary-dark/30 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Weekly Topics</CardTitle>
                          <CardDescription>Weekly learning plan and materials</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {rpsData.data.generateRps.topik_perpekan_item.map((item) => (
                          <WeeklyTopicCard
                            key={item.pekan}
                            week={item.pekan}
                            subCpmk={item.sub_cpmk}
                            indicators={item.indikator}
                            materials={item.bahan_kajian}
                            isExpanded={expandedWeek === item.pekan}
                            onToggle={() => setExpandedWeek(expandedWeek === item.pekan ? null : item.pekan)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </section>

              {/* Assessment section */}
              <section ref={assessmentRef} className="scroll-mt-24">
                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary-lighter/10 dark:bg-primary-dark/10 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-lighter/30 dark:bg-primary-dark/30 flex items-center justify-center">
                          <BarChart4 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Assessment</CardTitle>
                          <CardDescription>Grading components and evaluation methods</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {Object.entries(rpsData.data.generateRps.komponen_penilaian).map(([key, value]) => (
                          <AssessmentCard key={key} title={key} percentage={value as number} />
                        ))}
                      </div>

                      <div className="mt-8">
                        <SectionTitle icon={<Award className="h-5 w-5 text-primary" />} className="text-lg">
                          Grading Scale
                        </SectionTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { grade: "A", range: "85-100", color: "#4ade80" },
                            { grade: "B", range: "70-84", color: "#60a5fa" },
                            { grade: "C", range: "55-69", color: "#facc15" },
                            { grade: "D", range: "40-54", color: "#f87171" },
                          ].map((item) => (
                            <Card key={item.grade} className="overflow-hidden">
                              <div className="p-4 flex justify-between items-center">
                                <span className="text-3xl font-bold" style={{ color: item.color }}>
                                  {item.grade}
                                </span>
                                <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                  {item.range}
                                </span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </section>

              {/* Instructors section */}
              <section ref={instructorsRef} className="scroll-mt-24">
                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary-lighter/10 dark:bg-primary-dark/10 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-lighter/30 dark:bg-primary-dark/30 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Instructors</CardTitle>
                          <CardDescription>Course instructors and coordinators</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Course Instructors</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="space-y-4">
                              {rpsData.data.generateRps.dosen_pengembang.dosen_pengampuh.map((dosen, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-primary-lighter/30 text-primary">
                                      {dosen
                                        .split(" ")
                                        .map((word) => word[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{dosen}</p>
                                    <p className="text-xs text-muted-foreground">Instructor</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Course Coordinator</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary-lighter/30 text-primary">
                                  {rpsData.data.generateRps.dosen_pengembang.koordinator_matakuliah
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {rpsData.data.generateRps.dosen_pengembang.koordinator_matakuliah}
                                </p>
                                <p className="text-xs text-muted-foreground">Course Coordinator</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Department Head</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary-lighter/30 text-primary">
                                  {rpsData.data.generateRps.dosen_pengembang.ketua_program_studi
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {rpsData.data.generateRps.dosen_pengembang.ketua_program_studi}
                                </p>
                                <p className="text-xs text-muted-foreground">Department Head</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </section>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete RPS Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this RPS document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
