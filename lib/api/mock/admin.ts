import type MockAdapter from "axios-mock-adapter"
import type { MockData } from "./data"

export function setupAdminMocks(mock: MockAdapter, data: MockData) {
  // Update exam details approval status (for admin)
  mock.onPost("/admin/update-exam-approval").reply((config) => {
    const { userId, approvalStatus } = JSON.parse(config.data)

    if (!userId) {
      return [400, { message: "User ID is required" }]
    }

    const user = data.users.find((u) => u.id === userId)

    if (user && user.examDetails) {
      // Update approval status
      user.examDetails.approvalStatus = approvalStatus

      return [
        200,
        {
          success: true,
          message: `Exam details ${approvalStatus}`,
          examDetails: user.examDetails,
        },
      ]
    }

    return [404, { message: "User or exam details not found" }]
  })
}
