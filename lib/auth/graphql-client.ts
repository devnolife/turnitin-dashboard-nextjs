interface MahasiswaData {
  nim: string
  nama: string
  hp: string | null
  email: string | null
  prodi: string | null
  passwd: string
}

interface GraphQLResponse {
  data?: {
    mahasiswaUser: MahasiswaData | null
  }
  errors?: Array<{ message: string }>
}

export async function fetchMahasiswaByNim(nim: string): Promise<MahasiswaData | null> {
  const graphqlUrl = process.env.GRAPHQL_URL
  if (!graphqlUrl) {
    throw new Error("GRAPHQL_URL environment variable is not set")
  }

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
