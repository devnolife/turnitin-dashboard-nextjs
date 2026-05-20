import { NextRequest, NextResponse } from "next/server"
import {
  verifyAuth,
  createSession,
  revokeSession,
  setSessionCookie,
  handleAuthError,
  AuthError,
} from "@/lib/auth/verify-token"
import { getClientIp } from "@/lib/rate-limit"

/**
 * Refresh dengan rotasi: revoke session lama, buat baru.
 * Token lama langsung tidak valid setelah refresh berhasil.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    await revokeSession(auth.jti)
    const { token, expiresAt } = await createSession(auth.userId, auth.role, {
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    })

    const res = NextResponse.json({ token, success: true })
    setSessionCookie(res, token, expiresAt)
    return res
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    return NextResponse.json({ message: "Token refresh gagal" }, { status: 401 })
  }
}
