import type MockAdapter from "axios-mock-adapter"
import type { MockData } from "./data"

export function setupUserMocks(mock: MockAdapter, data: MockData) {
  // Get user profile
  mock.onGet("/users/profile").reply((config) => {
    const token = config.headers?.Authorization?.split(" ")[1]

    if (token === "mock-jwt-token") {
      // In a real app, we would decode the token to get the user ID
      // For simplicity, we'll just return the first user that matches the role in the request
      const role = config.params?.role
      const user = data.users.find((u) => u.role === role)

      if (user) {
        return [200, { user }]
      }
    }

    return [401, { message: "Unauthorized" }]
  })

  // Update WhatsApp number
  mock.onPost("/users/update-whatsapp").reply((config) => {
    const { userId, whatsappNumber } = JSON.parse(config.data)

    if (!userId) {
      return [400, { message: "User ID is required" }]
    }

    const user = data.users.find((u) => u.id === userId)

    if (user) {
      // Update user's WhatsApp number
      user.whatsappNumber = whatsappNumber

      return [
        200,
        {
          success: true,
          message: "WhatsApp number updated successfully",
          user,
        },
      ]
    }

    return [404, { message: "User not found" }]
  })

  // Submit exam details
  mock.onPost("/users/submit-exam-details").reply((config) => {
    const { userId, thesisTitle, examType } = JSON.parse(config.data)

    if (!userId) {
      return [400, { message: "User ID is required" }]
    }

    const user = data.users.find((u) => u.id === userId)

    if (user) {
      // Create exam details object
      const examDetails = {
        thesisTitle,
        examType,
        submittedAt: new Date().toISOString(),
        approvalStatus: "pending",
      }

      // Update user's exam details
      user.examDetails = examDetails

      return [
        200,
        {
          success: true,
          message: "Exam details submitted successfully",
          examDetails,
        },
      ]
    }

    return [404, { message: "User not found" }]
  })
}
