export interface Payment {
  id: string | null
  userId: string
  nim: string
  nama: string
  periode: string | null
  jenisPembayaran: string
  jumlahPembayaran: number
  waktuPembayaran: string | null
  status: "pending" | "processing" | "completed" | "failed"
  statusPembayaran: string | null
}
