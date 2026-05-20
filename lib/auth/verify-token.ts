import { jwtVerify, SignJWT } from "jose"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN"

export interface AuthPayload {
  userId: string
  role: Role
  jti: string
}

export const SESSION_COOKIE = "perpusmu_session"
const SESSION_TTL_DAYS = 7
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

/**
 * Buat JWT + Session DB row sekaligus. Token berisi `jti` yang harus cocok
 * dengan baris Session aktif (tidak revoked, belum expired).
 */
export async function createSession(
  userId: string,
  role: string,
  meta: { userAgent?: string | null; ip?: string | null } = {}
): Promise<{ token: string; expiresAt: Date; jti: string }> {
  const jti = randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await prisma.session.create({
    data: {
      jti,
      userId,
      expiresAt,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
    },
  })

  const token = await new SignJWT({ userId, role, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .setIssuedAt()
    .sign(getJwtSecret())

  return { token, expiresAt, jti }
}

/**
 * Edge-safe: verify JWT signature & expiration. TIDAK mengecek DB.
 * Dipakai di middleware (edge runtime, tanpa Prisma).
 */
export async function verifyJwtEdge(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (!payload.userId || !payload.role || !payload.jti) return null
    return {
      userId: payload.userId as string,
      role: payload.role as Role,
      jti: payload.jti as string,
    }
  } catch {
    return null
  }
}

/**
 * Node runtime: verify JWT + cek Session row di DB (revokedAt, expiresAt).
 * Dipakai di API routes untuk pertahanan berlapis.
 */
export async function verifyAuth(request: NextRequest): Promise<AuthPayload> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
    ?? extractBearerToken(request)

  if (!token) {
    throw new AuthError("Token tidak ditemukan", 401)
  }

  const payload = await verifyJwtEdge(token)
  if (!payload) {
    throw new AuthError("Token tidak valid atau sudah kadaluarsa", 401)
  }

  const session = await prisma.session.findUnique({
    where: { jti: payload.jti },
    select: { revokedAt: true, expiresAt: true, userId: true },
  })

  if (!session || session.userId !== payload.userId) {
    throw new AuthError("Sesi tidak ditemukan", 401)
  }
  if (session.revokedAt) {
    throw new AuthError("Sesi sudah dicabut", 401)
  }
  if (session.expiresAt.getTime() < Date.now()) {
    throw new AuthError("Sesi sudah kadaluarsa", 401)
  }

  return payload
}

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization")
  if (header?.startsWith("Bearer ")) {
    return header.split(" ")[1] ?? null
  }
  return null
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
  logger.error("Unexpected error:", error)
  return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
}

/**
 * Set cookie sesi pada response.
 */
export function setSessionCookie(res: NextResponse, token: string, expiresAt: Date): void {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export async function revokeSession(jti: string): Promise<void> {
  await prisma.session.updateMany({
    where: { jti, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

/**
 * Backward-compat: dipakai oleh kode lama (seed/test) yang hanya butuh token.
 * Hindari pemakaian baru — pakai `createSession`.
 */
export async function createToken(userId: string, role: string): Promise<string> {
  const { token } = await createSession(userId, role)
  return token
}
