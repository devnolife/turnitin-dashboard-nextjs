import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const submissions = await prisma.submission.findMany({
    include: { user: { select: { id: true, username: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ submissions })
}
