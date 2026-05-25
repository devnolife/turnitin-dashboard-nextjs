"use client"

import {
  FileText,
  Download,
  Eye,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type Student } from "@/lib/store/student-store"

export interface StudentSubmissionsTabProps {
  student: Student
  formatExamStage?: (stage: string) => string
  formatDate?: (dateString: string | null) => string
}

export function TurnitinResultsContent({ student }: StudentSubmissionsTabProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border p-8 text-center">
      <FileText className="size-12 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-medium">Info Pengajuan</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Total pengajuan: {student.submissionsCount} | Direview: {student.reviewedCount} | Ditandai: {student.flaggedCount}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Rata-rata similarity: {student.avgSimilarity}%
      </p>
    </div>
  )
}

export function SubmissionsContent({ student }: { student: Student }) {
  return (
    <>
      {student.submissionsCount > 0 ? (
        <div className="rounded-md border overflow-x-auto">
          <div className="p-4">
            <h3 className="text-lg font-medium">Pengajuan Terbaru</h3>
            <p className="text-sm text-muted-foreground">
              {student.submissionsCount} pengajuan dokumen
            </p>
          </div>
          <div className="border-t p-4 text-center text-sm text-muted-foreground">
            Lihat detail lengkap di halaman detail mahasiswa
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border p-8 text-center">
          <FileText className="size-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium">Belum Ada Pengajuan</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Mahasiswa ini belum mengajukan dokumen apapun.
          </p>
        </div>
      )}
    </>
  )
}

export interface FeedbackContentProps {
  student: Student
  formatDate?: (dateString: string | null) => string
}

export function FeedbackContent({ student }: FeedbackContentProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <div className="p-4">
        <h3 className="text-lg font-medium">Umpan Balik Instruktur</h3>
        <p className="text-sm text-muted-foreground">Umpan balik yang diberikan kepada mahasiswa</p>
      </div>
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="size-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium">Belum Ada Umpan Balik</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Belum ada umpan balik yang diberikan kepada mahasiswa ini.
        </p>
      </div>
    </div>
  )
}

export interface ExamInfoCardProps {
  student: Student
  formatDate?: (dateString: string | null) => string
}

export function ExamInfoCard({ student, formatDate }: ExamInfoCardProps) {
  const fmt = formatDate || ((d: string | null) => d ? new Date(d).toLocaleDateString("id-ID") : "-")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Ujian</CardTitle>
        <CardDescription>Detail tentang skripsi dan ujian mahasiswa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Judul Skripsi</h3>
          <p className="text-lg font-medium">{student.examDetail?.thesisTitle || "Belum ada judul skripsi"}</p>
        </div>

        {student.examDetail && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Jenis Ujian</h3>
              <Badge variant="outline">{student.examDetail.examType}</Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Status Persetujuan</h3>
              <Badge
                variant={
                  student.examDetail.approvalStatus === "APPROVED" ? "success"
                  : student.examDetail.approvalStatus === "REJECTED" ? "destructive"
                  : "secondary"
                }
              >
                {student.examDetail.approvalStatus}
              </Badge>
            </div>
          </div>
        )}

        {!student.examDetail && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileText className="size-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-medium">Belum Ada Data Ujian</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Mahasiswa ini belum mengajukan ujian.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
