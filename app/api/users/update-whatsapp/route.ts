import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const { userId, whatsappNumber } = await request.json()

  if (!userId) {
    return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
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
}
