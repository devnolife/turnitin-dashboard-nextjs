import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR", "ADMIN")

    // INSTRUCTOR hanya melihat submission mahasiswa asuhannya.
    // ADMIN melihat semua.
    const where =
      auth.role === "INSTRUCTOR"
        ? { user: { instructorId: auth.userId } }
        : {}

    const submissions = await prisma.submission.findMany({
      where,
      include: { user: { select: { id: true, username: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    return handleAuthError(error)
  }
}
