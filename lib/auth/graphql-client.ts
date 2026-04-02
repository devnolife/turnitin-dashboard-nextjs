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

interface GraphQLResponse {
  data?: {
    mahasiswaUser: MahasiswaData | null
  }
  errors?: Array<{ message: string }>
}

interface GraphQLPembayaranResponse {
  data?: {
    mahasiswaPembayaran: MahasiswaPembayaran | null
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
  jenisPembayaran: string = "PERPUSTAKAAN"
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

  return result.data?.mahasiswaPembayaran ?? null
}
