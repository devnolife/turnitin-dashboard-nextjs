import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const { id } = await params
    const archive = await prisma.rekapArchive.findUnique({
      where: { id },
      select: { fileName: true, fileData: true },
    })
    if (!archive) {
      return NextResponse.json({ message: "Arsip tidak ditemukan" }, { status: 404 })
    }
    return new NextResponse(new Uint8Array(archive.fileData), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${archive.fileName}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.rekap.archives.download_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal mengunduh arsip" }, { status: 500 })
  }
}
