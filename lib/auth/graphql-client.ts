interface MahasiswaData {
  nim: string
  nama: string
  hp: string | null
  email: string | null
  prodi: string | null
  passwd: string
}

export interface MahasiswaPembayaran {
  nim: string
  nama: string
  periode: string
  jenisPembayaran: string
  waktuPembayaran: string | null
  jumlahPembayaran: number
  statusPembayaran: string
}

export interface ProdiData {
  kodeFakultas: string
  kodeProdi: string
  namaProdi: string
  kodeNim: string
  statusProdi: string
}

interface GraphQLResponse {
  data?: {
    mahasiswaUser: MahasiswaData | null
  }
  errors?: Array<{ message: string }>
}

interface GraphQLPembayaranResponse {
  data?: {
    mahasiswaPembayaran: MahasiswaPembayaran[] | null
  }
  errors?: Array<{ message: string }>
}

interface GraphQLProdiResponse {
  data?: {
    getAllProdi: ProdiData[] | null
  }
  errors?: Array<{ message: string }>
}

function getGraphQLUrl(): string {
  const graphqlUrl = process.env.GRAPHQL_URL
  if (!graphqlUrl) {
    throw new Error("GRAPHQL_URL environment variable is not set")
  }
  return graphqlUrl
}

export async function fetchMahasiswaByNim(nim: string): Promise<MahasiswaData | null> {
  const graphqlUrl = getGraphQLUrl()

  const query = `
    query MahasiswaUser($nim: String!) {
      mahasiswaUser(nim: $nim) {
        nim
        nama
        hp
        email
        prodi
        passwd
      }
    }
  `

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { nim } }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`)
  }

  const result: GraphQLResponse = await response.json()

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL error: ${result.errors[0].message}`)
  }

  return result.data?.mahasiswaUser ?? null
}

export async function fetchMahasiswaPembayaran(
  nim: string,
  jenisPembayaran: string = "TURNITIN DIPLOMA S1"
): Promise<MahasiswaPembayaran | null> {
  const graphqlUrl = getGraphQLUrl()

  const query = `
    query MahasiswaPembayaran($nim: String!, $jenisPembayaran: String!) {
      mahasiswaPembayaran(nim: $nim, jenisPembayaran: $jenisPembayaran) {
        nim
        nama
        periode
        jenisPembayaran
        waktuPembayaran
        jumlahPembayaran
        statusPembayaran
      }
    }
  `

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { nim, jenisPembayaran } }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`)
  }

  const result: GraphQLPembayaranResponse = await response.json()

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL error: ${result.errors[0].message}`)
  }

  const items = result.data?.mahasiswaPembayaran
  if (!items || items.length === 0) return null
  return items[0]
}

/**
 * Ambil SEMUA tagihan/pembayaran mahasiswa (tanpa filter jenis). SIMAK
 * mengembalikan seluruh array bila `jenisPembayaran` dikirim string kosong.
 * Dipakai agar pencocokan label bisa fleksibel (mis. SIMAK kadang menyimpan
 * "TURNITIN DIPLOMA  S1" dengan spasi ganda yang meleset dari query exact-match).
 */
export async function fetchMahasiswaPembayaranAll(nim: string): Promise<MahasiswaPembayaran[]> {
  const graphqlUrl = getGraphQLUrl()

  const query = `
    query MahasiswaPembayaran($nim: String!, $jenisPembayaran: String!) {
      mahasiswaPembayaran(nim: $nim, jenisPembayaran: $jenisPembayaran) {
        nim
        nama
        periode
        jenisPembayaran
        waktuPembayaran
        jumlahPembayaran
        statusPembayaran
      }
    }
  `

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { nim, jenisPembayaran: "" } }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`)
  }

  const result: GraphQLPembayaranResponse = await response.json()

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL error: ${result.errors[0].message}`)
  }

  return result.data?.mahasiswaPembayaran ?? []
}

// Mapping kodeFakultas ke nama fakultas
export const FAKULTAS_MAP: Record<string, string> = {
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

export function getFakultas(kodeFakultas: string): string {
  return FAKULTAS_MAP[kodeFakultas] ?? `Fakultas ${kodeFakultas}`
}

export async function fetchAllProdi(): Promise<ProdiData[]> {
  const graphqlUrl = getGraphQLUrl()

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

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`)
  }

  const result: GraphQLProdiResponse = await response.json()

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL error: ${result.errors[0].message}`)
  }

  return result.data?.getAllProdi ?? []
}

export { parseDegree }
