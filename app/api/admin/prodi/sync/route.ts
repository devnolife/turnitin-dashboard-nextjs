import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, requireRole, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { fetchAllProdi, getFakultas, parseDegree } from "@/lib/auth/graphql-client"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    requireRole(auth, "ADMIN")

    const prodiList = await fetchAllProdi()

    if (prodiList.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data prodi dari server kampus" },
        { status: 404 }
      )
    }

    // Group prodi by kodeFakultas
    const fakultasMap = new Map<string, typeof prodiList>()
    for (const prodi of prodiList) {
      const existing = fakultasMap.get(prodi.kodeFakultas) ?? []
      existing.push(prodi)
      fakultasMap.set(prodi.kodeFakultas, existing)
    }

    let totalFakultas = 0
    let totalProdi = 0

    for (const [kodeFakultas, prodiItems] of fakultasMap) {
      const namaFakultas = getFakultas(kodeFakultas)

      const faculty = await prisma.faculty.upsert({
        where: { code: kodeFakultas },
        update: { name: namaFakultas },
        create: { name: namaFakultas, code: kodeFakultas },
      })
      totalFakultas++

      for (const prodi of prodiItems) {
        const degree = parseDegree(prodi.namaProdi)

        await prisma.studyProgram.upsert({
          where: { code: prodi.kodeProdi },
          update: {
            name: prodi.namaProdi,
            degree,
            facultyId: faculty.id,
          },
          create: {
            name: prodi.namaProdi,
            code: prodi.kodeProdi,
            degree,
            facultyId: faculty.id,
          },
        })
        totalProdi++
      }
    }

    logger.info(`Synced ${totalFakultas} fakultas, ${totalProdi} prodi from GraphQL`)

    return NextResponse.json({
      message: `Berhasil sinkronisasi ${totalFakultas} fakultas dan ${totalProdi} program studi`,
      totalFakultas,
      totalProdi,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error)
    logger.error("Sync prodi error:", error)
    return NextResponse.json(
      { message: "Gagal sinkronisasi data prodi" },
      { status: 500 }
    )
  }
}
