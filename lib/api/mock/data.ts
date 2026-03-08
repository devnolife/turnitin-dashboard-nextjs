// Mock user data
const users = [
  {
    id: "user-1",
    email: "student@example.com",
    role: "student",
    name: "John Student",
    hasCompletedPayment: false,
    whatsappNumber: null as string | null,
    examDetails: null as {
      thesisTitle: string
      examType: string
      submittedAt: string
      approvalStatus: string
    } | null,
  },
  {
    id: "user-2",
    email: "instructor@example.com",
    role: "instructor",
    name: "Jane Instructor",
    hasCompletedPayment: true,
    whatsappNumber: "+6281234567890" as string | null,
    examDetails: null as {
      thesisTitle: string
      examType: string
      submittedAt: string
      approvalStatus: string
    } | null,
  },
  {
    id: "user-3",
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
    hasCompletedPayment: true,
    whatsappNumber: "+6287654321098" as string | null,
    examDetails: null as {
      thesisTitle: string
      examType: string
      submittedAt: string
      approvalStatus: string
    } | null,
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

export const mockData = { users, payments, submissions }

export type MockData = typeof mockData
