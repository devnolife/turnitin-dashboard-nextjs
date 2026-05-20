import { NextRequest, NextResponse } from "next/server"
import { verifyAuth, createToken, handleAuthError, AuthError } from "@/lib/auth/verify-token"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    const newToken = await createToken(auth.userId, auth.role)

    return NextResponse.json({
      token: newToken,
      success: true,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    return NextResponse.json({ message: "Token refresh gagal" }, { status: 401 })
  }
}
