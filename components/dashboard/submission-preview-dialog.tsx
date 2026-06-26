"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, FileCheck2, FileText, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api/client"

export interface PreviewTarget {
  id: string
  title: string
  fileName: string | null
  /** Apakah ada PDF report Turnitin tersimpan. */
  hasReport: boolean
  /** Baris info di bawah judul (mis. "Nama · Similarity 10%"). */
  subtitle?: string
  /** Untuk pesan tab Report saat PDF belum ada. */
  similarityScore?: number | null
}

/**
 * Modal preview submission yang dipakai bersama oleh instruktur & mahasiswa:
 * - Tab "Dokumen": PDF tampil inline (iframe), DOCX dikonversi ke HTML.
 * - Tab "Report": PDF Similarity Report Turnitin tampil inline bila tersedia.
 *
 * Route backend (/preview, /file?inline=1, /report?inline=1) sudah mengizinkan
 * pemilik submission, instruktur ter-assign, dan admin.
 */
export default function SubmissionPreviewDialog({
  target,
  onClose,
}: {
  target: PreviewTarget | null
  onClose: () => void
}) {
  const [tab, setTab] = useState<"doc" | "report">("doc")
  const [doc, setDoc] = useState<{
    loading: boolean
    kind?: "pdf" | "html" | "unsupported"
    html?: string
    error?: string
  }>({ loading: false })

  const ext = (target?.fileName || "").toLowerCase().split(".").pop() || ""

  const loadPreview = useCallback(async () => {
    if (!target) return
    if (ext === "pdf") {
      setDoc({ loading: false, kind: "pdf" })
      return
    }
    if (ext !== "docx") {
      setDoc({ loading: false, kind: "unsupported" })
      return
    }
    setDoc({ loading: true })
    try {
      const res = await api.get(`/submissions/${target.id}/preview`, { timeout: 60000 })
      setDoc({ loading: false, kind: res.data.kind, html: res.data.html })
    } catch (e) {
      const code = (e as { code?: string })?.code
      const serverMsg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      setDoc({
        loading: false,
        error:
          serverMsg ||
          (code === "ECONNABORTED"
            ? "Memuat dokumen terlalu lama. Coba lagi."
            : "Gagal memuat preview dokumen."),
      })
    }
  }, [target, ext])

  useEffect(() => {
    if (!target) return
    setTab("doc")
    void loadPreview()
  }, [target, loadPreview])

  if (!target) return null

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden rounded-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="truncate pr-8">{target.title}</DialogTitle>
          {target.subtitle ? <DialogDescription>{target.subtitle}</DialogDescription> : null}
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "doc" | "report")} className="px-6 pb-6">
          <TabsList className="mb-4 rounded-full bg-muted p-1">
            <TabsTrigger value="doc" className="rounded-full">
              <FileText className="mr-2 size-4" /> Dokumen
            </TabsTrigger>
            <TabsTrigger value="report" className="rounded-full">
              <FileCheck2 className="mr-2 size-4" /> Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doc" className="mt-0">
            {doc.loading ? (
              <div className="grid h-[68vh] place-items-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : doc.kind === "pdf" ? (
              <iframe
                src={`/api/submissions/${target.id}/file?inline=1`}
                className="h-[68vh] w-full rounded-2xl border bg-white"
                title="Dokumen"
              />
            ) : doc.kind === "html" ? (
              <div
                className="docx-preview h-[68vh] overflow-auto rounded-2xl border bg-white p-8 dark:bg-gray-950"
                dangerouslySetInnerHTML={{ __html: doc.html || "" }}
              />
            ) : (
              <div className="grid h-[40vh] place-content-center justify-items-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center">
                <FileText className="size-10 text-muted-foreground/40" />
                <p className="max-w-md text-sm text-muted-foreground">
                  {doc.error || "Preview tidak tersedia untuk tipe file ini (mis. .doc lama). Silakan unduh."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {doc.error && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => void loadPreview()}
                    >
                      <RefreshCw className="mr-2 size-4" /> Coba lagi
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <a href={`/api/submissions/${target.id}/file`} target="_blank" rel="noreferrer">
                      <Download className="mr-2 size-4" /> Unduh file
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="report" className="mt-0">
            {target.hasReport ? (
              <iframe
                src={`/api/submissions/${target.id}/report?inline=1`}
                className="h-[68vh] w-full rounded-2xl border bg-white"
                title="Report Turnitin"
              />
            ) : (
              <div className="grid h-[40vh] place-content-center justify-items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center">
                <FileCheck2 className="size-10 text-muted-foreground/40" />
                <p className="font-medium">
                  {target.similarityScore != null
                    ? `Skor similarity: ${target.similarityScore.toFixed(1)}%`
                    : "Belum ada skor"}
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Report Turnitin belum tersedia untuk dokumen ini.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
