import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Ketentuan Layanan - Perpusmu",
  description: "Ketentuan Layanan Perpusmu - Universitas Muhammadiyah Makassar",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter/30 via-white to-primary-lighter/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/auth/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark hover:underline font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Halaman Login
        </Link>

        <div className="rounded-2xl border bg-white/80 backdrop-blur-sm p-8 shadow-lg dark:bg-gray-900/80 dark:border-gray-800 sm:p-12">
          <h1 className="text-3xl font-bold text-primary-dark dark:text-white mb-2">
            Ketentuan Layanan
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Terakhir diperbarui: 10 Maret 2026
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                1. Penerimaan Ketentuan
              </h2>
              <p>
                Dengan mengakses dan menggunakan layanan Perpusmu (&quot;Layanan&quot;), Anda
                menyetujui dan terikat oleh ketentuan layanan ini. Jika Anda tidak
                menyetujui ketentuan ini, mohon untuk tidak menggunakan Layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                2. Deskripsi Layanan
              </h2>
              <p>
                Perpusmu adalah sistem manajemen perpustakaan digital yang
                dikembangkan untuk Universitas Muhammadiyah Makassar. Layanan ini
                menyediakan fitur pengelolaan dokumen akademik, pengecekan
                keaslian karya tulis, serta manajemen data mahasiswa dan dosen.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                3. Akun Pengguna
              </h2>
              <p>
                Untuk menggunakan Layanan, Anda harus memiliki akun yang terdaftar.
                Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda,
                termasuk kata sandi, dan bertanggung jawab atas semua aktivitas yang
                terjadi di bawah akun Anda.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                4. Penggunaan yang Diperbolehkan
              </h2>
              <p>Anda setuju untuk menggunakan Layanan hanya untuk tujuan yang sah dan sesuai dengan ketentuan ini. Anda dilarang untuk:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Menggunakan Layanan untuk tujuan ilegal atau tidak sah</li>
                <li>Mengunggah konten yang melanggar hak cipta atau hak kekayaan intelektual pihak lain</li>
                <li>Mencoba mengakses sistem atau data tanpa izin</li>
                <li>Mengganggu atau merusak infrastruktur Layanan</li>
                <li>Membagikan akun atau kredensial login kepada pihak lain</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                5. Hak Kekayaan Intelektual
              </h2>
              <p>
                Seluruh konten, fitur, dan fungsionalitas Layanan, termasuk namun
                tidak terbatas pada teks, grafik, logo, dan perangkat lunak, merupakan
                milik Universitas Muhammadiyah Makassar dan dilindungi oleh hukum hak
                cipta dan hak kekayaan intelektual yang berlaku.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                6. Dokumen yang Diunggah
              </h2>
              <p>
                Anda mempertahankan hak kepemilikan atas dokumen yang Anda unggah ke
                Layanan. Dengan mengunggah dokumen, Anda memberikan lisensi kepada
                Perpusmu untuk menyimpan, memproses, dan menganalisis dokumen tersebut
                sesuai dengan fungsi Layanan, termasuk pengecekan keaslian karya tulis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                7. Batasan Tanggung Jawab
              </h2>
              <p>
                Layanan disediakan &quot;sebagaimana adanya&quot; tanpa jaminan apapun.
                Perpusmu dan Universitas Muhammadiyah Makassar tidak bertanggung jawab
                atas kerugian langsung, tidak langsung, insidental, atau konsekuensial
                yang timbul dari penggunaan atau ketidakmampuan menggunakan Layanan.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                8. Perubahan Ketentuan
              </h2>
              <p>
                Kami berhak untuk mengubah ketentuan ini kapan saja. Perubahan akan
                berlaku segera setelah dipublikasikan di halaman ini. Penggunaan
                Layanan yang berkelanjutan setelah perubahan merupakan penerimaan Anda
                terhadap ketentuan yang diperbarui.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                9. Kontak
              </h2>
              <p>
                Jika Anda memiliki pertanyaan mengenai Ketentuan Layanan ini, silakan
                hubungi kami melalui email di{" "}
                <a
                  href="mailto:perpusmu@unismuh.ac.id"
                  className="text-primary hover:text-primary-dark hover:underline font-medium"
                >
                  perpusmu@unismuh.ac.id
                </a>
                .
              </p>
            </section>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Perpusmu - Universitas Muhammadiyah Makassar
          </p>
        </div>
      </div>
    </div>
  )
}
