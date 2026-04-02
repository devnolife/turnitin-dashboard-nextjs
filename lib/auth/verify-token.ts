import { jwtVerify, SignJWT } from "jose"
import { NextRequest, NextResponse } from "next/server"

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN"

export interface AuthPayload {
  userId: string
  role: Role
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

export async function createToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getJwtSecret())
}

export async function verifyAuth(request: NextRequest): Promise<AuthPayload> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError("Token tidak ditemukan", 401)
  }

  const token = authHeader.split(" ")[1]

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return {
      userId: payload.userId as string,
      role: payload.role as Role,
    }
  } catch {
    throw new AuthError("Token tidak valid atau sudah kadaluarsa", 401)
  }
}

export function requireRole(auth: AuthPayload, ...allowedRoles: Role[]): void {
  if (!allowedRoles.includes(auth.role)) {
    throw new AuthError("Anda tidak memiliki akses ke resource ini", 403)
  }
}

export class AuthError extends Error {
  status: number

  constructor(message: string, status: number = 401) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ message: error.message }, { status: error.status })
  }
  console.error("Unexpected error:", error)
  return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
}
