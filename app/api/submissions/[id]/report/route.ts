import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { readStoredFile } from "@/lib/upload"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request)
    const { id } = await params

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { user: { select: { id: true, instructorId: true } } },
    })
    if (!submission || !submission.reportUrl || !submission.reportFileName) {
      return NextResponse.json({ error: "Report belum tersedia" }, { status: 404 })
    }

    const isOwner = submission.userId === auth.userId
    const isAssignedInstructor =
      auth.role === "INSTRUCTOR" && submission.user.instructorId === auth.userId
    const isAdmin = auth.role === "ADMIN"
    if (!isOwner && !isAssignedInstructor && !isAdmin) {
      throw new AuthError("Forbidden", 403)
    }

    const file = await readStoredFile(submission.reportUrl)
    if (!file) {
      return NextResponse.json({ error: "Report hilang dari storage" }, { status: 410 })
    }

    // ?inline=1 → tampil di browser (PDF dalam <iframe>); default = download.
    const inline = new URL(request.url).searchParams.get("inline") === "1"
    const disposition = inline ? "inline" : "attachment"

    return new NextResponse(file.data as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": submission.reportMimeType || "application/pdf",
        "Content-Length": String(file.size),
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(submission.reportFileName)}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
