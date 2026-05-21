import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const { id } = await params
    await prisma.rekapArchive.delete({ where: { id } })
    return NextResponse.json({ message: "Arsip dihapus" })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.rekap.archives.delete_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal menghapus arsip" }, { status: 500 })
  }
}
