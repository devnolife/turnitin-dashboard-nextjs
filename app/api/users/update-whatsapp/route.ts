import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError } from "@/lib/auth/verify-token"
import { z } from "zod"

const whatsappSchema = z.object({
  whatsappNumber: z.string()
    .regex(/^(\+62|62|0)[8][0-9]{7,11}$/, "Format nomor WhatsApp tidak valid (contoh: 08xxxxxxxxxx)")
})

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    const body = await request.json()

    const parsed = whatsappSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { whatsappNumber } = parsed.data

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
