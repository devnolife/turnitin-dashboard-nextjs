import type { Metadata } from "next"
import { SimilarityRulesPage } from "@/components/dashboard/admin/prodi/similarity-rules-page"

export const metadata: Metadata = {
  title: "Aturan Similarity - Admin",
  description: "Kelola aturan batas similarity per program studi",
}

export default function RulesPage() {
  return <SimilarityRulesPage />
}
