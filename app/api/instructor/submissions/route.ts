import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR")

    const submissions = await prisma.submission.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            nim: true,
            prodi: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Instructor submissions error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data pengiriman" },
      { status: 500 }
    )
  }
}
