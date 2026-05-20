import { NextRequest, NextResponse } from "next/server"
import { verifyJwtEdge, SESSION_COOKIE } from "@/lib/auth/verify-token"

const PUBLIC_ROUTES = new Set<string>([
  "/",
  "/auth/login",
  "/api/auth/login",
  "/payment",
  "/privacy",
  "/terms",
  "/whatsapp-verification",
])

const PUBLIC_PREFIXES = ["/_next", "/favicon", "/public"]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  return false
}

function extractToken(request: NextRequest): string | null {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value
  if (cookie) return cookie
  const header = request.headers.get("authorization")
  if (header?.startsWith("Bearer ")) return header.split(" ")[1] ?? null
  return null
}

function unauthorizedApi(message: string, status: number) {
  return NextResponse.json({ message }, { status })
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = "/auth/login"
  url.search = ""
  return NextResponse.redirect(url)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const token = extractToken(request)
  const isApi = pathname.startsWith("/api/")

  if (!token) {
    return isApi
      ? unauthorizedApi("Token tidak ditemukan", 401)
      : redirectToLogin(request)
  }

  // NOTE: hanya verifikasi JWT signature di edge. Validasi Session DB dilakukan
  // di route handler (Node runtime) via verifyAuth().
  const payload = await verifyJwtEdge(token)
  if (!payload) {
    return isApi
      ? unauthorizedApi("Token tidak valid", 401)
      : redirectToLogin(request)
  }

  const role = payload.role

  if (isApi) {
    if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
      return unauthorizedApi("Akses ditolak", 403)
    }
    if (pathname.startsWith("/api/instructor") && role !== "INSTRUCTOR") {
      return unauthorizedApi("Akses ditolak", 403)
    }
    if (pathname.startsWith("/api/student") && role !== "STUDENT") {
      return unauthorizedApi("Akses ditolak", 403)
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", payload.userId)
    requestHeaders.set("x-user-role", payload.role)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Halaman dashboard: cegah cross-role akses
  const roleLower = role.toLowerCase()
  const sectionMatches: Array<[string, string]> = [
    ["/dashboard/admin", "ADMIN"],
    ["/dashboard/instructor", "INSTRUCTOR"],
    ["/dashboard/student", "STUDENT"],
  ]
  for (const [prefix, requiredRole] of sectionMatches) {
    if (pathname.startsWith(prefix) && role !== requiredRole) {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${roleLower}`
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/exam-details/:path*",
  ],
}
