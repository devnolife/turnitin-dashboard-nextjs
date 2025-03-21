import { Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingCard() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl">Akses Mahasiswa Turnitin</CardTitle>
        <CardDescription>Akses penuh ke layanan Turnitin selama satu tahun akademik</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">Rp 750.000</span>
          <span className="text-muted-foreground"> / tahun</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            <span>Pengiriman dokumen tidak terbatas</span>
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            <span>Laporan keaslian</span>
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            <span>Pemeriksaan tata bahasa dan ejaan</span>
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            <span>Umpan balik instruktur</span>
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            <span>Dukungan teknis 24/7</span>
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            <span>Akses mobile</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Langganan Anda akan berlaku hingga 31 Juli 2025. Perpanjangan otomatis dapat dinonaktifkan di pengaturan akun
          Anda.
        </p>
      </CardFooter>
    </Card>
  )
}

