import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.similarityRule.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Aturan berhasil dihapus" })
  } catch (error) {
    console.error("Delete similarity rule error:", error)
    return NextResponse.json(
      { message: "Gagal menghapus aturan" },
      { status: 500 }
    )
  }
}
