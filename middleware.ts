import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const PUBLIC_ROUTES = [
  "/auth/login",
  "/api/auth/login",
  "/payment",
  "/privacy",
  "/terms",
  "/whatsapp-verification",
]

const PUBLIC_PREFIXES = [
  "/_next",
  "/favicon",
  "/public",
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.some((route) => pathname === route)) return true
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  if (pathname === "/") return true
  return false
}

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  const secret = getJwtSecret()
  if (!secret) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.userId as string,
      role: payload.role as string,
    }
  } catch {
    return null
  }
}

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1]
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const token = extractToken(request)

  // API routes: return 401 if no valid token
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json({ message: "Token tidak ditemukan" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: "Token tidak valid" }, { status: 401 })
    }

    // Role-based API access
    if (pathname.startsWith("/api/admin") && payload.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }
    if (pathname.startsWith("/api/instructor") && payload.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }
    if (pathname.startsWith("/api/student") && payload.role !== "STUDENT") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", payload.userId)
    requestHeaders.set("x-user-role", payload.role)

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
}
