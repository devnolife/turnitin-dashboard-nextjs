import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "perpusmu-secret-key-2024"
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }

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
