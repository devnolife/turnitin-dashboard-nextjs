"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  Save,
  FileCheck,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTransition, FadeIn } from "@/components/ui/motion"
import { DashboardMainCard } from "@/components/dashboard/main-card"

interface SimilarityRule {
  id?: string
  label: string
  maxPercentage: number
  orderIndex: number
}

interface ProgramData {
  id: string
  name: string
  code: string
  degree: string
  faculty: { name: string; code: string }
  similarityRules: Array<{
    id: string
    ruleType: string
    label: string
    maxPercentage: number
    orderIndex: number
  }>
}

const DEFAULT_CHAPTER_RULES: SimilarityRule[] = [
  { label: "Bab 1 - Pendahuluan", maxPercentage: 10, orderIndex: 0 },
  { label: "Bab 2 - Tinjauan Pustaka", maxPercentage: 25, orderIndex: 1 },
  { label: "Bab 3 - Metode Penelitian", maxPercentage: 15, orderIndex: 2 },
  { label: "Bab 4 - Hasil dan Pembahasan", maxPercentage: 15, orderIndex: 3 },
  { label: "Bab 5 - Kesimpulan", maxPercentage: 10, orderIndex: 4 },
]

const DEFAULT_EXAM_RULES: SimilarityRule[] = [
  { label: "Ujian Proposal", maxPercentage: 25, orderIndex: 0 },
  { label: "Ujian Hasil", maxPercentage: 20, orderIndex: 1 },
  { label: "Ujian Tutup / Sidang Akhir", maxPercentage: 15, orderIndex: 2 },
]

