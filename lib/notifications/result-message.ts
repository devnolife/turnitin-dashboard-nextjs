/**
 * Penyusun teks pesan WhatsApp untuk notifikasi hasil cek plagiarisme.
 * Termasuk nominal yang dibayar mahasiswa.
 */

export interface ResultMessageInput {
  studentName: string
  /** Judul dokumen / bab. */
  documentTitle: string
  /** Label bab bila prodi PER_CHAPTER (mis. "Bab 1"). */
  chapter?: string | null
  similarity: number
  status: "REVIEWED" | "FLAGGED"
  /** Nominal yang dibayar (Rupiah). null bila tak diketahui. */
  amountPaid?: number | null
  /** Batas similarity (%), untuk konteks pada status FLAGGED. */
  threshold?: number | null
  /** URL untuk melihat hasil/report (opsional). */
  resultUrl?: string | null
}

function rupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID")
}

export function buildResultMessage(input: ResultMessageInput): string {
  const lolos = input.status === "REVIEWED"
  const judul = input.chapter
    ? `${input.chapter} — ${input.documentTitle}`
    : input.documentTitle

  const lines: string[] = []
  lines.push(`Halo ${input.studentName} 👋`)
  lines.push("")
  lines.push(
    lolos
      ? "✅ Hasil cek plagiarisme dokumen Anda sudah *SELESAI*."
      : "⚠️ Hasil cek plagiarisme dokumen Anda sudah keluar dan *PERLU REVISI*.",
  )
  lines.push("")
  lines.push(`📄 Dokumen: *${judul}*`)
  lines.push(`📊 Similarity: *${input.similarity}%*`)
  lines.push(
    lolos
      ? "🎯 Status: *Lolos / Memenuhi batas*"
      : `🎯 Status: *Melebihi batas${input.threshold != null ? ` (maks ${input.threshold}%)` : ""}*`,
  )

  if (input.amountPaid != null && input.amountPaid > 0) {
    lines.push(`💳 Biaya layanan: *${rupiah(input.amountPaid)}* (sudah lunas)`)
  }

  if (!lolos) {
    lines.push("")
    lines.push("Silakan perbaiki dokumen lalu kirim ulang (resubmit) melalui dashboard.")
  }

  if (input.resultUrl) {
    lines.push("")
    lines.push(`🔗 Lihat detail: ${input.resultUrl}`)
  }

  lines.push("")
  lines.push("— Perpusmu, Universitas Muhammadiyah Makassar")

  return lines.join("\n")
}
