import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const sp = request.nextUrl.searchParams
    const action = sp.get("action") || undefined
    const actorId = sp.get("actorId") || undefined
    const targetType = sp.get("targetType") || undefined
    const targetId = sp.get("targetId") || undefined
    const page = Math.max(1, parseInt(sp.get("page") || "1"))
    const limit = Math.min(200, Math.max(1, parseInt(sp.get("limit") || "50")))

    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (actorId) where.actorId = actorId
    if (targetType) where.targetType = targetType
    if (targetId) where.targetId = targetId

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.audit.list_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal memuat audit log" }, { status: 500 })
  }
}
