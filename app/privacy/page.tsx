import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Perpusmu",
  description: "Kebijakan Privasi Perpusmu - Universitas Muhammadiyah Makassar",
}

export default function PrivacyPage() {
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
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Terakhir diperbarui: 10 Maret 2026
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                1. Pendahuluan
              </h2>
              <p>
                Perpusmu (&quot;kami&quot;) menghargai privasi Anda. Kebijakan Privasi ini
                menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan
                melindungi informasi pribadi Anda ketika Anda menggunakan layanan
                Perpusmu (&quot;Layanan&quot;).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                2. Informasi yang Kami Kumpulkan
              </h2>
              <p>Kami mengumpulkan beberapa jenis informasi, termasuk:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  <strong>Informasi Akun:</strong> Nama lengkap, alamat email, NIM/NIDN,
                  fakultas, dan program studi
                </li>
                <li>
                  <strong>Dokumen Akademik:</strong> Karya tulis, tugas, dan dokumen
                  lain yang Anda unggah untuk pengecekan keaslian
                </li>
                <li>
                  <strong>Data Penggunaan:</strong> Informasi tentang bagaimana Anda
                  mengakses dan menggunakan Layanan, termasuk waktu akses dan fitur
                  yang digunakan
                </li>
                <li>
                  <strong>Informasi Perangkat:</strong> Jenis perangkat, sistem operasi,
                  dan browser yang digunakan untuk mengakses Layanan
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                3. Penggunaan Informasi
              </h2>
              <p>Informasi yang kami kumpulkan digunakan untuk:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Menyediakan, mengoperasikan, dan memelihara Layanan</li>
                <li>Memproses dan menganalisis dokumen yang diunggah untuk pengecekan keaslian</li>
                <li>Mengelola akun pengguna dan menyediakan dukungan</li>
                <li>Mengirimkan pemberitahuan terkait Layanan</li>
                <li>Meningkatkan dan mengembangkan fitur Layanan</li>
                <li>Memenuhi kewajiban hukum dan peraturan yang berlaku</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                4. Penyimpanan dan Keamanan Data
              </h2>
              <p>
                Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang
                sesuai untuk melindungi informasi pribadi Anda dari akses, penggunaan,
                atau pengungkapan yang tidak sah. Data disimpan pada server yang aman
                dan dienkripsi selama transmisi.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                5. Berbagi Informasi
              </h2>
              <p>
                Kami tidak menjual, memperdagangkan, atau menyewakan informasi pribadi
                Anda kepada pihak ketiga. Kami dapat membagikan informasi Anda dalam
                kondisi berikut:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Dengan persetujuan Anda</li>
                <li>Kepada pihak universitas yang berwenang untuk keperluan akademik</li>
                <li>Untuk memenuhi kewajiban hukum atau perintah pengadilan</li>
                <li>Untuk melindungi hak, properti, atau keselamatan Perpusmu dan penggunanya</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                6. Hak Pengguna
              </h2>
              <p>Anda memiliki hak untuk:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Mengakses informasi pribadi yang kami simpan tentang Anda</li>
                <li>Meminta koreksi atas informasi yang tidak akurat</li>
                <li>Meminta penghapusan informasi pribadi Anda, dengan mempertimbangkan kewajiban hukum dan akademik</li>
                <li>Menarik persetujuan atas penggunaan data Anda</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                7. Cookie dan Teknologi Pelacakan
              </h2>
              <p>
                Layanan kami menggunakan cookie dan teknologi pelacakan serupa untuk
                meningkatkan pengalaman pengguna, menganalisis penggunaan Layanan, dan
                menjaga keamanan sesi login Anda. Anda dapat mengatur preferensi cookie
                melalui pengaturan browser Anda.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                8. Retensi Data
              </h2>
              <p>
                Kami menyimpan informasi pribadi Anda selama diperlukan untuk memenuhi
                tujuan yang diuraikan dalam kebijakan ini, atau selama diwajibkan oleh
                hukum yang berlaku. Dokumen akademik dapat disimpan sesuai dengan
                kebijakan retensi universitas.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                9. Perubahan Kebijakan
              </h2>
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
                Perubahan akan dipublikasikan di halaman ini dengan tanggal pembaruan
                yang diperbarui. Kami akan memberitahu Anda tentang perubahan material
                melalui pemberitahuan di Layanan.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary-dark dark:text-white">
                10. Kontak
              </h2>
              <p>
                Jika Anda memiliki pertanyaan atau kekhawatiran mengenai Kebijakan
                Privasi ini atau praktik penanganan data kami, silakan hubungi kami
                melalui email di{" "}
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
