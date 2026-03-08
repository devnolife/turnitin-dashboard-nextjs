export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: string
  updatedAt: string
}
