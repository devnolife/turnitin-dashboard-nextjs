import { PrismaClient } from "@prisma/client"
import { createHash } from "crypto"

const prisma = new PrismaClient()

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex")
}

async function main() {
  console.log("Seeding database...")

  // Create admin account
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: md5("admin123"),
      name: "Administrator",
      role: "ADMIN",
      hasCompletedPayment: true,
    },
  })
  console.log("  ✓ Admin account created (username: admin, password: admin123)")

  // Create instructor account
  await prisma.user.upsert({
    where: { username: "instruktur" },
    update: {},
    create: {
      username: "instruktur",
      password: md5("instruktur123"),
      name: "Instruktur Perpusmu",
      role: "INSTRUCTOR",
      hasCompletedPayment: true,
    },
  })
  console.log("  ✓ Instructor account created (username: instruktur, password: instruktur123)")

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