export function SimilarityRulesPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  const [program, setProgram] = useState<ProgramData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [activeTab, setActiveTab] = useState<"PER_CHAPTER" | "PER_EXAM">("PER_CHAPTER")
  const [chapterRules, setChapterRules] = useState<SimilarityRule[]>([])
  const [examRules, setExamRules] = useState<SimilarityRule[]>([])

  const fetchProgram = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/study-programs?programId=${programId}`)
      const data = await res.json()
      const prog = (data.programs || []).find((p: ProgramData) => p.id === programId)
      if (prog) {
        setProgram(prog)

        const existingChapter = prog.similarityRules
          .filter((r: { ruleType: string }) => r.ruleType === "PER_CHAPTER")
          .map((r: { label: string; maxPercentage: number; orderIndex: number }) => ({
            label: r.label,
            maxPercentage: r.maxPercentage,
            orderIndex: r.orderIndex,
          }))

        const existingExam = prog.similarityRules
          .filter((r: { ruleType: string }) => r.ruleType === "PER_EXAM")
          .map((r: { label: string; maxPercentage: number; orderIndex: number }) => ({
            label: r.label,
            maxPercentage: r.maxPercentage,
            orderIndex: r.orderIndex,
          }))

        setChapterRules(existingChapter.length > 0 ? existingChapter : [])
        setExamRules(existingExam.length > 0 ? existingExam : [])

        // Set active tab based on existing rules
        if (existingExam.length > 0 && existingChapter.length === 0) {
          setActiveTab("PER_EXAM")
        }
      }
    } catch (error) {
      console.error("Failed to fetch program:", error)
    } finally {
      setIsLoading(false)
    }
  }, [programId])

  useEffect(() => {
    fetchProgram()
  }, [fetchProgram])

  const currentRules = activeTab === "PER_CHAPTER" ? chapterRules : examRules
  const setCurrentRules = activeTab === "PER_CHAPTER" ? setChapterRules : setExamRules

  const handleAddRule = () => {
    const newRule: SimilarityRule = {
      label: activeTab === "PER_CHAPTER"
        ? `Bab ${currentRules.length + 1}`
        : `Ujian ${currentRules.length + 1}`,
      maxPercentage: 15,
      orderIndex: currentRules.length,
    }
    setCurrentRules([...currentRules, newRule])
  }

  const handleLoadDefaults = () => {
    if (activeTab === "PER_CHAPTER") {
      setChapterRules([...DEFAULT_CHAPTER_RULES])
    } else {
      setExamRules([...DEFAULT_EXAM_RULES])
    }
  }

  const handleRemoveRule = (index: number) => {
    const updated = currentRules.filter((_, i) => i !== index)
    setCurrentRules(updated.map((r, i) => ({ ...r, orderIndex: i })))
  }

  const handleUpdateRule = (index: number, field: "label" | "maxPercentage", value: string | number) => {
    const updated = [...currentRules]
    if (field === "maxPercentage") {
      updated[index] = { ...updated[index], maxPercentage: Number(value) }
    } else {
      updated[index] = { ...updated[index], label: value as string }
    }
    setCurrentRules(updated)
  }

  const handleSave = async () => {
    if (currentRules.length === 0) {
      setSaveMessage({ type: "error", text: "Tambahkan minimal 1 aturan sebelum menyimpan" })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch("/api/admin/similarity-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyProgramId: programId,
          ruleType: activeTab,
          rules: currentRules.map((r, i) => ({
            label: r.label,
            maxPercentage: r.maxPercentage,
            orderIndex: i,
          })),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSaveMessage({ type: "success", text: "Aturan similarity berhasil disimpan!" })
        // Refresh data
        await fetchProgram()
      } else {
        setSaveMessage({ type: "error", text: data.message || "Gagal menyimpan aturan" })
      }
    } catch {
      setSaveMessage({ type: "error", text: "Terjadi kesalahan saat menyimpan" })
    } finally {
      setIsSaving(false)
    }
  }

  const getPercentageColor = (pct: number) => {
    if (pct <= 10) return "bg-green-500"
    if (pct <= 20) return "bg-yellow-500"
    if (pct <= 30) return "bg-orange-500"
    return "bg-red-500"
  }

  if (isLoading) {
    return (
      <PageTransition>
        <DashboardMainCard title="Memuat..." subtitle="Mengambil data program studi..." icon={BookOpen}>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DashboardMainCard>
      </PageTransition>
    )
  }

  if (!program) {
    return (
      <PageTransition>
        <DashboardMainCard title="Tidak Ditemukan" subtitle="Program studi tidak ditemukan" icon={AlertCircle}>
          <Button onClick={() => router.push("/dashboard/admin/prodi")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Prodi
          </Button>
        </DashboardMainCard>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <DashboardMainCard
        title="Aturan Similarity"
        subtitle={`${program.name} - ${program.faculty.name}`}
        icon={FileCheck}
      >
        {/* Back Button & Program Info */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={() => router.push("/dashboard/admin/prodi")}
            variant="outline"
            className="w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          <div className="flex gap-2">
            <Badge variant="outline">{program.code}</Badge>
            <Badge variant="secondary">{program.degree}</Badge>
            <Badge variant="secondary">{program.faculty.code}</Badge>
          </div>
        </div>

        {/* Rule Type Tabs */}
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Tipe Aturan Similarity</CardTitle>
            <CardDescription>
              Pilih apakah aturan similarity diatur per bab skripsi atau per jenis ujian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "PER_CHAPTER" | "PER_EXAM")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="PER_CHAPTER">📖 Per Bab</TabsTrigger>
                <TabsTrigger value="PER_EXAM">📝 Per Jenis Ujian</TabsTrigger>
              </TabsList>

              <TabsContent value="PER_CHAPTER" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Atur batas maksimum similarity untuk setiap bab skripsi/tesis.
                  Contoh: Bab 2 (Tinjauan Pustaka) biasanya memiliki batas lebih tinggi karena banyak kutipan.
                </p>
              </TabsContent>

              <TabsContent value="PER_EXAM" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Atur batas maksimum similarity berdasarkan jenis ujian yang ditempuh mahasiswa.
                  Setiap tahap ujian bisa memiliki batas yang berbeda.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Rules Editor */}
        <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {activeTab === "PER_CHAPTER" ? "Aturan Per Bab" : "Aturan Per Jenis Ujian"}
              </CardTitle>
              <CardDescription>
                {currentRules.length > 0
                  ? `${currentRules.length} aturan telah ditambahkan`
                  : "Belum ada aturan. Tambahkan atau gunakan template default."}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {currentRules.length === 0 && (
                <Button variant="outline" onClick={handleLoadDefaults}>
                  Template Default
                </Button>
              )}
              <Button onClick={handleAddRule}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Aturan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentRules.length === 0 ? (
              <FadeIn className="flex flex-col items-center justify-center py-12 text-center">
                <FileCheck className="h-16 w-16 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-medium">Belum Ada Aturan</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Klik &quot;Template Default&quot; untuk memuat aturan standar, atau
                  &quot;Tambah Aturan&quot; untuk membuat aturan secara manual.
                </p>
              </FadeIn>
            ) : (
              <div className="space-y-3">
                {currentRules.map((rule, index) => (
                  <FadeIn key={index}>
                    <div className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
                      {/* Order number */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                        {index + 1}
                      </div>

                      {/* Label input */}
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">Label</Label>
                        <Input
                          value={rule.label}
                          onChange={(e) => handleUpdateRule(index, "label", e.target.value)}
                          placeholder="Nama bab atau jenis ujian"
                          className="mt-1"
                        />
                      </div>

                      {/* Percentage input */}
                      <div className="w-32 shrink-0">
                        <Label className="text-xs text-muted-foreground">Maks. Similarity</Label>
                        <div className="relative mt-1">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={rule.maxPercentage}
                            onChange={(e) => handleUpdateRule(index, "maxPercentage", e.target.value)}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>

                      {/* Percentage bar */}
                      <div className="w-20 shrink-0 hidden sm:block">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getPercentageColor(rule.maxPercentage)}`}
                            style={{ width: `${Math.min(rule.maxPercentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-1">
                          {rule.maxPercentage}%
                        </p>
                      </div>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}

            {/* Save message */}
            {saveMessage && (
              <FadeIn>
                <div
                  className={`rounded-lg p-3 text-sm ${
                    saveMessage.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {saveMessage.text}
                </div>
              </FadeIn>
            )}

            {/* Save button */}
            {currentRules.length > 0 && (
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? "Menyimpan..." : "Simpan Aturan"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        {currentRules.length > 0 && (
          <Card className="rounded-3xl border-2 border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-400">
                📋 Preview Aturan Mahasiswa
              </CardTitle>
              <CardDescription>
                Tampilan yang akan dilihat mahasiswa {program.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-background p-4 space-y-3">
                <h4 className="font-semibold">
                  Batas Similarity - {program.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Tipe: {activeTab === "PER_CHAPTER" ? "Per Bab" : "Per Jenis Ujian"}
                </p>
                <div className="space-y-2">
                  {currentRules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
                      <span className="text-sm font-medium">{rule.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getPercentageColor(rule.maxPercentage)}`}
                            style={{ width: `${Math.min(rule.maxPercentage, 100)}%` }}
                          />
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            rule.maxPercentage <= 10
                              ? "border-green-500 text-green-600"
                              : rule.maxPercentage <= 20
                              ? "border-yellow-500 text-yellow-600"
                              : rule.maxPercentage <= 30
                              ? "border-orange-500 text-orange-600"
                              : "border-red-500 text-red-600"
                          }
                        >
                          Maks. {rule.maxPercentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardMainCard>
    </PageTransition>
  )
}
