import type MockAdapter from "axios-mock-adapter"
import type { MockData } from "./data"

export function setupAuthMocks(mock: MockAdapter, data: MockData) {
  mock.onPost("/auth/login").reply((config) => {
    const { username, password } = JSON.parse(config.data)

    if (!username || !password) {
      return [400, { message: "Username dan password harus diisi" }]
    }

    const user = data.users.find((u) => u.username === username)

    if (user) {
      return [200, { user, token: "mock-jwt-token" }]
    }

    return [401, { message: "Username atau password salah" }]
  })
}
