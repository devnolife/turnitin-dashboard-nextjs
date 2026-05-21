import { prisma } from "@/lib/prisma"

export type RekapItem = {
  id: string
  no: number
  nama: string
  nim: string
  judulSkripsi: string
  jurusan: string
  examType: "PROPOSAL_DEFENSE" | "RESULTS_DEFENSE" | "FINAL_DEFENSE" | null
  tahapLabel: string
  similarityScore: number | null
  status: string
  biaya: number
  instruktur: string
  tanggalPembayaran: string | null
  namaBank: string
  degree: "S1" | "S2" | "S3"
}

export type InstructorRekap = {
  instruktur: string
  totalS1: number
  totalS2: number
  totalS3: number
  jumlah: number
  total: number
}

export type RekapBundle = {
  periode: { month: number; year: number; label: string }
  items: RekapItem[]
  rekap: InstructorRekap[]
  totals: { biaya: number; count: number }
}

const STUDENT_RATE: Record<"S1" | "S2" | "S3", number> = {
  S1: 100000,
  S2: 150000,
  S3: 200000,
}

const INSTRUCTOR_RATE: Record<"S1" | "S2" | "S3", number> = {
  S1: 50000,
  S2: 75000,
  S3: 100000,
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

function normalizeDegree(raw?: string | null): "S1" | "S2" | "S3" {
  const d = (raw || "").toUpperCase()
  if (d.includes("S3") || d.includes("DOKTOR")) return "S3"
  if (d.includes("S2") || d.includes("MAGISTER")) return "S2"
  return "S1"
}

function tahapLabel(examType: string | null): string {
  switch (examType) {
    case "PROPOSAL_DEFENSE": return "Proposal"
    case "RESULTS_DEFENSE": return "Hasil"
    case "FINAL_DEFENSE": return "Tutup"
    default: return "-"
  }
}

export type RekapFilter = {
  month: number
  year: number
  studyProgramId?: string | null
  instructorId?: string | null
}

export async function buildRekap(filter: RekapFilter): Promise<RekapBundle> {
  const { month, year } = filter
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))

  const submissions = await prisma.submission.findMany({
    where: {
      reviewedAt: { gte: start, lt: end },
      status: { in: ["REVIEWED", "FLAGGED"] },
      ...(filter.studyProgramId ? { user: { studyProgramId: filter.studyProgramId } } : {}),
      ...(filter.instructorId ? { reviewedBy: filter.instructorId } : {}),
    },
    include: {
      user: {
        include: {
          studyProgram: true,
          examDetails: true,
          payments: { orderBy: { paidAt: "desc" } },
        },
      },
      reviewer: true,
    },
    orderBy: [{ reviewedAt: "asc" }],
  })

  const items: RekapItem[] = submissions.map((s, idx) => {
    const u = s.user
    const degree = normalizeDegree(u.studyProgram?.degree)
    const successfulPayment = u.payments.find((p) => p.status === "COMPLETED") || u.payments[0]
    return {
      id: s.id,
      no: idx + 1,
      nama: u.name,
      nim: u.nim || "-",
      judulSkripsi: u.examDetails?.thesisTitle || s.documentTitle || "-",
      jurusan: u.studyProgram?.name || u.prodi || "-",
      examType: s.examType,
      tahapLabel: tahapLabel(s.examType),
      similarityScore: s.similarityScore,
      status: s.status,
      biaya: successfulPayment?.amount ?? STUDENT_RATE[degree],
      instruktur: s.reviewer?.name || "-",
      tanggalPembayaran: successfulPayment?.paidAt
        ? successfulPayment.paidAt.toISOString()
        : null,
      namaBank: successfulPayment?.paymentMethod || "-",
      degree,
    }
  })

  const byInstructor = new Map<string, InstructorRekap>()
  for (const it of items) {
    const key = it.instruktur
    if (!byInstructor.has(key)) {
      byInstructor.set(key, {
        instruktur: key,
        totalS1: 0,
        totalS2: 0,
        totalS3: 0,
        jumlah: 0,
        total: 0,
      })
    }
    const row = byInstructor.get(key)!
    if (it.degree === "S1") row.totalS1 += 1
    else if (it.degree === "S2") row.totalS2 += 1
    else row.totalS3 += 1
    row.jumlah += 1
    row.total += INSTRUCTOR_RATE[it.degree]
  }

  const rekap = Array.from(byInstructor.values()).sort((a, b) =>
    a.instruktur.localeCompare(b.instruktur),
  )

  const totals = items.reduce(
    (acc, it) => ({ biaya: acc.biaya + it.biaya, count: acc.count + 1 }),
    { biaya: 0, count: 0 },
  )

  return {
    periode: { month, year, label: `${MONTH_NAMES[month - 1]} ${year}` },
    items,
    rekap,
    totals,
  }
}
