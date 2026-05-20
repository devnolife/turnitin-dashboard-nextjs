import { PrismaClient } from "@prisma/client"
import { createHash } from "crypto"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex")
}

// Mapping kodeFakultas ke nama fakultas Unismuh Makassar
const FAKULTAS_MAP: Record<string, string> = {
  "01": "Fakultas Keguruan dan Ilmu Pendidikan",
  "02": "Fakultas Teknik",
  "03": "Fakultas Ekonomi dan Bisnis",
  "04": "Fakultas Pertanian",
  "05": "Fakultas Kedokteran dan Ilmu Kesehatan",
  "06": "Fakultas Agama Islam",
  "07": "Fakultas Ilmu Sosial dan Ilmu Politik",
  "08": "Fakultas Hukum",
  "09": "Program Pascasarjana",
  FKIP: "Fakultas Keguruan dan Ilmu Pendidikan",
  FT: "Fakultas Teknik",
  FEB: "Fakultas Ekonomi dan Bisnis",
  FP: "Fakultas Pertanian",
  FKIK: "Fakultas Kedokteran dan Ilmu Kesehatan",
  FK: "Fakultas Kedokteran dan Ilmu Kesehatan",
  FAI: "Fakultas Agama Islam",
  FISIP: "Fakultas Ilmu Sosial dan Ilmu Politik",
  FH: "Fakultas Hukum",
  PPS: "Program Pascasarjana",
  PASCA: "Program Pascasarjana",
}

function getFakultas(kodeFakultas: string): string {
  return FAKULTAS_MAP[kodeFakultas] ?? `Fakultas ${kodeFakultas}`
}

function parseDegree(namaProdi: string): string {
  const lower = namaProdi.toLowerCase()
  if (lower.startsWith("s-1 ") || lower.startsWith("s1 ")) return "S1"
  if (lower.startsWith("s-2 ") || lower.startsWith("s2 ") || lower.startsWith("magister ")) return "S2"
  if (lower.startsWith("s-3 ") || lower.startsWith("s3 ")) return "S3"
  if (lower.startsWith("d-3 ") || lower.startsWith("d3 ")) return "D3"
  if (lower.startsWith("d-4 ") || lower.startsWith("d4 ")) return "D4"
  if (lower.startsWith("profesi ") || lower.includes("profesi")) return "Profesi"
  if (lower.startsWith("spesialis ")) return "Spesialis"
  return "S1"
}

interface ProdiData {
  kodeFakultas: string
  kodeProdi: string
  namaProdi: string
  kodeNim: string
  statusProdi: string
}

