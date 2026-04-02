# Perpusmu

Sistem manajemen pengajuan skripsi dan pengecekan plagiarisme untuk Universitas Muhammadiyah Makassar (UNISMUH).

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (Radix UI)
- **Database:** PostgreSQL + Prisma ORM
- **State Management:** Zustand
- **Autentikasi:** JWT (jose)
- **HTTP Client:** Axios
- **Integrasi Eksternal:** GraphQL API Universitas (`sicekcok.if.unismuh.ac.id/graphql`)
- **Grafik & Visualisasi:** Recharts
- **Validasi Form:** React Hook Form + Zod

## Fitur

### Mahasiswa

- Mengajukan skripsi untuk pengecekan plagiarisme
- Melihat hasil similarity
- Mengecek status pembayaran perpustakaan
- Verifikasi nomor WhatsApp

### Dosen

- Mereview pengajuan skripsi mahasiswa
- Memberikan feedback
- Melihat analytics dan statistik

### Admin

- Manajemen pengguna (mahasiswa, dosen)
- Manajemen program studi
- Pengaturan aturan similarity
- Persetujuan ujian
- Verifikasi pembayaran

### Keamanan

- Autentikasi JWT dengan middleware route protection
- Rate limiting login (5 percobaan per 15 menit per IP)
- Security headers
- Error boundaries

## Prasyarat

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- [PostgreSQL](https://www.postgresql.org/)
- [pnpm](https://pnpm.io/)

## Cara Menjalankan

1. **Clone repository**

   ```bash
   git clone https://github.com/devnolife/turnitin-dashboard-nextjs.git
   cd turnitin-dashboard-nextjs
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Konfigurasi environment variables**

   ```bash
   cp .env.example .env
   ```

   Isi nilai-nilai yang diperlukan pada file `.env` (lihat bagian [Environment Variables](#environment-variables)).

4. **Setup database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   Untuk mengisi data awal (opsional):

   ```bash
   npx prisma db seed
   ```

5. **Jalankan development server**

   ```bash
   pnpm dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser.

## Environment Variables

Buat file `.env` berdasarkan `.env.example`. Variabel yang diperlukan:

| Variabel        | Deskripsi                                |
| --------------- | ---------------------------------------- |
| `DATABASE_URL`  | Connection string PostgreSQL             |
| `JWT_SECRET`    | Secret key untuk signing JWT token       |
| `GRAPHQL_URL`   | URL GraphQL API universitas              |

## Struktur Proyek

```
├── app/                  # Next.js App Router
│   ├── api/              # API routes (auth, admin, student, instructor, dll.)
│   ├── auth/             # Halaman login
│   ├── dashboard/        # Dashboard (admin, dosen, mahasiswa)
│   ├── payment/          # Halaman pembayaran
│   └── whatsapp-verification/
├── components/           # Komponen React
│   ├── auth/             # Komponen autentikasi
│   ├── dashboard/        # Komponen dashboard
│   ├── payment/          # Komponen pembayaran
│   └── ui/               # Komponen UI (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility dan shared logic
│   ├── api/              # API client (Axios)
│   ├── auth/             # GraphQL client, token verification
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript type definitions
├── prisma/               # Schema database dan seed
├── public/               # Aset statis
├── styles/               # File styling
└── middleware.ts          # Middleware autentikasi & route protection
```
