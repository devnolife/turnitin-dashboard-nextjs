import axios from "axios"
import MockAdapter from "axios-mock-adapter"

// Create axios instance
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

// Create mock adapter
const mock = new MockAdapter(api, { delayResponse: 1000 })

// Mock user data
const users = [
  {
    id: "user-1",
    email: "student@example.com",
    role: "student",
    name: "John Student",
    hasCompletedPayment: false,
    whatsappNumber: null,
    examDetails: null,
  },
  {
    id: "user-2",
    email: "instructor@example.com",
    role: "instructor",
    name: "Jane Instructor",
    hasCompletedPayment: true,
    whatsappNumber: "+6281234567890",
    examDetails: null,
  },
  {
    id: "user-3",
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
    hasCompletedPayment: true,
    whatsappNumber: "+6287654321098",
    examDetails: null,
  },
]

// Mock payment data
const payments = [
  {
    id: "payment-1",
    userId: "user-1",
    amount: 750000,
    currency: "IDR",
    status: "pending",
    createdAt: "2023-04-10T10:00:00Z",
    updatedAt: "2023-04-10T10:00:00Z",
  },
]

// Mock submissions data
const submissions = [
  {
    id: "sub-001",
    userId: "user-1",
    title: "Research Paper on AI Ethics",
    course: "Computer Science 101",
    date: "Apr 10, 2025",
    similarity: 15,
    status: "Graded",
  },
  {
    id: "sub-002",
    userId: "user-1",
    title: "Literary Analysis: Hamlet",
    course: "English Literature",
    date: "Apr 5, 2025",
    similarity: 8,
    status: "Graded",
  },
  {
    id: "sub-003",
    userId: "user-1",
    title: "Data Analysis Project",
    course: "Data Science 202",
    date: "Mar 28, 2025",
    similarity: 22,
    status: "Pending",
  },
]

// Mock API endpoints

// Authentication
mock.onPost("/auth/login").reply((config) => {
  const { role } = JSON.parse(config.data)

  const user = users.find((u) => u.role === role)

  if (user) {
    return [200, { user, token: "mock-jwt-token" }]
  }

  return [401, { message: "Invalid credentials" }]
})

// Get user profile
mock.onGet("/users/profile").reply((config) => {
  const token = config.headers?.Authorization?.split(" ")[1]

  if (token === "mock-jwt-token") {
    // In a real app, we would decode the token to get the user ID
    // For simplicity, we'll just return the first user that matches the role in the request
    const role = config.params?.role
    const user = users.find((u) => u.role === role)

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

  const user = users.find((u) => u.id === userId)

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

  const user = users.find((u) => u.id === userId)

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

// Update exam details approval status (for admin)
mock.onPost("/admin/update-exam-approval").reply((config) => {
  const { userId, approvalStatus } = JSON.parse(config.data)

  if (!userId) {
    return [400, { message: "User ID is required" }]
  }

  const user = users.find((u) => u.id === userId)

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

// Check payment status
mock.onGet("/payments/status").reply((config) => {
  const userId = config.params?.userId

  if (!userId) {
    return [400, { message: "User ID is required" }]
  }

  const payment = payments.find((p) => p.userId === userId)

  if (payment) {
    // Simulate random payment status for testing
    const statuses = ["pending", "processing", "completed", "failed"]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    // Update payment status
    payment.status = randomStatus
    payment.updatedAt = new Date().toISOString()

    // If payment is completed, update user payment status
    if (randomStatus === "completed") {
      const user = users.find((u) => u.id === userId)
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

  const payment = payments.find((p) => p.userId === userId)

  if (payment) {
    payment.status = status
    payment.updatedAt = new Date().toISOString()

    // If payment is completed, update user payment status
    if (status === "completed") {
      const user = users.find((u) => u.id === userId)
      if (user) {
        user.hasCompletedPayment = true
      }
    }

    return [200, { payment }]
  }

  return [404, { message: "Payment not found" }]
})

// Get user submissions
mock.onGet("/submissions").reply((config) => {
  const userId = config.params?.userId

  if (!userId) {
    return [400, { message: "User ID is required" }]
  }

  const userSubmissions = submissions.filter((s) => s.userId === userId)

  return [200, { submissions: userSubmissions }]
})

// Get all submissions (for instructors and admins)
mock.onGet("/submissions/all").reply((config) => {
  const token = config.headers?.Authorization?.split(" ")[1]

  if (token === "mock-jwt-token") {
    return [200, { submissions }]
  }

  return [401, { message: "Unauthorized" }]
})

export default api

