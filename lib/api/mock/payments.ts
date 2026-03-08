import type MockAdapter from "axios-mock-adapter"
import type { MockData } from "./data"

export function setupPaymentMocks(mock: MockAdapter, data: MockData) {
  // Check payment status
  mock.onGet("/payments/status").reply((config) => {
    const userId = config.params?.userId

    if (!userId) {
      return [400, { message: "User ID is required" }]
    }

    const payment = data.payments.find((p) => p.userId === userId)

    if (payment) {
      // Simulate random payment status for testing
      const statuses = ["pending", "processing", "completed", "failed"]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      // Update payment status
      payment.status = randomStatus
      payment.updatedAt = new Date().toISOString()

      // If payment is completed, update user payment status
      if (randomStatus === "completed") {
        const user = data.users.find((u) => u.id === userId)
        if (user) {
          user.hasCompletedPayment = true
        }
      }

      return [200, { payment }]
    }

    return [404, { message: "Payment not found" }]
  })

  // Update payment status (for testing)
  mock.onPost("/payments/update").reply((config) => {
    const { userId, status } = JSON.parse(config.data)

    if (!userId) {
      return [400, { message: "User ID is required" }]
    }

    const payment = data.payments.find((p) => p.userId === userId)

    if (payment) {
      payment.status = status
      payment.updatedAt = new Date().toISOString()

      // If payment is completed, update user payment status
      if (status === "completed") {
        const user = data.users.find((u) => u.id === userId)
        if (user) {
          user.hasCompletedPayment = true
        }
      }

      return [200, { payment }]
    }

    return [404, { message: "Payment not found" }]
  })
}
