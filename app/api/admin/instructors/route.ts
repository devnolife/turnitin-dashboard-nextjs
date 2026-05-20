import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { logger } from "@/lib/logger"
import { z } from "zod"

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex")
}

const createInstructorSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  hp: z.string().optional().or(z.literal("")),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const body = await request.json()
    const parsed = createInstructorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { username, password, name, email, hp } = parsed.data

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json(
        { message: "Username sudah digunakan" },
        { status: 409 }
      )
    }

    const instructor = await prisma.user.create({
      data: {
        username,
        password: md5(password),
        name,
        email: email || null,
        hp: hp || null,
        whatsappNumber: hp || null,
        role: "INSTRUCTOR",
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        hp: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: "Instruktur berhasil ditambahkan",
      instructor,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Create instructor error:", error)
    return NextResponse.json(
      { message: "Gagal menambahkan instruktur" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")
    const searchParams = request.nextUrl.searchParams
    const rawSearch = searchParams.get("search")
    const search = rawSearch ? rawSearch.trim().slice(0, 200) : null

    const where: Record<string, unknown> = { role: "INSTRUCTOR" }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { prodi: { contains: search, mode: "insensitive" } },
      ]
    }

    const instructors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        hp: true,
        prodi: true,
        whatsappNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Count students per instructor
    const studentCounts = await prisma.user.groupBy({
      by: ["instructorId"],
      where: {
        role: "STUDENT",
        instructorId: { in: instructors.map((i) => i.id) },
      },
      _count: true,
    })

    // Count reviewed submissions per instructor
    const reviewedCounts = await prisma.submission.groupBy({
      by: ["reviewedBy"],
      where: {
        reviewedBy: { in: instructors.map((i) => i.id) },
        status: { in: ["REVIEWED", "FLAGGED"] },
      },
      _count: true,
    })

    const pendingCounts = await prisma.submission.groupBy({
      by: ["reviewedBy"],
      where: {
        reviewedBy: { in: instructors.map((i) => i.id) },
        status: "PENDING",
      },
      _count: true,
    })

    const studentMap = new Map(studentCounts.map((r) => [r.instructorId, r._count]))
    const reviewedMap = new Map(reviewedCounts.map((r) => [r.reviewedBy, r._count]))
    const pendingMap = new Map(pendingCounts.map((r) => [r.reviewedBy, r._count]))

    const formatted = instructors.map((inst) => ({
      id: inst.id,
      name: inst.name,
      username: inst.username,
      email: inst.email || "-",
      hp: inst.hp || inst.whatsappNumber || "-",
      prodi: inst.prodi || "-",
      createdAt: inst.createdAt,
      studentCount: studentMap.get(inst.id) || 0,
      reviewedCount: reviewedMap.get(inst.id) || 0,
      pendingCount: pendingMap.get(inst.id) || 0,
    }))

    return NextResponse.json({ instructors: formatted })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Admin instructors error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data instruktur" },
      { status: 500 }
    )
  }
}
