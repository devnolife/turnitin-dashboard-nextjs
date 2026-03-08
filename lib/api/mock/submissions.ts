import type MockAdapter from "axios-mock-adapter"
import type { MockData } from "./data"

export function setupSubmissionMocks(mock: MockAdapter, data: MockData) {
  // Get user submissions
  mock.onGet("/submissions").reply((config) => {
    const userId = config.params?.userId

    if (!userId) {
      return [400, { message: "User ID is required" }]
    }

    const userSubmissions = data.submissions.filter((s) => s.userId === userId)

    return [200, { submissions: userSubmissions }]
  })

  // Get all submissions (for instructors and admins)
  mock.onGet("/submissions/all").reply((config) => {
    const token = config.headers?.Authorization?.split(" ")[1]

    if (token === "mock-jwt-token") {
      return [200, { submissions: data.submissions }]
    }

    return [401, { message: "Unauthorized" }]
  })
}
