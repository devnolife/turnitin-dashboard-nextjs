import { NextRequest, NextResponse } from "next/server"
import {
  verifyAuth,
  handleAuthError,
  AuthError,
  revokeSession,
  clearSessionCookie,
} from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    await revokeSession(auth.jti)
    logger.info(`User ${auth.userId} (role: ${auth.role}) logged out`)

    const res = NextResponse.json({ message: "Berhasil logout", success: true })
    clearSessionCookie(res)
    return res
  } catch (error) {
    if (error instanceof AuthError) {
      // Cookie tetap dihapus walaupun token sudah invalid
      const res = handleAuthError(error)
      clearSessionCookie(res)
      return res
    }
    const res = NextResponse.json({ message: "Logout berhasil" }, { status: 200 })
    clearSessionCookie(res)
    return res
  }
}
