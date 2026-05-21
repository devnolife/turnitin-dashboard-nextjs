import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"
import { saveUploadedFile, validateFile } from "@/lib/upload"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"

const metaSchema = z.object({
  documentTitle: z.string().min(3, "Judul minimal 3 karakter").max(200),
  examType: z.enum(["PROPOSAL_DEFENSE", "RESULTS_DEFENSE", "FINAL_DEFENSE"]).optional(),
  chapter: z.string().max(20).optional(),
  parentSubmissionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "STUDENT")

    const rl = await rateLimit(`upload:${auth.userId}`, 20, 60 * 60 * 1000)
    if (!rl.success) {
      const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: "Terlalu banyak upload dalam satu jam. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File wajib di-upload" }, { status: 400 })
    }

    const v = await validateFile(file, "submission")
    if (!v.ok) return NextResponse.json({ error: v.reason }, { status: 400 })

    const parsed = metaSchema.safeParse({
      documentTitle: formData.get("documentTitle"),
      examType: formData.get("examType") || undefined,
      chapter: formData.get("chapter") || undefined,
      parentSubmissionId: formData.get("parentSubmissionId") || undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.issues },
        { status: 400 },
      )
    }

    const { documentTitle, examType, chapter, parentSubmissionId } = parsed.data

    // Block duplicates: tidak boleh ada submission aktif (PENDING/PROCESSING)
    // untuk kombinasi (userId, examType, chapter) yang sama
    const activeDup = await prisma.submission.findFirst({
      where: {
        userId: auth.userId,
        examType: examType ?? null,
        chapter: chapter ?? null,
        status: { in: ["PENDING", "PROCESSING"] },
      },
      select: { id: true },
    })
    if (activeDup) {
      return NextResponse.json(
        {
          error:
            "Anda masih memiliki pengiriman aktif untuk bab/ujian ini. Tunggu hasil sebelum mengirim lagi.",
        },
        { status: 409 },
      )
    }

    // Resubmit: validasi parent
    let version = 1
    let parentId: string | null = null
    if (parentSubmissionId) {
      const parent = await prisma.submission.findFirst({
        where: { id: parentSubmissionId, userId: auth.userId },
        select: { id: true, version: true, status: true },
      })
      if (!parent) {
        return NextResponse.json(
          { error: "Submission referensi tidak ditemukan" },
          { status: 400 },
        )
      }
      if (parent.status !== "FLAGGED") {
        return NextResponse.json(
          { error: "Hanya submission berstatus FLAGGED yang bisa diresubmit" },
          { status: 400 },
        )
      }
      version = parent.version + 1
      parentId = parent.id
    }

    const submissionId = (await import("crypto")).randomBytes(12).toString("hex")
    const saved = await saveUploadedFile(file, "submission", submissionId)

    const created = await prisma.submission.create({
      data: {
        id: submissionId,
        userId: auth.userId,
        documentTitle,
        documentUrl: saved.relativePath,
        fileName: saved.originalName,
        fileSize: saved.size,
        fileMimeType: saved.mimeType,
        examType: examType ?? null,
        chapter: chapter ?? null,
        status: "PENDING",
        version,
        parentSubmissionId: parentId,
      },
    })

    logger.info("Submission created", { submissionId: created.id, userId: auth.userId })

    return NextResponse.json({ submission: created }, { status: 201 })
  } catch (error) {
    logger.error("Submission upload failed", { error })
    return handleAuthError(error)
  }
}
