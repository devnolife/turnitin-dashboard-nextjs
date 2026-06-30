import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { enqueueJob, getLatestJob } from "@/lib/turnitin/queue"
import { audit } from "@/lib/audit"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"

async function loadAuthorized(request: NextRequest, id: string) {
  const auth = await verifyAuth(request)
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { user: { select: { instructorId: true } } },
  })
  if (!submission) {
    throw new AuthError("Submission tidak ditemukan", 404)
  }
  const isOwner = submission.userId === auth.userId
  const isAssignedInstructor =
    auth.role === "INSTRUCTOR" && submission.user.instructorId === auth.userId
  const isAdmin = auth.role === "ADMIN"
  if (!isOwner && !isAssignedInstructor && !isAdmin) {
    throw new AuthError("Anda tidak punya akses ke submission ini", 403)
  }
  return { auth, submission }
}

/** POST — masukkan submission ke antrian pengecekan Turnitin otomatis. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { auth, submission } = await loadAuthorized(request, id)

    if (submission.status !== "PENDING" && submission.status !== "PROCESSING") {
      return NextResponse.json(
        { error: `Submission sudah berstatus ${submission.status}; tidak bisa dicek ulang otomatis.` },
        { status: 409 },
      )
    }
    if (!submission.documentUrl) {
      return NextResponse.json(
        { error: "Submission tidak punya file untuk dicek." },
        { status: 400 },
      )
    }

    // Batas % similarity opsional khusus dokumen ini (override aturan prodi).
    // PRIVILEGED: hanya instruktur pembimbing / admin yang boleh menetapkan batas ini.
    // Mahasiswa (owner) TIDAK boleh — tanpa pembatasan ini, mahasiswa dapat mengirim
    // threshold=100 dan meloloskan dokumennya sendiri (bypass total aturan prodi via
    // thresholdOverride; lihat lib/turnitin/apply-result.ts).
    // Catatan: loadAuthorized() sudah memastikan instruktur = pembimbing submission ini.
    let threshold: number | null = null
    const body = await request.json().catch(() => null)
    if (body && body.threshold != null && body.threshold !== "") {
      if (auth.role !== "INSTRUCTOR" && auth.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Hanya dosen pembimbing atau admin yang dapat menetapkan batas similarity." },
          { status: 403 },
        )
      }
      const t = Number(body.threshold)
      if (!Number.isFinite(t) || t < 0 || t > 100) {
        return NextResponse.json(
          { error: "Batas similarity harus angka 0-100." },
          { status: 400 },
        )
      }
      threshold = t
    }

    const { job, created } = await enqueueJob(submission.id)

    if (created && submission.status === "PENDING") {
      await prisma.submission.updateMany({
        where: { id: submission.id, status: "PENDING" },
        data: { status: "PROCESSING", autoCheckError: null },
      })
    }
    if (threshold != null) {
      await prisma.submission.update({
        where: { id: submission.id },
        data: { thresholdOverride: threshold },
      })
    }

    await audit("submission.auto_check_enqueued", {
      request,
      actorId: auth.userId,
      actorRole: auth.role,
      targetType: "submission",
      targetId: submission.id,
      metadata: { jobId: job.id, created },
    })
    logger.info("turnitin.enqueue", { submissionId: submission.id, jobId: job.id, created })

    return NextResponse.json(
      {
        queued: true,
        alreadyQueued: !created,
        job: { id: job.id, status: job.status, attempts: job.attempts },
      },
      { status: created ? 202 : 200 },
    )
  } catch (error) {
    return handleAuthError(error)
  }
}

/** GET — status job terbaru + skor (untuk polling UI). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { submission } = await loadAuthorized(request, id)
    const job = await getLatestJob(submission.id)

    return NextResponse.json({
      submission: {
        id: submission.id,
        status: submission.status,
        similarityScore: submission.similarityScore,
        autoCheckError: submission.autoCheckError,
        autoCheckedAt: submission.autoCheckedAt,
      },
      job: job
        ? {
            id: job.id,
            status: job.status,
            attempts: job.attempts,
            maxAttempts: job.maxAttempts,
            errorCode: job.errorCode,
            lastError: job.lastError,
            updatedAt: job.updatedAt,
          }
        : null,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
