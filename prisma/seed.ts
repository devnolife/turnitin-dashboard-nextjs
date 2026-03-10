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

  // Seed Faculties and Study Programs
  const facultiesData = [
    {
      name: "Fakultas Keguruan dan Ilmu Pendidikan",
      code: "FKIP",
      programs: [
        { name: "Pendidikan Guru Sekolah Dasar", code: "PGSD", degree: "S1" },
        { name: "Pendidikan Bahasa Inggris", code: "PBI", degree: "S1" },
        { name: "Pendidikan Matematika", code: "PMAT", degree: "S1" },
        { name: "Pendidikan Bahasa dan Sastra Indonesia", code: "PBSI", degree: "S1" },
        { name: "Pendidikan Pancasila dan Kewarganegaraan", code: "PPKN", degree: "S1" },
        { name: "Pendidikan Jasmani", code: "PJKR", degree: "S1" },
        { name: "Pendidikan Fisika", code: "PFIS", degree: "S1" },
        { name: "Pendidikan Biologi", code: "PBIO", degree: "S1" },
      ],
    },
    {
      name: "Fakultas Teknik",
      code: "FT",
      programs: [
        { name: "Teknik Informatika", code: "TI", degree: "S1" },
        { name: "Teknik Elektro", code: "TE", degree: "S1" },
        { name: "Teknik Sipil", code: "TS", degree: "S1" },
        { name: "Teknik Arsitektur", code: "TAR", degree: "S1" },
      ],
    },
    {
      name: "Fakultas Ekonomi dan Bisnis",
      code: "FEB",
      programs: [
        { name: "Manajemen", code: "MNJ", degree: "S1" },
        { name: "Akuntansi", code: "AKT", degree: "S1" },
        { name: "Ekonomi Pembangunan", code: "EP", degree: "S1" },
        { name: "Magister Manajemen", code: "MM", degree: "S2" },
      ],
    },
    {
      name: "Fakultas Kedokteran",
      code: "FK",
      programs: [
        { name: "Pendidikan Dokter", code: "PDOK", degree: "S1" },
        { name: "Ilmu Keperawatan", code: "IKEP", degree: "S1" },
        { name: "Kesehatan Masyarakat", code: "KESMAS", degree: "S1" },
      ],
    },
    {
      name: "Fakultas Agama Islam",
      code: "FAI",
      programs: [
        { name: "Pendidikan Agama Islam", code: "PAI", degree: "S1" },
        { name: "Perbankan Syariah", code: "PBS", degree: "S1" },
        { name: "Hukum Ekonomi Syariah", code: "HES", degree: "S1" },
        { name: "Komunikasi dan Penyiaran Islam", code: "KPI", degree: "S1" },
      ],
    },
    {
      name: "Fakultas Ilmu Sosial dan Ilmu Politik",
      code: "FISIP",
      programs: [
        { name: "Ilmu Komunikasi", code: "IKOM", degree: "S1" },
        { name: "Ilmu Pemerintahan", code: "IP", degree: "S1" },
        { name: "Ilmu Administrasi Negara", code: "IAN", degree: "S1" },
      ],
    },
    {
      name: "Fakultas Pertanian",
      code: "FP",
      programs: [
        { name: "Agroteknologi", code: "AGR", degree: "S1" },
        { name: "Ilmu dan Teknologi Pangan", code: "ITP", degree: "S1" },
        { name: "Peternakan", code: "PTK", degree: "S1" },
      ],
    },
  ]

  for (const facData of facultiesData) {
    const faculty = await prisma.faculty.upsert({
      where: { code: facData.code },
      update: { name: facData.name },
      create: {
        name: facData.name,
        code: facData.code,
      },
    })

    for (const prog of facData.programs) {
      await prisma.studyProgram.upsert({
        where: { code: prog.code },
        update: { name: prog.name, degree: prog.degree, facultyId: faculty.id },
        create: {
          name: prog.name,
          code: prog.code,
          degree: prog.degree,
          facultyId: faculty.id,
        },
      })
    }

    console.log(`  ✓ ${facData.name} (${facData.programs.length} prodi)`)
  }

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
