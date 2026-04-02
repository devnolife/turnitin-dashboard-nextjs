import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fetchMahasiswaPembayaran } from "@/lib/auth/graphql-client"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { nim: true, name: true },
    })

    if (!user || !user.nim) {
      return NextResponse.json(
        { message: "NIM mahasiswa tidak ditemukan" },
        { status: 404 }
      )
    }

    const pembayaran = await fetchMahasiswaPembayaran(user.nim, "PERPUSTAKAAN")

    if (!pembayaran) {
      return NextResponse.json({
        payment: {
          id: null,
          userId: auth.userId,
          nim: user.nim,
          nama: user.name,
          periode: null,
          jenisPembayaran: "PERPUSTAKAAN",
          jumlahPembayaran: 0,
          waktuPembayaran: null,
          status: "pending",
          statusPembayaran: null,
        },
      })
    }

    const isCompleted = pembayaran.statusPembayaran?.toUpperCase() === "LUNAS"
      || pembayaran.statusPembayaran?.toUpperCase() === "COMPLETED"
      || pembayaran.statusPembayaran?.toUpperCase() === "PAID"

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
