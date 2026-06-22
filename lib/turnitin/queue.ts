import { prisma } from "@/lib/prisma"
import type { TurnitinJob, TurnitinJobStatus } from "@prisma/client"

/** Job RUNNING/WAITING lebih lama dari ini dianggap macet → dikembalikan ke antrian. */
const STALE_LOCK_MS = 30 * 60_000

const ACTIVE_STATUSES: TurnitinJobStatus[] = ["QUEUED", "RUNNING", "WAITING_REPORT"]

/**
 * Buat job baru untuk submission. Idempotent: bila sudah ada job aktif
 * (QUEUED/RUNNING/WAITING_REPORT), kembalikan yang itu dengan `created=false`.
 */
export async function enqueueJob(
  submissionId: string,
): Promise<{ job: TurnitinJob; created: boolean }> {
  const active = await prisma.turnitinJob.findFirst({
    where: { submissionId, status: { in: ACTIVE_STATUSES } },
    orderBy: { createdAt: "desc" },
  })
  if (active) return { job: active, created: false }
  const job = await prisma.turnitinJob.create({ data: { submissionId } })
  return { job, created: true }
}

/** Kembalikan job yang lock-nya basi (worker mati di tengah jalan) ke QUEUED. */
export async function releaseStaleLocks(): Promise<number> {
  const res = await prisma.turnitinJob.updateMany({
    where: {
      status: { in: ["RUNNING", "WAITING_REPORT"] },
      lockedAt: { lt: new Date(Date.now() - STALE_LOCK_MS) },
    },
    data: { status: "QUEUED", lockedAt: null },
  })
  return res.count
}

/**
 * Ambil 1 job berikutnya secara atomik (locking optimistik via updateMany guard).
 * Mengembalikan null bila antrian kosong atau job keburu diklaim worker lain.
 */
export async function claimNextJob(): Promise<TurnitinJob | null> {
  await releaseStaleLocks()
  const candidate = await prisma.turnitinJob.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
  })
  if (!candidate) return null

  const res = await prisma.turnitinJob.updateMany({
    where: { id: candidate.id, status: "QUEUED" },
    data: {
      status: "RUNNING",
      lockedAt: new Date(),
      startedAt: candidate.startedAt ?? new Date(),
      attempts: { increment: 1 },
    },
  })
  if (res.count === 0) return null // diklaim worker lain
  return prisma.turnitinJob.findUnique({ where: { id: candidate.id } })
}

export async function markWaitingReport(jobId: string, paperId: string | null): Promise<void> {
  await prisma.turnitinJob.update({
    where: { id: jobId },
    data: {
      status: "WAITING_REPORT",
      turnitinPaperId: paperId ?? undefined,
      lockedAt: new Date(),
    },
  })
}

export async function markSucceeded(jobId: string, paperId: string | null): Promise<void> {
  await prisma.turnitinJob.update({
    where: { id: jobId },
    data: {
      status: "SUCCEEDED",
      turnitinPaperId: paperId ?? undefined,
      finishedAt: new Date(),
      lockedAt: null,
      lastError: null,
      errorCode: null,
    },
  })
}

export interface FailOptions {
  /** Bila false, langsung FAILED tanpa retry (mis. file ditolak permanen). */
  retryable?: boolean
}

/**
 * Tandai job gagal. Bila masih ada sisa attempt & retryable → kembali ke QUEUED
 * untuk dicoba lagi; selain itu FAILED. Mengembalikan status akhir.
 */
export async function markFailed(
  jobId: string,
  errorCode: string,
  message: string,
  opts: FailOptions = {},
): Promise<TurnitinJobStatus> {
  const job = await prisma.turnitinJob.findUnique({
    where: { id: jobId },
    select: { attempts: true, maxAttempts: true },
  })
  const canRetry = (opts.retryable ?? true) && !!job && job.attempts < job.maxAttempts
  const status: TurnitinJobStatus = canRetry ? "QUEUED" : "FAILED"

  await prisma.turnitinJob.update({
    where: { id: jobId },
    data: {
      status,
      errorCode,
      lastError: message.slice(0, 1000),
      lockedAt: null,
      finishedAt: canRetry ? null : new Date(),
    },
  })
  return status
}

export async function getLatestJob(submissionId: string): Promise<TurnitinJob | null> {
  return prisma.turnitinJob.findFirst({
    where: { submissionId },
    orderBy: { createdAt: "desc" },
  })
}
