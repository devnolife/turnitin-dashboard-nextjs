import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError } from "@/lib/auth/verify-token"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
  email: z.string().email("Format email tidak valid").or(z.literal("")).optional(),
  hp: z.string().max(20).optional(),
  whatsappNumber: z.string().max(20).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR")

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
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
    return handleAuthError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "INSTRUCTOR")

    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }

    const body = await request.json()

    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, hp, whatsappNumber } = parsed.data

    const updateData: Record<string, string> = {}
    if (name && name.trim()) updateData.name = name.trim()
    if (email !== undefined) updateData.email = email?.trim() || ""
    if (hp !== undefined) updateData.hp = hp?.trim() || ""
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber?.trim() || ""

    const updated = await prisma.user.update({
      where: { id: auth.userId },
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
    return handleAuthError(error)
  }
}
