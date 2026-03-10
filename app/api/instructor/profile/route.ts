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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        hp: true,
        role: true,
        whatsappNumber: true,
        createdAt: true,
      },
    })

    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ message: "Gagal mengambil profil" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { name, email, hp, whatsappNumber } = body

    const updateData: Record<string, string> = {}
    if (name && name.trim()) updateData.name = name.trim()
    if (email !== undefined) updateData.email = email?.trim() || ""
    if (hp !== undefined) updateData.hp = hp?.trim() || ""
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber?.trim() || ""

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        hp: true,
        role: true,
        whatsappNumber: true,
      },
    })

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: updated,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "Gagal memperbarui profil" }, { status: 500 })
  }
}
