import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="size-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="max-w-md text-muted-foreground">
        Maaf, halaman yang Anda cari tidak ditemukan. Periksa kembali URL atau kembali ke halaman utama.
      </p>
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  )
}
