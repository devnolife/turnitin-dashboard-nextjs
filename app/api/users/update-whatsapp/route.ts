import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    const { whatsappNumber } = await request.json()

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { whatsappNumber },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        hasCompletedPayment: true,
        whatsappNumber: true,
      },
    })

    return NextResponse.json({ success: true, message: "Nomor WhatsApp berhasil diperbarui", user })
  } catch (error) {
    return handleAuthError(error)
  }
}
