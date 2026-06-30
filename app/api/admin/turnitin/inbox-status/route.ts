import { NextRequest, NextResponse } from "next/server"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { readInboxStatus } from "@/lib/turnitin/inbox-status"
import { logger } from "@/lib/logger"

/**
 * Status kapasitas inbox Turnitin (akun limit ~25 paper). Dibaca dari snapshot
 * yang ditulis worker (uploads/.turnitin/inbox-status.json). Dipakai dashboard
 * admin untuk menampilkan peringatan saat inbox hampir/penuh.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const status = await readInboxStatus()
    if (!status) {
      return NextResponse.json({
        available: false,
        message:
          "Status inbox Turnitin belum tersedia. Pastikan worker berjalan; status akan terisi setelah pengecekan pertama.",
      })
    }

    const remaining = status.count >= 0 ? Math.max(0, status.capacity - status.count) : null
    return NextResponse.json({ available: true, ...status, remaining })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.turnitin.inbox_status_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat status inbox Turnitin" }, { status: 500 })
  }
}
