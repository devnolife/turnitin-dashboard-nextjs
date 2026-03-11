import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

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
      reviewedCount: reviewedMap.get(inst.id) || 0,
      pendingCount: pendingMap.get(inst.id) || 0,
    }))

    return NextResponse.json({ instructors: formatted })
  } catch (error) {
    console.error("Admin instructors error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data instruktur" },
      { status: 500 }
    )
  }
}
