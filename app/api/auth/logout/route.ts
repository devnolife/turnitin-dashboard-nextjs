import { NextRequest, NextResponse } from "next/server"
import { verifyAuth, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    // Log logout event for audit trail
    logger.info(`User ${auth.userId} (role: ${auth.role}) logged out`)

    return NextResponse.json({
      message: "Berhasil logout",
      success: true,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    return NextResponse.json({ message: "Logout berhasil" }, { status: 200 })
  }
}
