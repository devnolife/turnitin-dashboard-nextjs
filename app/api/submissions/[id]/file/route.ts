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
      include: {
        user: { select: { id: true, instructorId: true, name: true } },
      },
    })
    if (!submission || !submission.documentUrl || !submission.fileName) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 })
    }

    // Auth: pemilik, instruktur ter-assign, atau admin
    const isOwner = submission.userId === auth.userId
    const isAssignedInstructor =
      auth.role === "INSTRUCTOR" && submission.user.instructorId === auth.userId
    const isAdmin = auth.role === "ADMIN"

    if (!isOwner && !isAssignedInstructor && !isAdmin) {
      throw new AuthError("Forbidden", 403)
    }

    const file = await readStoredFile(submission.documentUrl)
    if (!file) {
      return NextResponse.json({ error: "File hilang dari storage" }, { status: 410 })
    }

    return new NextResponse(file.data as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": submission.fileMimeType || "application/octet-stream",
        "Content-Length": String(file.size),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(submission.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
