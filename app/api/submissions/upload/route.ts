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

    // Anti-spam: cegah mahasiswa membanjiri antrian.
    // - Prodi PER_CHAPTER (upload per bab): tiap bab adalah file terpisah, jadi
    //   batasi hanya per BAB — boleh kirim bab lain walau ada bab lain diproses,
    //   tapi cegah dobel pada bab yang SAMA.
    // - Selain itu (PER_EXAM / tanpa rule): hanya boleh SATU pengiriman aktif.
    const ruleType = await resolveRuleType(auth.userId)
    const isPerChapter = ruleType === "PER_CHAPTER" && !!chapter

    const activeWhere = isPerChapter
      ? {
          userId: auth.userId,
          status: { in: ["PENDING", "PROCESSING"] as const },
          chapter: { equals: chapter, mode: "insensitive" as const },
        }
      : { userId: auth.userId, status: { in: ["PENDING", "PROCESSING"] as const } }

    const active = await prisma.submission.findFirst({
      where: activeWhere,
      select: { id: true },
    })
    if (active) {
      return NextResponse.json(
        {
          error: isPerChapter
            ? `Bab "${chapter}" masih sedang diproses. Tunggu hasilnya sebelum mengirim ulang bab ini. Anda tetap bisa mengirim bab lain.`
            : "Masih ada dokumen yang sedang diproses. Tunggu sampai selesai (Selesai/Perlu Revisi) sebelum mengirim dokumen baru.",
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

    const student = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        instructor: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
            hp: true,
          },
        },
      },
    })

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

    const instructor = student?.instructor
      ? {
          id: student.instructor.id,
          name: student.instructor.name,
          whatsappNumber:
            student.instructor.whatsappNumber || student.instructor.hp || null,
        }
      : null

    return NextResponse.json({ submission: created, instructor }, { status: 201 })
  } catch (error) {
    logger.error("Submission upload failed", { error })
    return handleAuthError(error)
  }
}

/**
 * Ambil ruleType prodi mahasiswa (PER_CHAPTER / PER_EXAM) untuk menentukan cakupan
 * anti-spam. Mengembalikan null bila prodi tidak punya aturan. Best-effort: error
 * apa pun dianggap null (anti-spam default ketat = satu pengiriman aktif).
 */
async function resolveRuleType(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { studyProgramId: true },
    })
    if (!user?.studyProgramId) return null
    const rule = await prisma.similarityRule.findFirst({
      where: { studyProgramId: user.studyProgramId },
      orderBy: { orderIndex: "asc" },
      select: { ruleType: true },
    })
    return rule?.ruleType ?? null
  } catch {
    return null
  }
}
