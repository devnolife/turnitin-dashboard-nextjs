import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR", "ADMIN")
    const { id } = await params

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { user: { select: { instructorId: true } } },
    })
    if (!submission) {
      return NextResponse.json({ error: "Submission tidak ditemukan" }, { status: 404 })
    }
    if (auth.role === "INSTRUCTOR" && submission.user.instructorId !== auth.userId) {
      throw new AuthError("Bukan mahasiswa Anda", 403)
    }
    if (submission.status !== "PENDING") {
      return NextResponse.json(
        { error: `Submission sudah berstatus ${submission.status}` },
        { status: 409 },
      )
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: "PROCESSING",
        reviewedBy: auth.userId,
      },
    })

    return NextResponse.json({ submission: updated })
  } catch (error) {
    return handleAuthError(error)
  }
}
