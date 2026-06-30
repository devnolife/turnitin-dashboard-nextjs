import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getPricingMap, normalizeDegreeKey } from "@/lib/pricing"
import { sendWhatsappText } from "./whatsapp"
import { buildResultMessage } from "./result-message"

/**
 * Resolusi nominal yang dibayar mahasiswa untuk layanan Turnitin:
 * 1) Payment record terakhir berstatus COMPLETED (nilai asli dari SIMAK), bila ada.
 * 2) Fallback: tarif mahasiswa (studentRate) sesuai jenjang prodi.
 */
async function resolveAmountPaid(userId: string, prodi: string | null): Promise<number | null> {
  try {
    const pay = await prisma.payment.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      select: { amount: true },
    })
    if (pay?.amount && pay.amount > 0) return Math.round(pay.amount)
  } catch {
    // abaikan, lanjut ke fallback
  }
  try {
    const pricing = await getPricingMap()
    return pricing[normalizeDegreeKey(prodi)]?.studentRate ?? null
  } catch {
    return null
  }
}

/**
 * Kirim notifikasi WhatsApp hasil cek plagiarisme ke mahasiswa (best-effort).
 * Dipanggil setelah status submission final (REVIEWED/FLAGGED). Tidak pernah
 * melempar — kegagalan hanya dicatat di log agar tidak mengganggu pipeline.
 */
export async function notifyResultViaWhatsapp(params: {
  submissionId: string
  similarity: number
  status: "REVIEWED" | "FLAGGED"
  threshold?: number | null
}): Promise<void> {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: params.submissionId },
      select: {
        documentTitle: true,
        chapter: true,
        user: { select: { id: true, name: true, whatsappNumber: true, hp: true, prodi: true } },
      },
    })
    if (!submission) return
    const phone = submission.user.whatsappNumber || submission.user.hp || null
    if (!phone) {
      logger.info("wa.result.skip_no_phone", { submissionId: params.submissionId })
      return
    }

    const amountPaid = await resolveAmountPaid(submission.user.id, submission.user.prodi)
    const baseUrl = process.env.APP_PUBLIC_URL || ""
    const resultUrl = baseUrl ? `${baseUrl}/dashboard/student/submissions` : null

    const message = buildResultMessage({
      studentName: submission.user.name?.split(" ")[0] || submission.user.name || "Mahasiswa",
      documentTitle: submission.documentTitle,
      chapter: submission.chapter,
      similarity: params.similarity,
      status: params.status,
      amountPaid,
      threshold: params.threshold ?? null,
      resultUrl,
    })

    const res = await sendWhatsappText(phone, message)
    logger.info("wa.result.sent", {
      submissionId: params.submissionId,
      provider: res.provider,
      ok: res.ok,
      skipped: res.skipped,
      error: res.error,
    })
  } catch (e) {
    logger.warn("wa.result.failed", {
      submissionId: params.submissionId,
      error: e instanceof Error ? e.message : String(e),
    })
  }
}
