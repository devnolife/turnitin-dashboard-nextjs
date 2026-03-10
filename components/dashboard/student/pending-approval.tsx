"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ClockIcon } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { motion } from "framer-motion"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"

export function PendingApproval() {
  const { user } = useAuthStore()

  // Format the exam type for display
  const formatExamType = (examType: string | null | undefined) => {
    if (!examType) return ""

    switch (examType) {
      case "proposal_defense":
        return "Sidang Proposal"
      case "results_defense":
        return "Sidang Hasil"
      case "final_defense":
        return "Sidang Akhir"
      default:
        return examType
    }
  }

  // Format the submission date
  const formatSubmissionDate = (dateString: string | null | undefined) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <FadeIn>
      <Card className="shadow-lg border-warning/20 rounded-3xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <motion.div
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
            >
              <ClockIcon className="h-6 w-6 text-warning" />
            </motion.div>
            <span className="gradient-text">Menunggu Verifikasi Administrator</span>
          </CardTitle>
          <CardDescription>Detail ujian Anda sedang diverifikasi oleh administrator</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <StaggerContainer className="space-y-6">
            <StaggerItem>
              <div className="rounded-xl border p-5 bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-medium mb-5 gradient-text">Detail Ujian Anda</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-muted-foreground">Judul Skripsi:</div>
                    <div className="col-span-2 font-medium">{user?.examDetails?.thesisTitle}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-muted-foreground">Jenis Ujian:</div>
                    <div className="col-span-2 font-medium">{formatExamType(user?.examDetails?.examType)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-muted-foreground">Tanggal Pengajuan:</div>
                    <div className="col-span-2 font-medium">{formatSubmissionDate(user?.examDetails?.submittedAt)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-muted-foreground">Status:</div>
                    <div className="col-span-2">
                      <motion.span
                        className="inline-flex items-center rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-medium text-warning"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                      >
                        Menunggu Verifikasi
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-5 backdrop-blur-sm">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Administrator sedang memverifikasi detail ujian Anda. Proses ini biasanya membutuhkan waktu 1-2 hari
                  kerja. Anda akan mendapatkan notifikasi melalui WhatsApp ketika verifikasi selesai.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-xs text-center text-muted-foreground">
            Jika Anda memiliki pertanyaan, silakan hubungi administrator di{" "}
            <span className="font-medium">admin@perpusmu.ac.id</span> atau WhatsApp{" "}
            <span className="font-medium">+62812-3456-7890</span>.
          </p>
        </CardFooter>
      </Card>
    </FadeIn>
  )
}

