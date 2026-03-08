"use client"

import { Calendar } from "@/components/ui/calendar"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileSpreadsheet,
  Download,
  Share,
  Edit,
  Copy,
  Printer,
  ArrowLeft,
  X,
  ChevronRight,
  Settings,
  Palette,
  Type,
  Layout,
  Save,
  Eye,
  Sparkles,
  Undo,
  Redo,
  MoreHorizontal,
  ExternalLink,
  User,
  GraduationCap,
  BarChart4,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RpsResultView } from "@/components/rps-result-view"
import { cn } from "@/lib/utils"

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

interface RpsResultsMenuProps {
  data: { generateRps: RpsData }
  onBack: () => void
  onSave: (data: { generateRps: RpsData }) => void
  onExport: (format: string) => void
}

// Theme options for customization
const themeOptions = {
  colors: [
    { name: "Blue", primary: "#5fa2db", secondary: "#7ab8e6", bg: "#e6f1fa", accent: "#a8d1f0" },
    { name: "Purple", primary: "#8b5cf6", secondary: "#a78bfa", bg: "#ede9fe", accent: "#c4b5fd" },
    { name: "Green", primary: "#10b981", secondary: "#34d399", bg: "#d1fae5", accent: "#6ee7b7" },
    { name: "Orange", primary: "#f97316", secondary: "#fb923c", bg: "#ffedd5", accent: "#fdba74" },
    { name: "Pink", primary: "#ec4899", secondary: "#f472b6", bg: "#fce7f3", accent: "#f9a8d4" },
  ],
  fonts: [
    { name: "Default", value: "Inter, system-ui, sans-serif" },
    { name: "Poppins", value: "Poppins, sans-serif" },
    { name: "Montserrat", value: "Montserrat, sans-serif" },
    { name: "Roboto", value: "Roboto, sans-serif" },
    { name: "Open Sans", value: "Open Sans, sans-serif" },
  ],
  layouts: [
    { name: "Standard", value: "standard" },
    { name: "Compact", value: "compact" },
    { name: "Expanded", value: "expanded" },
  ],
}

