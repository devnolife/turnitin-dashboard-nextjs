import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  fetchMahasiswaByNim,
  fetchMahasiswaPembayaranAll,
  parseDegree,
  type MahasiswaPembayaran,
} from "@/lib/auth/graphql-client"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

// Token status yang dianggap LUNAS dari SIMAK (nilainya tidak konsisten antar prodi).
const PAID_TOKENS = new Set([
  "1", "LUNAS", "COMPLETED", "PAID", "SUCCESS", "SUKSES",
  "BERHASIL", "SELESAI", "SUDAH BAYAR", "SUDAH DIBAYAR", "YA", "Y", "TRUE",
])

/** Normalisasi label: uppercase + rapatkan spasi ganda (SIMAK kadang dobel spasi). */
function normLabel(s: string | null | undefined): string {
  return (s ?? "").toUpperCase().replace(/\s+/g, " ").trim()
}

function isPaidStatus(s: string | null | undefined): boolean {
  return PAID_TOKENS.has(normLabel(s))
}

/** Dari beberapa kandidat, pilih yang lunas dulu lalu periode terbaru. */
function pickBest(list: MahasiswaPembayaran[]): MahasiswaPembayaran | null {
  if (list.length === 0) return null
  return [...list].sort((a, b) => {
    const pa = isPaidStatus(a.statusPembayaran) ? 1 : 0
    const pb = isPaidStatus(b.statusPembayaran) ? 1 : 0
    if (pa !== pb) return pb - pa
    return (b.periode ?? "").localeCompare(a.periode ?? "")
  })[0]
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { nim: true, name: true, prodi: true },
    })

    if (!user || !user.nim) {
      return NextResponse.json(
        { message: "NIM mahasiswa tidak ditemukan" },
        { status: 404 }
      )
    }

    // Jika prodi belum tersimpan di DB, ambil dari GraphQL dan simpan
    let prodi = user.prodi
    if (!prodi) {
      const mahasiswa = await fetchMahasiswaByNim(user.nim)
      if (mahasiswa?.prodi) {
        prodi = mahasiswa.prodi
        await prisma.user.update({
          where: { id: auth.userId },
          data: { prodi },
        })
      }
    }

    const degree = prodi ? parseDegree(prodi) : "S1"

    // Ambil SEMUA tagihan lalu cocokkan label Turnitin secara fleksibel.
    // SIMAK kadang menyimpan label dengan spasi ganda / kapitalisasi beda
    // (mis. "TURNITIN DIPLOMA  S1"), sehingga query exact-match per-jenis sering
    // meleset walau mahasiswa SUDAH bayar. Pencocokan dinormalisasi (uppercase +
    // rapatkan spasi) menghilangkan masalah itu.
    const all = await fetchMahasiswaPembayaranAll(user.nim).catch(() => [] as MahasiswaPembayaran[])

    const wantedTurnitin = normLabel(`TURNITIN DIPLOMA ${degree}`)
    const turnitinAll = all.filter((p) => normLabel(p.jenisPembayaran).includes("TURNITIN"))

    const pembayaran =
      pickBest(turnitinAll.filter((p) => normLabel(p.jenisPembayaran) === wantedTurnitin)) ??
      pickBest(turnitinAll) ??
      pickBest(all.filter((p) => normLabel(p.jenisPembayaran).includes("PERPUSTAKAAN"))) ??
      null
    const jenisDicek = `TURNITIN DIPLOMA ${degree}`

    if (!pembayaran) {
      logger.info("payment.no_match", {
        userId: auth.userId,
        nim: user.nim,
        degree,
        availableJenis: all.map((p) => p.jenisPembayaran),
      })
      return NextResponse.json({
        payment: {
          id: null,
          userId: auth.userId,
          nim: user.nim,
          nama: user.name,
          periode: null,
          jenisPembayaran: jenisDicek,
          jumlahPembayaran: 0,
          waktuPembayaran: null,
          status: "pending",
          statusPembayaran: null,
        },
      })
    }

    const isCompleted = isPaidStatus(pembayaran.statusPembayaran)
    const paymentStatus = isCompleted ? "COMPLETED" : "PENDING"
    logger.info("payment.matched", {
      userId: auth.userId,
      nim: user.nim,
      degree,
      jenis: pembayaran.jenisPembayaran,
      statusRaw: pembayaran.statusPembayaran,
      isCompleted,
    })

    // Simpan/update Payment record di DB agar admin bisa melihat semua pengajuan
    const existingPayment = await prisma.payment.findFirst({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    })

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount: pembayaran.jumlahPembayaran,
          status: paymentStatus,
          jenisPembayaran: pembayaran.jenisPembayaran,
          periode: pembayaran.periode,
          paidAt: isCompleted && pembayaran.waktuPembayaran
            ? new Date(pembayaran.waktuPembayaran)
            : undefined,
        },
      })
    } else {
      await prisma.payment.create({
        data: {
          userId: auth.userId,
          amount: pembayaran.jumlahPembayaran,
          status: paymentStatus,
          jenisPembayaran: pembayaran.jenisPembayaran,
          periode: pembayaran.periode,
          paidAt: isCompleted && pembayaran.waktuPembayaran
            ? new Date(pembayaran.waktuPembayaran)
            : null,
        },
      })
    }

    if (isCompleted) {
      await prisma.user.update({
        where: { id: auth.userId },
        data: { hasCompletedPayment: true },
      })
    }

    return NextResponse.json({
      payment: {
        id: pembayaran.nim,
        userId: auth.userId,
        nim: pembayaran.nim,
        nama: pembayaran.nama,
        periode: pembayaran.periode,
        jenisPembayaran: pembayaran.jenisPembayaran,
        jumlahPembayaran: pembayaran.jumlahPembayaran,
        waktuPembayaran: pembayaran.waktuPembayaran,
        status: isCompleted ? "completed" : "pending",
        statusPembayaran: pembayaran.statusPembayaran,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
