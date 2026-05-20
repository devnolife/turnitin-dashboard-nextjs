import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fetchMahasiswaPembayaran, fetchMahasiswaByNim } from "@/lib/auth/graphql-client"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"

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

    const isS2 = prodi
      ? /s2|magister|pascasarjana/i.test(prodi)
      : false
    const jenisPembayaranUtama = isS2 ? "TURNITIN DIPLOMA S2" : "TURNITIN DIPLOMA S1"

    // Cek pembayaran utama dulu, fallback ke PERPUSTAKAAN jika tidak ditemukan
    let pembayaran = await fetchMahasiswaPembayaran(user.nim, jenisPembayaranUtama)
    const jenisDicek = jenisPembayaranUtama

    if (!pembayaran) {
      pembayaran = await fetchMahasiswaPembayaran(user.nim, "PERPUSTAKAAN")
    }

    if (!pembayaran) {
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

    const statusUpper = pembayaran.statusPembayaran?.toUpperCase() ?? ""
    const isCompleted = statusUpper === "LUNAS"
      || statusUpper === "COMPLETED"
      || statusUpper === "PAID"
      || statusUpper === "1"

    const paymentStatus = isCompleted ? "COMPLETED" : "PENDING"

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