export function RpsResultsMenu({ data, onBack, onSave, onExport }: RpsResultsMenuProps) {
  const [rpsData, setRpsData] = useState<{ generateRps: RpsData }>(data)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [history, setHistory] = useState<{ generateRps: RpsData }[]>([data])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [customTheme, setCustomTheme] = useState({
    colorScheme: themeOptions.colors[0],
    font: themeOptions.fonts[0],
    layout: themeOptions.layouts[0],
    borderRadius: 16,
    animationSpeed: 0.5,
    showAnimations: true,
  })

  // Refs for scrolling
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Add to history when making changes
  const addToHistory = (newData: { generateRps: RpsData }) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newData)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Handle undo/redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setRpsData(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setRpsData(history[historyIndex + 1])
    }
  }

  // Handle editing fields
  const handleEdit = (path: string[], value: any) => {
    const newData = JSON.parse(JSON.stringify(rpsData))
    let current = newData.generateRps

    // Navigate to the parent object
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]]
    }

    // Update the value
    current[path[path.length - 1]] = value

    setRpsData(newData)
    addToHistory(newData)
  }

  // Handle saving changes
  const handleSave = () => {
    onSave(rpsData)
    setEditMode(false)
  }

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--primary", customTheme.colorScheme.primary)
    root.style.setProperty("--secondary", customTheme.colorScheme.secondary)
    root.style.setProperty("--bg-light", customTheme.colorScheme.bg)
    root.style.setProperty("--accent", customTheme.colorScheme.accent)
    root.style.setProperty("--border-radius", `${customTheme.borderRadius}px`)
    root.style.setProperty("--font-family", customTheme.font.value)
    root.style.setProperty("--animation-speed", `${customTheme.animationSpeed}s`)

    // Add custom font if needed
    if (customTheme.font.name !== "Default") {
      const fontLink = document.createElement("link")
      fontLink.href = `https://fonts.googleapis.com/css2?family=${customTheme.font.name.replace(" ", "+")}&display=swap`
      fontLink.rel = "stylesheet"
      document.head.appendChild(fontLink)

      return () => {
        document.head.removeChild(fontLink)
      }
    }
  }, [customTheme])

  // Scroll to section when expanded
  useEffect(() => {
    if (expandedSection && sectionsRef.current[expandedSection]) {
      sectionsRef.current[expandedSection]?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [expandedSection])

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

  const cardHoverVariants = {
    initial: { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  }

  // Editable text component
  const EditableText = ({
    value,
    onChange,
    multiline = false,
    placeholder = "Edit text...",
    className = "",
  }: {
    value: string
    onChange: (value: string) => void
    multiline?: boolean
    placeholder?: string
    className?: string
  }) => {
    if (!editMode) return <span className={className}>{value}</span>

    return multiline ? (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("min-h-[100px] border-dashed border-2 focus:border-solid", className)}
      />
    ) : (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("border-dashed border-2 focus:border-solid", className)}
      />
    )
  }

  // Editable list component
  const EditableList = ({
    items,
    onChange,
    renderItem,
    addButtonText = "Add Item",
  }: {
    items: string[]
    onChange: (items: string[]) => void
    renderItem: (item: string, index: number) => React.ReactNode
    addButtonText?: string
  }) => {
    const handleAdd = () => {
      onChange([...items, ""])
    }

    const handleRemove = (index: number) => {
      const newItems = [...items]
      newItems.splice(index, 1)
      onChange(newItems)
    }

    const handleChange = (index: number, value: string) => {
      const newItems = [...items]
      newItems[index] = value
      onChange(newItems)
    }

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {editMode ? (
              <>
                {renderItem(item, index)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              renderItem(item, index)
            )}
          </div>
        ))}

        {editMode && (
          <Button variant="outline" size="sm" className="mt-2" onClick={handleAdd}>
            {addButtonText}
          </Button>
        )}
      </div>
    )
  }

  // Section component with expand/collapse
  const Section = ({
    title,
    icon,
    children,
    id,
    className = "",
  }: {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    id: string
    className?: string
  }) => {
    const isExpanded = expandedSection === id

    return (
      <div className={cn("mb-6", className)} ref={(el) => (sectionsRef.current[id] = el)}>
        <motion.div
          className={cn(
            "bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 transition-all duration-300",
            isExpanded ? "border-[var(--primary)] shadow-lg" : "border-[#e6f1fa] dark:border-[#2c4c6b]/50 shadow-md",
          )}
          initial="initial"
          whileHover="hover"
          variants={cardHoverVariants}
        >
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setExpandedSection(isExpanded ? null : id)}
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              className={cn(
                "p-3 rounded-xl shadow-md transition-colors duration-300",
                isExpanded
                  ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white"
                  : "bg-[var(--bg-light)] dark:bg-[#2c4c6b]/30",
              )}
            >
              {icon}
            </motion.div>

            <div className="flex-1">
              <h2 className="text-xl font-bold">{title}</h2>
            </div>

            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} className="ml-auto">
              <ChevronRight className="h-5 w-5 text-[var(--primary)]" />
            </motion.div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full border-[var(--accent)] text-[var(--primary)] hover:bg-[var(--bg-light)]"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white p-2 rounded-2xl"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold">{rpsData.generateRps.matakuliah.nama}</h1>
            <Badge className="bg-[var(--bg-light)] text-[var(--primary)] dark:bg-[#2c4c6b] dark:text-[var(--accent)] border-0">
              {rpsData.generateRps.matakuliah.kode}
            </Badge>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
          {/* Edit mode toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editMode ? "default" : "outline"}
                  className={cn(
                    "rounded-full",
                    editMode && "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white",
                  )}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Preview Mode</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Edit Mode</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{editMode ? "Switch to preview mode" : "Switch to edit mode"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Undo/Redo */}
          {editMode && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {/* Save button */}
          {editMode && (
            <Button
              className="rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Save Changes</span>
            </Button>
          )}

          {/* Theme customization */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Palette className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Customize Appearance</SheetTitle>
                <SheetDescription>Adjust the visual style of your RPS display</SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Color scheme */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color Scheme
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {themeOptions.colors.map((color) => (
                      <button
                        key={color.name}
                        className={cn(
                          "w-full aspect-square rounded-full border-2 transition-all",
                          customTheme.colorScheme.name === color.name
                            ? "border-black dark:border-white scale-110"
                            : "border-transparent hover:scale-105",
                        )}
                        style={{ background: `linear-gradient(to right, ${color.primary}, ${color.secondary})` }}
                        onClick={() => setCustomTheme({ ...customTheme, colorScheme: color })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Font Family
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {themeOptions.fonts.map((font) => (
                      <button
                        key={font.name}
                        className={cn(
                          "text-left px-3 py-2 rounded-lg transition-all",
                          customTheme.font.name === font.name
                            ? "bg-[var(--bg-light)] text-[var(--primary)] font-medium"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800",
                        )}
                        style={{ fontFamily: font.value }}
                        onClick={() => setCustomTheme({ ...customTheme, font })}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border radius */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Layout className="h-4 w-4" />
                      Border Radius
                    </h3>
                    <span className="text-sm text-muted-foreground">{customTheme.borderRadius}px</span>
                  </div>
                  <Slider
                    value={[customTheme.borderRadius]}
                    min={0}
                    max={32}
                    step={1}
                    onValueChange={(value) => setCustomTheme({ ...customTheme, borderRadius: value[0] })}
                  />
                </div>

                {/* Animation speed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Animation Speed
                    </h3>
                    <span className="text-sm text-muted-foreground">{customTheme.animationSpeed}s</span>
                  </div>
                  <Slider
                    value={[customTheme.animationSpeed * 10]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setCustomTheme({ ...customTheme, animationSpeed: value[0] / 10 })}
                  />
                </div>

                {/* Show animations */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Show Animations</h3>
                    <p className="text-xs text-muted-foreground">Enable or disable motion animations</p>
                  </div>
                  <Switch
                    checked={customTheme.showAnimations}
                    onCheckedChange={(checked) => setCustomTheme({ ...customTheme, showAnimations: checked })}
                  />
                </div>

                {/* Layout */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Layout Style
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {themeOptions.layouts.map((layout) => (
                      <button
                        key={layout.name}
                        className={cn(
                          "text-left px-3 py-2 rounded-lg transition-all",
                          customTheme.layout.name === layout.name
                            ? "bg-[var(--bg-light)] text-[var(--primary)] font-medium"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800",
                        )}
                        onClick={() => setCustomTheme({ ...customTheme, layout })}
                      >
                        {layout.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Export options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport("pdf")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                PDF Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("docx")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Word Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("xlsx")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel Spreadsheet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("json")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                JSON Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share RPS</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Print button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print RPS</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(rpsData))}>
                <Copy className="h-4 w-4 mr-2" />
                Copy as JSON
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </motion.div>

      {/* Main content */}
      <div className="space-y-6">
        {/* Course information section */}
        <Section
          title="Informasi Mata Kuliah"
          icon={<FileSpreadsheet className="h-6 w-6 text-white" />}
          id="course-info"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Nama Mata Kuliah</h3>
                <EditableText
                  value={rpsData.generateRps.matakuliah.nama}
                  onChange={(value) => handleEdit(["matakuliah", "nama"], value)}
                  className="text-lg font-medium"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Kode Mata Kuliah</h3>
                <EditableText
                  value={rpsData.generateRps.matakuliah.kode}
                  onChange={(value) => handleEdit(["matakuliah", "kode"], value)}
                  className="text-base"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Rumpun Mata Kuliah</h3>
                <EditableText
                  value={rpsData.generateRps.matakuliah.rumpun_mk}
                  onChange={(value) => handleEdit(["matakuliah", "rumpun_mk"], value)}
                  className="text-base"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">SKS</h3>
                <EditableText
                  value={rpsData.generateRps.matakuliah.sks.toString()}
                  onChange={(value) => handleEdit(["matakuliah", "sks"], Number.parseInt(value) || 0)}
                  className="text-base"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Semester</h3>
                <EditableText
                  value={rpsData.generateRps.matakuliah.semester.toString()}
                  onChange={(value) => handleEdit(["matakuliah", "semester"], Number.parseInt(value) || 0)}
                  className="text-base"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Deskripsi Mata Kuliah</h3>
                <EditableText
                  value={rpsData.generateRps.deskripsi_matakuliah}
                  onChange={(value) => handleEdit(["deskripsi_matakuliah"], value)}
                  multiline
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Instructors section */}
        <Section title="Informasi Pengajar" icon={<User className="h-6 w-6 text-white" />} id="instructors">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Dosen Pengampu</h3>
              <EditableList
                items={rpsData.generateRps.dosen_pengembang.dosen_pengampuh}
                onChange={(items) => handleEdit(["dosen_pengembang", "dosen_pengampuh"], items)}
                renderItem={(item, index) => (
                  <EditableText
                    value={item}
                    onChange={(value) => {
                      const newItems = [...rpsData.generateRps.dosen_pengembang.dosen_pengampuh]
                      newItems[index] = value
                      handleEdit(["dosen_pengembang", "dosen_pengampuh"], newItems)
                    }}
                    className="flex-1"
                  />
                )}
                addButtonText="Tambah Dosen Pengampu"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Koordinator Mata Kuliah</h3>
              <EditableText
                value={rpsData.generateRps.dosen_pengembang.koordinator_matakuliah}
                onChange={(value) => handleEdit(["dosen_pengembang", "koordinator_matakuliah"], value)}
                className="text-base"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Ketua Program Studi</h3>
              <EditableText
                value={rpsData.generateRps.dosen_pengembang.ketua_program_studi}
                onChange={(value) => handleEdit(["dosen_pengembang", "ketua_program_studi"], value)}
                className="text-base"
              />
            </div>
          </div>
        </Section>

        {/* Learning outcomes section */}
        <Section
          title="Capaian Pembelajaran"
          icon={<GraduationCap className="h-6 w-6 text-white" />}
          id="learning-outcomes"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3">Capaian Pembelajaran Lulusan (CPL)</h3>
              <div className="space-y-3">
                {rpsData.generateRps.capaian_pembelajaran_lulusan.kode.map((kode, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-[var(--bg-light)] dark:bg-[#2c4c6b]/50 text-[var(--primary)] p-1 rounded-lg min-w-[60px] h-7 flex items-center justify-center font-medium">
                      {editMode ? (
                        <Input
                          value={kode}
                          onChange={(e) => {
                            const newKode = [...rpsData.generateRps.capaian_pembelajaran_lulusan.kode]
                            newKode[index] = e.target.value
                            handleEdit(["capaian_pembelajaran_lulusan", "kode"], newKode)
                          }}
                          className="h-6 min-w-0 p-1 text-center border-0 focus-visible:ring-0"
                        />
                      ) : (
                        kode
                      )}
                    </div>
                    <div className="flex-1">
                      <EditableText
                        value={rpsData.generateRps.capaian_pembelajaran_lulusan.nama[index] || ""}
                        onChange={(value) => {
                          const newNama = [...rpsData.generateRps.capaian_pembelajaran_lulusan.nama]
                          newNama[index] = value
                          handleEdit(["capaian_pembelajaran_lulusan", "nama"], newNama)
                        }}
                        className="text-sm"
                      />
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => {
                          const newKode = [...rpsData.generateRps.capaian_pembelajaran_lulusan.kode]
                          const newNama = [...rpsData.generateRps.capaian_pembelajaran_lulusan.nama]
                          newKode.splice(index, 1)
                          newNama.splice(index, 1)
                          handleEdit(["capaian_pembelajaran_lulusan", "kode"], newKode)
                          handleEdit(["capaian_pembelajaran_lulusan", "nama"], newNama)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const newKode = [
                        ...rpsData.generateRps.capaian_pembelajaran_lulusan.kode,
                        `CPL-${rpsData.generateRps.capaian_pembelajaran_lulusan.kode.length + 1}`,
                      ]
                      const newNama = [...rpsData.generateRps.capaian_pembelajaran_lulusan.nama, ""]
                      handleEdit(["capaian_pembelajaran_lulusan", "kode"], newKode)
                      handleEdit(["capaian_pembelajaran_lulusan", "nama"], newNama)
                    }}
                  >
                    Tambah CPL
                  </Button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-3">Capaian Pembelajaran Mata Kuliah (CPMK)</h3>
              <div className="space-y-3">
                {rpsData.generateRps.capaian_pembelajaran_matakuliah.kode.map((kode, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-[var(--bg-light)] dark:bg-[#2c4c6b]/50 text-[var(--primary)] p-1 rounded-lg min-w-[60px] h-7 flex items-center justify-center font-medium">
                      {editMode ? (
                        <Input
                          value={kode}
                          onChange={(e) => {
                            const newKode = [...rpsData.generateRps.capaian_pembelajaran_matakuliah.kode]
                            newKode[index] = e.target.value
                            handleEdit(["capaian_pembelajaran_matakuliah", "kode"], newKode)
                          }}
                          className="h-6 min-w-0 p-1 text-center border-0 focus-visible:ring-0"
                        />
                      ) : (
                        kode
                      )}
                    </div>
                    <div className="flex-1">
                      <EditableText
                        value={rpsData.generateRps.capaian_pembelajaran_matakuliah.nama[index] || ""}
                        onChange={(value) => {
                          const newNama = [...rpsData.generateRps.capaian_pembelajaran_matakuliah.nama]
                          newNama[index] = value
                          handleEdit(["capaian_pembelajaran_matakuliah", "nama"], newNama)
                        }}
                        className="text-sm"
                      />
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => {
                          const newKode = [...rpsData.generateRps.capaian_pembelajaran_matakuliah.kode]
                          const newNama = [...rpsData.generateRps.capaian_pembelajaran_matakuliah.nama]
                          newKode.splice(index, 1)
                          newNama.splice(index, 1)
                          handleEdit(["capaian_pembelajaran_matakuliah", "kode"], newKode)
                          handleEdit(["capaian_pembelajaran_matakuliah", "nama"], newNama)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const newKode = [
                        ...rpsData.generateRps.capaian_pembelajaran_matakuliah.kode,
                        `CPMK-${rpsData.generateRps.capaian_pembelajaran_matakuliah.kode.length + 1}`,
                      ]
                      const newNama = [...rpsData.generateRps.capaian_pembelajaran_matakuliah.nama, ""]
                      handleEdit(["capaian_pembelajaran_matakuliah", "kode"], newKode)
                      handleEdit(["capaian_pembelajaran_matakuliah", "nama"], newNama)
                    }}
                  >
                    Tambah CPMK
                  </Button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-3">Sub Capaian Pembelajaran Mata Kuliah (Sub-CPMK)</h3>
              <div className="space-y-3">
                {rpsData.generateRps.sub_cpmk.kode.map((kode, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-[var(--bg-light)] dark:bg-[#2c4c6b]/50 text-[var(--primary)] p-1 rounded-lg min-w-[80px] h-7 flex items-center justify-center font-medium">
                      {editMode ? (
                        <Input
                          value={kode}
                          onChange={(e) => {
                            const newKode = [...rpsData.generateRps.sub_cpmk.kode]
                            newKode[index] = e.target.value
                            handleEdit(["sub_cpmk", "kode"], newKode)
                          }}
                          className="h-6 min-w-0 p-1 text-center border-0 focus-visible:ring-0"
                        />
                      ) : (
                        kode
                      )}
                    </div>
                    <div className="flex-1">
                      <EditableText
                        value={rpsData.generateRps.sub_cpmk.nama[index] || ""}
                        onChange={(value) => {
                          const newNama = [...rpsData.generateRps.sub_cpmk.nama]
                          newNama[index] = value
                          handleEdit(["sub_cpmk", "nama"], newNama)
                        }}
                        className="text-sm"
                      />
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => {
                          const newKode = [...rpsData.generateRps.sub_cpmk.kode]
                          const newNama = [...rpsData.generateRps.sub_cpmk.nama]
                          newKode.splice(index, 1)
                          newNama.splice(index, 1)
                          handleEdit(["sub_cpmk", "kode"], newKode)
                          handleEdit(["sub_cpmk", "nama"], newNama)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const newKode = [
                        ...rpsData.generateRps.sub_cpmk.kode,
                        `Sub-CPMK-${rpsData.generateRps.sub_cpmk.kode.length + 1}`,
                      ]
                      const newNama = [...rpsData.generateRps.sub_cpmk.nama, ""]
                      handleEdit(["sub_cpmk", "kode"], newKode)
                      handleEdit(["sub_cpmk", "nama"], newNama)
                    }}
                  >
                    Tambah Sub-CPMK
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Weekly topics section */}
        <Section
          title="Rencana Pembelajaran Mingguan"
          icon={<Calendar className="h-6 w-6 text-white" />}
          id="weekly-topics"
        >
          <div className="space-y-6">
            {rpsData.generateRps.topik_perpekan_item.map((item, weekIndex) => (
              <Card key={weekIndex} className="overflow-hidden">
                <div className="bg-[var(--bg-light)] dark:bg-[#2c4c6b]/30 p-3 flex items-center justify-between">
                  <h3 className="font-medium">Minggu {item.pekan}</h3>
                  {editMode && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => {
                          const newItems = [...rpsData.generateRps.topik_perpekan_item]
                          newItems.splice(weekIndex, 1)
                          handleEdit(["topik_perpekan_item"], newItems)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Sub-CPMK</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.sub_cpmk.map((subcpmk, subcpmkIndex) => (
                          <Badge
                            key={subcpmkIndex}
                            className="bg-[var(--bg-light)] text-[var(--primary)] dark:bg-[#2c4c6b] dark:text-[var(--accent)] border-0"
                          >
                            {editMode ? (
                              <Input
                                value={subcpmk}
                                onChange={(e) => {
                                  const newItems = [...rpsData.generateRps.topik_perpekan_item]
                                  newItems[weekIndex].sub_cpmk[subcpmkIndex] = e.target.value
                                  handleEdit(["topik_perpekan_item"], newItems)
                                }}
                                className="h-5 min-w-0 p-1 text-center border-0 focus-visible:ring-0 bg-transparent"
                              />
                            ) : (
                              subcpmk
                            )}
                            {editMode && (
                              <button
                                className="ml-1 text-red-500 hover:text-red-700"
                                onClick={() => {
                                  const newItems = [...rpsData.generateRps.topik_perpekan_item]
                                  newItems[weekIndex].sub_cpmk.splice(subcpmkIndex, 1)
                                  handleEdit(["topik_perpekan_item"], newItems)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                        {editMode && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 rounded-full"
                            onClick={() => {
                              const newItems = [...rpsData.generateRps.topik_perpekan_item]
                              newItems[weekIndex].sub_cpmk.push(`Sub-CPMK${newItems[weekIndex].sub_cpmk.length + 1}`)
                              handleEdit(["topik_perpekan_item"], newItems)
                            }}
                          >
                            +
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Indikator</h4>
                      <ul className="space-y-2">
                        {item.indikator.map((indikator, indikatorIndex) => (
                          <li key={indikatorIndex} className="flex items-start gap-2">
                            <div className="bg-[var(--bg-light)] dark:bg-[#2c4c6b]/50 text-[var(--primary)] p-1 rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs mt-0.5">
                              {indikatorIndex + 1}
                            </div>
                            <div className="flex-1">
                              <EditableText
                                value={indikator}
                                onChange={(value) => {
                                  const newItems = [...rpsData.generateRps.topik_perpekan_item]
                                  newItems[weekIndex].indikator[indikatorIndex] = value
                                  handleEdit(["topik_perpekan_item"], newItems)
                                }}
                                className="text-sm"
                              />
                            </div>
                            {editMode && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={() => {
                                  const newItems = [...rpsData.generateRps.topik_perpekan_item]
                                  newItems[weekIndex].indikator.splice(indikatorIndex, 1)
                                  handleEdit(["topik_perpekan_item"], newItems)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </li>
                        ))}
                        {editMode && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              const newItems = [...rpsData.generateRps.topik_perpekan_item]
                              newItems[weekIndex].indikator.push("")
                              handleEdit(["topik_perpekan_item"], newItems)
                            }}
                          >
                            Tambah Indikator
                          </Button>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Bahan Kajian</h4>
                      <ul className="space-y-2">
                        {item.bahan_kajian.map((bahan, bahanIndex) => (
                          <li key={bahanIndex} className="flex items-start gap-2">
                            <div className="bg-[var(--bg-light)] dark:bg-[#2c4c6b]/50 text-[var(--primary)] p-1 rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs mt-0.5">
                              {bahanIndex + 1}
                            </div>
                            <div className="flex-1">
                              <EditableText
                                value={bahan}
                                onChange={(value) => {
                                  const newItems = [...rpsData.generateRps.topik_perpekan_item]
                                  newItems[weekIndex].bahan_kajian[bahanIndex] = value
                                  handleEdit(["topik_perpekan_item"], newItems)
                                }}
                                className="text-sm"
                              />
                            </div>
                            {editMode && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={() => {
                                  const newItems = [...rpsData.generateRps.topik_perpekan_item]
                                  newItems[weekIndex].bahan_kajian.splice(bahanIndex, 1)
                                  handleEdit(["topik_perpekan_item"], newItems)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </li>
                        ))}
                        {editMode && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              const newItems = [...rpsData.generateRps.topik_perpekan_item]
                              newItems[weekIndex].bahan_kajian.push("")
                              handleEdit(["topik_perpekan_item"], newItems)
                            }}
                          >
                            Tambah Bahan Kajian
                          </Button>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {editMode && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const newItems = [...rpsData.generateRps.topik_perpekan_item]
                  const newWeek = {
                    pekan: newItems.length + 1,
                    sub_cpmk: ["Sub-CPMK1"],
                    indikator: [""],
                    bahan_kajian: [""],
                  }
                  newItems.push(newWeek)
                  handleEdit(["topik_perpekan_item"], newItems)
                }}
              >
                Tambah Minggu
              </Button>
            )}
          </div>
        </Section>

        {/* Assessment section */}
        <Section title="Komponen Penilaian" icon={<BarChart4 className="h-6 w-6 text-white" />} id="assessment">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(rpsData.generateRps.komponen_penilaian).map(([key, value], idx) => (
                <Card key={key} className="overflow-hidden">
                  <div className="bg-[var(--bg-light)] dark:bg-[#2c4c6b]/30 p-3">
                    <h3 className="font-medium text-center">
                      {editMode ? (
                        <Input
                          value={key}
                          onChange={(e) => {
                            const newPenilaian = { ...rpsData.generateRps.komponen_penilaian }
                            const oldValue = newPenilaian[key]
                            delete newPenilaian[key]
                            newPenilaian[e.target.value] = oldValue
                            handleEdit(["komponen_penilaian"], newPenilaian)
                          }}
                          className="h-6 text-center border-0 focus-visible:ring-0 bg-transparent"
                        />
                      ) : (
                        key
                      )}
                    </h3>
                  </div>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-light)] dark:bg-[#2c4c6b]/50 flex items-center justify-center mb-2 relative">
                      <div
                        className="w-16 h-16 rounded-full border-4 border-[var(--primary)] absolute"
                        style={{
                          clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - value}%)`,
                        }}
                      ></div>
                      <span className="text-lg font-bold text-[var(--primary)]">
                        {editMode ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => {
                              const newPenilaian = { ...rpsData.generateRps.komponen_penilaian }
                              newPenilaian[key] = Number.parseInt(e.target.value) || 0
                              handleEdit(["komponen_penilaian"], newPenilaian)
                            }}
                            className="w-12 h-8 text-center border-0 focus-visible:ring-0 bg-transparent"
                          />
                        ) : (
                          `${value}%`
                        )}
                      </span>
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 mt-2"
                        onClick={() => {
                          const newPenilaian = { ...rpsData.generateRps.komponen_penilaian }
                          delete newPenilaian[key]
                          handleEdit(["komponen_penilaian"], newPenilaian)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {editMode && (
                <Card className="overflow-hidden border-dashed">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    <Button
                      variant="ghost"
                      className="w-full h-full"
                      onClick={() => {
                        const newPenilaian = { ...rpsData.generateRps.komponen_penilaian }
                        newPenilaian["Komponen Baru"] = 0
                        handleEdit(["komponen_penilaian"], newPenilaian)
                      }}
                    >
                      Tambah Komponen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Section>

        {/* Study materials section */}
        <Section title="Bahan Kajian" icon={<BookOpen className="h-6 w-6 text-white" />} id="study-materials">
          <div className="space-y-4">
            <EditableList
              items={rpsData.generateRps.bahan_kajian}
              onChange={(items) => handleEdit(["bahan_kajian"], items)}
              renderItem={(item, index) => (
                <div className="flex items-start gap-2">
                  <div className="bg-[var(--bg-light)] dark:bg-[#2c4c6b]/50 text-[var(--primary)] p-1 rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs mt-0.5">
                    {index + 1}
                  </div>
                  <EditableText
                    value={item}
                    onChange={(value) => {
                      const newItems = [...rpsData.generateRps.bahan_kajian]
                      newItems[index] = value
                      handleEdit(["bahan_kajian"], newItems)
                    }}
                    className="flex-1 text-sm"
                  />
                </div>
              )}
              addButtonText="Tambah Bahan Kajian"
            />
          </div>
        </Section>
      </div>

      {/* Preview mode */}
      {!editMode && (
        <div className="mt-8">
          <Card className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-0">
            <CardContent className="p-0">
              <RpsResultView data={rpsData} isLoading={false} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
