import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getClientIp } from "@/lib/rate-limit"

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.password_changed"
  | "admin.password_reset"
  | "admin.user_updated"
  | "admin.user_deleted"
  | "admin.complaint_responded"
  | "admin.pricing_changed"
  | "admin.rule_changed"
  | "admin.rekap_archived"
  | "admin.user_status_changed"

interface AuditOptions {
  request?: Request
  actorId?: string | null
  actorRole?: string | null
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}

/**
 * Tulis baris audit log. Fire-and-forget; tidak melempar agar permintaan utama
 * tetap berjalan jika DB audit gagal. Selalu redact field sensitif sebelum
 * memasukkan ke `metadata`.
 */
export async function audit(action: AuditAction, opts: AuditOptions = {}): Promise<void> {
  try {
    const ip = opts.request ? getClientIp(opts.request) : null
    const userAgent = opts.request?.headers.get("user-agent") ?? null
    await prisma.auditLog.create({
      data: {
        action,
        actorId: opts.actorId ?? null,
        actorRole: opts.actorRole ?? null,
        targetType: opts.targetType ?? null,
        targetId: opts.targetId ?? null,
        ip,
        userAgent,
        metadata: opts.metadata ? (opts.metadata as object) : undefined,
      },
    })
  } catch (e) {
    logger.warn("audit_failed", { action, error: String(e) })
  }
}
