import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 })
  }

  const payment = await prisma.payment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  if (!payment) {
    return NextResponse.json({
      payment: {
        id: null,
        userId,
        amount: 750000,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  }

  return NextResponse.json({ payment })
}