async function fetchAllProdiFromGraphQL(): Promise<ProdiData[]> {
  const graphqlUrl = process.env.GRAPHQL_URL
  if (!graphqlUrl) {
    console.log("  ⚠ GRAPHQL_URL tidak diset, skip fetch prodi dari API")
    return []
  }

  const query = `
    query GetAllProdi {
      getAllProdi {
        kodeFakultas
        kodeProdi
        namaProdi
        kodeNim
        statusProdi
      }
    }
  `

  try {
    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`)
    }

    const result = await response.json()
    if (result.errors?.length > 0) {
      throw new Error(`GraphQL error: ${result.errors[0].message}`)
    }

    return result.data?.getAllProdi ?? []
  } catch (error) {
    console.error("  ✗ Gagal fetch prodi dari GraphQL:", error)
    return []
  }
}

// Fallback data jika GraphQL tidak tersedia
const FALLBACK_FACULTIES = [
  {
    name: "Fakultas Kedokteran dan Ilmu Kesehatan",
    code: "05",
    programs: [
      { name: "S-1 Pendidikan Dokter", code: "PDOK", degree: "S1" },
      { name: "S-1 Farmasi", code: "FAR", degree: "S1" },
      { name: "S-1 Kebidanan", code: "KBD", degree: "S1" },
      { name: "S-1 Administrasi Rumah Sakit", code: "ARS", degree: "S1" },
      { name: "D-3 Keperawatan", code: "DKEP", degree: "D3" },
      { name: "D-3 Kebidanan", code: "DKBD", degree: "D3" },
    ],
  },
  {
    name: "Fakultas Keguruan dan Ilmu Pendidikan",
    code: "01",
    programs: [
      { name: "S-1 Pendidikan Guru Sekolah Dasar", code: "PGSD", degree: "S1" },
      { name: "S-1 Pendidikan Bahasa Inggris", code: "PBI", degree: "S1" },
      { name: "S-1 Pendidikan Bahasa & Sastra Indonesia", code: "PBSI", degree: "S1" },
      { name: "S-1 Pendidikan Matematika", code: "PMAT", degree: "S1" },
      { name: "S-1 Pendidikan Fisika", code: "PFIS", degree: "S1" },
      { name: "S-1 Pendidikan Biologi", code: "PBIO", degree: "S1" },
      { name: "S-1 Pendidikan Pancasila dan Kewarganegaraan", code: "PPKN", degree: "S1" },
      { name: "S-1 Teknologi Pendidikan", code: "TP", degree: "S1" },
      { name: "S-1 Pendidikan Sosiologi", code: "PSOS", degree: "S1" },
      { name: "S-1 Pendidikan Seni Rupa", code: "PSR", degree: "S1" },
      { name: "S-1 Pendidikan Kepelatihan Olahraga", code: "PKO", degree: "S1" },
      { name: "S-1 Pendidikan Ilmu Pengetahuan Alam", code: "PIPA", degree: "S1" },
      { name: "S-1 Pendidikan Guru Pendidikan Anak Usia Dini", code: "PGPAUD", degree: "S1" },
    ],
  },
  {
    name: "Fakultas Agama Islam",
    code: "06",
    programs: [
      { name: "S-1 Pendidikan Agama Islam", code: "PAI", degree: "S1" },
      { name: "S-1 Hukum Ekonomi Syariah (Mu'amalah)", code: "HES", degree: "S1" },
      { name: "S-1 Bimbingan Konseling Pend. Islam", code: "BKPI", degree: "S1" },
      { name: "S-1 Pendidikan Bahasa Arab", code: "PBA", degree: "S1" },
      { name: "S-1 Hukum Keluarga (Ahwal Syakhshiyah)", code: "HK", degree: "S1" },
      { name: "S-1 Komunikasi dan Penyiaran Islam", code: "KPI", degree: "S1" },
    ],
  },
  {
    name: "Fakultas Ekonomi dan Bisnis",
    code: "03",
    programs: [
      { name: "S-1 Akuntansi", code: "AKT", degree: "S1" },
      { name: "S-1 Manajemen", code: "MNJ", degree: "S1" },
      { name: "S-1 Ekonomi Pembangunan", code: "EP", degree: "S1" },
      { name: "S-1 Ekonomi Islam", code: "EI", degree: "S1" },
      { name: "D-3 Perpajakan", code: "DPJK", degree: "D3" },
    ],
  },
  {
    name: "Fakultas Teknik",
    code: "02",
    programs: [
      { name: "S-1 Teknik Elektro", code: "TE", degree: "S1" },
      { name: "S-1 Teknik Pengairan", code: "TPENG", degree: "S1" },
      { name: "S-1 Arsitektur", code: "ARS", degree: "S1" },
      { name: "S-1 Informatika", code: "TI", degree: "S1" },
      { name: "S-1 Perencanaan Wilayah Kota", code: "PWK", degree: "S1" },
    ],
  },
  {
    name: "Fakultas Ilmu Sosial dan Ilmu Politik",
    code: "07",
    programs: [
      { name: "S-1 Ilmu Administrasi Negara", code: "IAN", degree: "S1" },
      { name: "S-1 Ilmu Pemerintahan", code: "IP", degree: "S1" },
      { name: "S-1 Ilmu Komunikasi", code: "IKOM", degree: "S1" },
      { name: "S-1 Psikologi", code: "PSI", degree: "S1" },
    ],
  },
  {
    name: "Fakultas Pertanian",
    code: "04",
    programs: [
      { name: "S-1 Agribisnis", code: "AGB", degree: "S1" },
      { name: "S-1 Budidaya Perairan", code: "BDP", degree: "S1" },
      { name: "S-1 Kehutanan", code: "KHT", degree: "S1" },
      { name: "S-1 Agroteknologi", code: "AGR", degree: "S1" },
    ],
  },
  {
    name: "Fakultas Hukum",
    code: "08",
    programs: [
      { name: "S-1 Hukum Bisnis", code: "HB", degree: "S1" },
      { name: "S-1 Hukum", code: "HKM", degree: "S1" },
    ],
  },
  {
    name: "Program Pascasarjana",
    code: "09",
    programs: [
      { name: "S-2 Manajemen", code: "MM", degree: "S2" },
      { name: "S-2 Ilmu Administrasi Publik", code: "MAP", degree: "S2" },
      { name: "S-2 Pendidikan Islam", code: "MPI", degree: "S2" },
      { name: "S-2 Pend. Bahasa Indonesia", code: "MPBI", degree: "S2" },
      { name: "S-2 Pendidikan Dasar", code: "MPD", degree: "S2" },
      { name: "S-2 Pendidikan Bahasa Inggris", code: "MPBING", degree: "S2" },
      { name: "S-2 Agribisnis", code: "MAGB", degree: "S2" },
      { name: "S-2 Pendidikan Matematika", code: "MPMAT", degree: "S2" },
      { name: "S-2 Teknik Sumber Daya Air (Pengairan)", code: "MTSDA", degree: "S2" },
      { name: "S-2 Pendidikan Sosiologi", code: "MPSOS", degree: "S2" },
      { name: "S-2 Akuntansi", code: "MAKT", degree: "S2" },
      { name: "S-2 Ilmu Pemerintahan", code: "MIP", degree: "S2" },
      { name: "S-3 Pendidikan Agama Islam", code: "DPAI", degree: "S3" },
      { name: "S-3 Pendidikan", code: "DPEND", degree: "S3" },
      { name: "S-3 Agribisnis", code: "DAGB", degree: "S3" },
    ],
  },
]

async function seedProdiFromGraphQL(): Promise<boolean> {
  console.log("\n📡 Mengambil data prodi dari GraphQL API...")
  const prodiList = await fetchAllProdiFromGraphQL()

  if (prodiList.length === 0) return false

  // Group by kodeFakultas
  const fakultasGroups = new Map<string, ProdiData[]>()
  for (const prodi of prodiList) {
    const existing = fakultasGroups.get(prodi.kodeFakultas) ?? []
    existing.push(prodi)
    fakultasGroups.set(prodi.kodeFakultas, existing)
  }

  for (const [kodeFakultas, prodiItems] of fakultasGroups) {
    const namaFakultas = getFakultas(kodeFakultas)

    const faculty = await prisma.faculty.upsert({
      where: { code: kodeFakultas },
      update: { name: namaFakultas },
      create: { name: namaFakultas, code: kodeFakultas },
    })

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
    }

    console.log(`  ✓ ${namaFakultas} (${prodiItems.length} prodi)`)
  }

  console.log(`  ✓ Total: ${fakultasGroups.size} fakultas, ${prodiList.length} prodi dari GraphQL`)
  return true
}

async function seedProdiFromFallback() {
  console.log("\n📋 Menggunakan data fakultas/prodi fallback...")

  for (const facData of FALLBACK_FACULTIES) {
    const faculty = await prisma.faculty.upsert({
      where: { code: facData.code },
      update: { name: facData.name },
      create: { name: facData.name, code: facData.code },
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
}

async function main() {
  console.log("Seeding database...")

  // Password disimpan dual: kolom `password` (MD5) untuk kompatibilitas dengan
  // GraphQL UNISMUH, dan `passwordHash` (bcrypt) sebagai sumber kebenaran utama
  // dipakai login route.
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "admin123"
  const instructorPassword = process.env.INSTRUCTOR_SEED_PASSWORD || "instruktur123"
  const adminHash = await bcrypt.hash(adminPassword, 12)
  const instructorHash = await bcrypt.hash(instructorPassword, 12)

  // Create admin account
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { passwordHash: adminHash },
    create: {
      username: "admin",
      password: md5(adminPassword),
      passwordHash: adminHash,
      name: "Administrator",
      role: "ADMIN",
      hasCompletedPayment: true,
    },
  })
  console.log("  ✓ Admin account created (username: admin)")

  // Create instructor account
  await prisma.user.upsert({
    where: { username: "instruktur" },
    update: { passwordHash: instructorHash },
    create: {
      username: "instruktur",
      password: md5(instructorPassword),
      passwordHash: instructorHash,
      name: "Instruktur Perpusmu",
      role: "INSTRUCTOR",
      hasCompletedPayment: true,
    },
  })
  console.log("  ✓ Instructor account created (username: instruktur)")

  // Coba ambil prodi dari GraphQL, jika gagal pakai data fallback
  const fromGraphQL = await seedProdiFromGraphQL()
  if (!fromGraphQL) {
    await seedProdiFromFallback()
  }

  console.log("\nSeeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
