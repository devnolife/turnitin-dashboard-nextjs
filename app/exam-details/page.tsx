import type { Metadata } from "next"
import { ExamDetailsForm } from "@/components/dashboard/student/exam-details-form"

export const metadata: Metadata = {
  title: "Exam Details - Perpusmu",
  description: "Submit your exam details for Perpusmu",
}

export default function ExamDetailsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Detail Ujian Skripsi</h1>
        <p className="mt-2 text-muted-foreground">
          Lengkapi detail ujian skripsi Anda untuk mengakses layanan Perpusmu
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <ExamDetailsForm />
      </div>
    </div>
  )
}

