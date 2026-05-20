import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const { id } = await params

    await prisma.similarityRule.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Aturan berhasil dihapus" })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Delete similarity rule error:", error)
    return NextResponse.json(
      { message: "Gagal menghapus aturan" },
      { status: 500 }
    )
  }
}
