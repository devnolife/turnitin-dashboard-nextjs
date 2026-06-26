import { prisma } from "@/lib/prisma"
import { resolveStoredFilePath } from "@/lib/upload"
import { logger } from "@/lib/logger"
import type { TurnitinJob } from "@prisma/client"
import { loadTurnitinConfig, type TurnitinConfig } from "./config"
import { openSession, ensureLoggedIn, TurnitinSessionError } from "./session"
import { submitDocument, TurnitinSubmitError } from "./quick-submit"
import { waitForReport, inboxHasSubmission, TurnitinReportError } from "./report"
import { downloadSimilarityReport } from "./download-report"
import { applyTurnitinResult } from "./apply-result"
import { markSucceeded, markFailed, markWaitingReport } from "./queue"

export interface ProcessResult {
  ok: boolean
  status: string
  detail?: string
}

function splitName(name: string): { first: string; last: string } {
  const parts = (name || "Mahasiswa").trim().split(/\s+/)
  const first = parts[0] || "Mahasiswa"
  const last = parts.length > 1 ? parts.slice(1).join(" ") : first
  return { first, last }
}

function classifyError(e: unknown): { code: string; message: string } {
  if (
    e instanceof TurnitinSessionError ||
    e instanceof TurnitinSubmitError ||
    e instanceof TurnitinReportError
  ) {
    return { code: e.code, message: e.message }
  }
  return { code: "UNKNOWN", message: e instanceof Error ? e.message : String(e) }
}

async function recordSubmissionError(submissionId: string, message: string): Promise<void> {
  await prisma.submission
    .update({ where: { id: submissionId }, data: { autoCheckError: message.slice(0, 500) } })
    .catch(() => {})
}

/**
 * Proses satu job dari awal sampai akhir: login → Quick Submit → tunggu report →
 * simpan hasil. Submission TIDAK diubah ke FAILED — tetap PROCESSING (dengan
 * autoCheckError terisi) agar instruktur bisa menjalankan ulang lewat "Cek Ulang".
 *
 * Kebijakan retry: HANYA kegagalan SEBELUM submit (sesi/transient) yang boleh
 * di-retry. Setelah submit dipanggil, kegagalan tidak di-retry untuk menghindari
 * pengiriman dokumen ganda ke Turnitin.
 */
export async function processJob(
  job: TurnitinJob,
  cfg: TurnitinConfig = loadTurnitinConfig(),
): Promise<ProcessResult> {
  const submission = await prisma.submission.findUnique({
    where: { id: job.submissionId },
    include: { user: { select: { name: true } } },
  })
  if (!submission) {
    await markFailed(job.id, "NO_SUBMISSION", "Submission tidak ditemukan", { retryable: false })
    return { ok: false, status: "FAILED", detail: "no submission" }
  }

  const filePath = submission.documentUrl ? resolveStoredFilePath(submission.documentUrl) : null
  if (!filePath) {
    await markFailed(job.id, "NO_FILE", "File mahasiswa hilang dari storage", { retryable: false })
    await recordSubmissionError(submission.id, "File mahasiswa hilang dari storage")
    return { ok: false, status: "FAILED", detail: "file missing" }
  }

  const { first, last } = splitName(submission.user.name)
  // Token unik diselipkan ke judul agar baris inbox bisa dicocokkan saat baca skor,
  // sekaligus jadi kunci idempotensi (mendeteksi dokumen yang sudah pernah disubmit).
  const token = `#${submission.id.slice(-6)}`
  const uniqueTitle = `${submission.documentTitle} ${token}`.slice(0, 195)
  const session = await openSession(cfg)
  let submitted = false

  try {
    await ensureLoggedIn(session, cfg)

    // Idempotensi: bila baris dengan token ini SUDAH ada di inbox Turnitin (mis.
    // attempt sebelumnya berhasil submit lalu worker mati / lock-nya basi),
    // JANGAN submit ulang—cukup lanjut menunggu report. Cegah dokumen ganda.
    // Cek ini berjalan SEBELUM `submitted=true`, jadi kalau cek-nya gagal (transient)
    // job aman di-retry dan tidak pernah keliru submit dua kali.
    const existing = await inboxHasSubmission(session.page, cfg, token)

    submitted = true // mulai dari sini, hindari retry otomatis (cegah submit ganda)
    let paperId: string | null = null
    if (existing.found) {
      // Ambil paper id dari baris inbox supaya report tetap bisa diunduh saat resume.
      paperId = existing.paperId
      logger.info("turnitin.resume_existing_submission", {
        jobId: job.id,
        submissionId: submission.id,
        token,
        paperId,
      })
    } else {
      const res = await submitDocument(session.page, cfg, {
        filePath,
        title: uniqueTitle,
        firstName: first,
        lastName: last,
      })
      paperId = res.paperId
    }
    await markWaitingReport(job.id, paperId)

    const report = await waitForReport(session.page, cfg, token, paperId)

    // Best-effort: unduh PDF Similarity Report + baca Integrity Flags dari Feedback
    // Studio. Hanya jalan di mode HEADED (FS render kosong di headless) & bila paper
    // id diketahui. Gagal = null, skor tetap disimpan.
    let reportPdf = report.reportPdf
    let integrityFlags: number | null = null
    if (cfg.downloadReport && !cfg.headless && paperId) {
      const cap = await downloadSimilarityReport(session.page, session.context, cfg, paperId).catch(
        () => ({ reportPdf: null, integrityFlags: null }),
      )
      reportPdf = cap.reportPdf ?? report.reportPdf
      integrityFlags = cap.integrityFlags
      logger.info("turnitin.report_capture", {
        jobId: job.id,
        submissionId: submission.id,
        reportCaptured: !!reportPdf,
        integrityFlags,
      })
    }

    const { status } = await applyTurnitinResult({
      submissionId: submission.id,
      similarity: report.similarity,
      reportPdf,
      integrityFlags,
    })

    await markSucceeded(job.id, paperId)
    logger.info("turnitin.job_succeeded", {
      jobId: job.id,
      submissionId: submission.id,
      similarity: report.similarity,
      status,
    })
    return { ok: true, status: "SUCCEEDED" }
  } catch (e) {
    const { code, message } = classifyError(e)
    const transient = code === "SESSION" || code === "UNKNOWN"
    const retryable = !submitted && transient
    const finalStatus = await markFailed(job.id, code, message, { retryable })
    await recordSubmissionError(submission.id, `[${code}] ${message}`)
    logger.warn("turnitin.job_failed", {
      jobId: job.id,
      submissionId: submission.id,
      code,
      finalStatus,
      submitted,
      message,
    })
    return { ok: false, status: finalStatus, detail: message }
  } finally {
    await session.close()
  }
}
