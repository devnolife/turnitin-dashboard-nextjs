import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"
import { makeWaToken } from "@/lib/notifications/wa-verify"
import { buildWaMeUrl } from "@/lib/phone"

/**
 * Kode + link wa.me untuk verifikasi WhatsApp via "chat duluan".
 * Mahasiswa membuka link → kirim pesan berisi kode ke nomor resmi → webhook
 * menyimpan nomornya. UI mem-polling status (whatsappNumber terisi = verified).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "STUDENT")

    const official =
      process.env.WA_OFFICIAL_NUMBER || process.env.NEXT_PUBLIC_WA_OFFICIAL_NUMBER || null

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { whatsappNumber: true },
    })

    const token = makeWaToken(auth.userId)
    const message = `Halo Perpusmu, verifikasi WhatsApp saya. Kode: ${token}`
    const waUrl = official ? buildWaMeUrl(official, message) : null

    return NextResponse.json({
      configured: !!official,
      token,
      message,
      waUrl,
      officialNumber: official,
      verified: !!user?.whatsappNumber,
      whatsappNumber: user?.whatsappNumber ?? null,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
