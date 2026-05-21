import { NextRequest, NextResponse } from "next/server"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"
import { buildRekap } from "@/lib/rekap/build-rekap"
import { generateRekapWorkbook } from "@/lib/rekap/export-rekap"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const params = request.nextUrl.searchParams
    const now = new Date()
    const month = Math.max(1, Math.min(12, parseInt(params.get("month") || String(now.getMonth() + 1))))
    const year = Math.max(2000, Math.min(2100, parseInt(params.get("year") || String(now.getFullYear()))))
    const studyProgramId = params.get("studyProgramId")
    const instructorId = params.get("instructorId")

    const bundle = await buildRekap({
      month,
      year,
      studyProgramId: studyProgramId || null,
      instructorId: instructorId || null,
    })

    const buffer = await generateRekapWorkbook(bundle)
    const filename = `rekap-turnitin-${year}-${String(month).padStart(2, "0")}.xlsx`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("admin.rekap.export_failed", { error: String(error) })
    return NextResponse.json({ message: "Gagal mengekspor rekap" }, { status: 500 })
  }
}
