import type MockAdapter from "axios-mock-adapter"
import type { MockData } from "./data"

export function setupAuthMocks(mock: MockAdapter, data: MockData) {
  mock.onPost("/auth/login").reply((config) => {
    const { role } = JSON.parse(config.data)

    const user = data.users.find((u) => u.role === role)

    if (user) {
      return [200, { user, token: "mock-jwt-token" }]
    }

    return [401, { message: "Invalid credentials" }]
  })
}
