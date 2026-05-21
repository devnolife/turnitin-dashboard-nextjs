import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError, AuthError } from "@/lib/auth/verify-token"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    await prisma.user.update({
      where: { id: auth.userId },
      data: { tourCompletedAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    return NextResponse.json({ message: "Gagal menyimpan" }, { status: 500 })
  }
}
