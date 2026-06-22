# Otomasi Pengecekan Turnitin via Browser Automation (RPA)

**Tanggal:** 2026-06-22
**Status:** Fase 1 TERVALIDASI end-to-end di live Turnitin (2026-06-22) — login headless, Quick Submit, baca skor, tulis hasil ke DB semuanya berhasil.
**Konteks:** Sistem Perpusmu UNISMUH. Lanjutan dari `2026-05-20-plagiarism-manual-workflow-design.md` — alur manual itu menjadi **fallback**, sementara bot mengotomasi langkah pengecekan Turnitin.

## Latar Belakang Keputusan

Empat jalur integrasi Turnitin dievaluasi:

| Jalur | Kenapa tidak dipakai |
|---|---|
| **TCA REST API** | Butuh API key — institusi belum punya. |
| **LTI 1.3 (custom)** | Registrasi self-service Turnitin terkunci ke vendor LMS (dropdown: Blackboard/Canvas/Moodle/…); app custom tidak didukung tanpa program partner. |
| **LTI 1.1 ("LTI API")** | Generik & mungkin, tapi teknologi legacy (OAuth 1.0) + tetap submit via iframe. |
| **Browser automation (RPA)** | **DIPILIH.** Tanpa API key, tanpa daftar LMS, memakai akun resmi, dan memberi skor **+ PDF + arsip file**. |

**Risiko diterima sadar:** mengotomasi login/submit umumnya melanggar ToS Turnitin; akun institusi berisiko di-suspend (berdampak ke semua pengguna akun). Karena itu **fallback manual wajib selalu tersedia**, dan keputusan final menunggu hasil **testing** ("kalau kurang bagus baru diganti").

## Tujuan

Mengganti langkah manual instruktur (cek di Turnitin + upload hasil) dengan **bot**:

1. Mahasiswa upload dokumen ke app (alur existing, file tersimpan di `uploads/`).
2. Bot mengambil file itu → submit ke Turnitin (**Quick Submit**) memakai akun instruktur resmi.
3. Bot menunggu report jadi → membaca **skor similarity** + mengunduh **PDF report**.
4. Bot menyimpan hasil ke `Submission` (mengisi field yang sama seperti endpoint `/result` manual) → menerapkan `SimilarityRule` → status `REVIEWED`/`FLAGGED`.

Mahasiswa **tidak pernah** melihat UI Turnitin. Tanpa API key. Tanpa iframe.

## Asumsi yang Disetujui

1. Pendekatan **browser automation** dengan **Playwright** (Chromium headless) — lebih andal dari Puppeteer (auto-wait, persist session).
2. **Satu** akun instruktur resmi; sesi (`storageState`) disimpan & dipakai ulang (tidak login tiap job).
3. Pemicu utama: **mahasiswa self-service**. Instruktur (`/result`) & admin tetap bisa intervensi manual.
4. File mahasiswa **tetap disimpan** di `uploads/` — dibutuhkan untuk diumpankan ke bot. (Membatalkan opsi "tanpa arsip" yang sempat dibahas untuk jalur LTI.)
5. Output = similarity score + PDF report, disimpan persis seperti alur manual.
6. **Worker** berjalan sebagai proses Node **terpisah**, bukan di dalam API route Next.js.
7. Antrian job berbasis **DB** (tanpa Redis) untuk volume rendah; bisa di-upgrade ke BullMQ nanti.

## Arsitektur

```
┌────────────┐  enqueue   ┌──────────────┐   poll/claim   ┌─────────────────────┐
│ Next.js app│ ─────────► │  TurnitinJob │ ◄───────────── │  Worker (Node +     │
│ (API route)│            │  (tabel DB)  │                │  Playwright/Chromium)│
└────────────┘            └──────────────┘                └──────────┬──────────┘
      ▲                                                              │ submit + ambil hasil
      │ update Submission (skor, PDF, status)                        ▼
      └──────────────────────────────────────────────────  ┌─────────────────┐
                                                            │   Turnitin web  │
                                                            │  (Quick Submit) │
                                                            └─────────────────┘
```

**State machine (perluasan dari spec manual):**

```
PENDING ─(enqueue auto-check)─► PROCESSING ─(bot: skor ≤ batas)─► REVIEWED
                                     │       ─(bot: skor > batas)─► FLAGGED
                                     └─(bot gagal, max retry)─► tetap PROCESSING + autoCheckError
                                                                  └► fallback: instruktur /result manual
```

**Kenapa worker terpisah:** report Turnitin butuh beberapa menit; sesi browser harus persisten & hidup lama. API route Next.js (request-scoped) tidak cocok untuk ini.

## Modul (didesain untuk isolasi & mudah diperbaiki)

| Modul | Tugas tunggal |
|---|---|
| `lib/turnitin/selectors.ts` | **Semua** selector + URL Turnitin terpusat. UI Turnitin berubah → ubah 1 file ini saja. |
| `lib/turnitin/session.ts` | Muat/simpan `storageState`, `ensureLoggedIn()`, deteksi sesi kadaluarsa. |
| `lib/turnitin/quick-submit.ts` | Submit satu file → kembalikan `paperId`. |
| `lib/turnitin/report.ts` | Poll status report, baca skor %, unduh PDF. |
| `lib/turnitin/queue.ts` | `enqueue` / `claimNext` (locking) / `complete` / `fail` job di DB. |
| `lib/turnitin/process-job.ts` | Orkestrasi 1 job: session → submit → poll → simpan ke Submission → apply rule. |
| `scripts/turnitin-worker.ts` | Loop worker: ambil job, panggil `process-job`, jeda manusiawi. |
| `scripts/turnitin-bootstrap.ts` | Login **headed** sekali (termasuk 2FA) → simpan `storageState`. |

## Perubahan Schema (Prisma)

**Model baru `TurnitinJob`:**
- `id`, `submissionId` (FK Submission, index), `status TurnitinJobStatus @default(QUEUED)`
- `attempts Int @default(0)`, `maxAttempts Int @default(3)`
- `turnitinPaperId String?`, `lastError String?`, `errorCode String?`
- `lockedAt DateTime?` (untuk klaim worker), `startedAt`, `finishedAt`, `createdAt`, `updatedAt`
- Index `[status]`, `[submissionId]`

**Enum baru `TurnitinJobStatus`:** `QUEUED`, `RUNNING`, `WAITING_REPORT`, `SUCCEEDED`, `FAILED`, `CANCELLED`

**`Submission` tambah:**
- `turnitinPaperId String?`
- `autoCheckError String?`
- `autoCheckedAt DateTime?`

Skor + report tetap memakai field existing (`similarityScore`, `reportUrl`, `reportFileName`, `reportFileSize`, `reportMimeType`, `reportUploadedAt`, `status`). `reviewedBy` dibiarkan `null` untuk hasil bot (atau diisi user sistem khusus di Fase 2); `reviewedAt` diisi.

**Penyimpanan sesi:** file `uploads/.turnitin/state.json` (di luar repo, gitignored, permission 600) untuk Fase 1. Pertimbangan enkripsi-at-rest dicatat; pindah ke DB terenkripsi bila perlu (Fase 2).

## API

| Endpoint | Method | Role | Fungsi |
|---|---|---|---|
| `/api/submissions/[id]/auto-check` | POST | STUDENT(own) / INSTRUCTOR(assigned) / ADMIN | Enqueue: `PENDING → PROCESSING` + buat `TurnitinJob(QUEUED)`. Idempotent: tolak bila sudah ada job aktif. |
| `/api/submissions/[id]/auto-check` | GET | STUDENT(own) / INSTRUCTOR / ADMIN | Status job (untuk polling UI). |
| `/api/submissions/[id]/result` | POST (multipart) | INSTRUCTOR | **Fallback manual** (existing, tidak diubah). |

Worker **bukan** endpoint HTTP — proses terpisah yang membaca tabel `TurnitinJob`.

## Alur Detail (happy path)

```
1. Mahasiswa klik "Cek Plagiasi (otomatis)" → POST /auto-check
2. App: Submission PENDING → PROCESSING; buat TurnitinJob(QUEUED); audit log
3. Worker claimNext() → job RUNNING (lockedAt diisi)
4. session.ensureLoggedIn() (pakai storageState; kalau invalid → FAIL reason=SESSION)
5. quick-submit: buka Quick Submit → upload file dari uploads/ → isi judul+nama → submit
6. Simpan turnitinPaperId; job → WAITING_REPORT
7. report.poll(): cek berkala sampai skor muncul (≤ TURNITIN_MAX_WAIT_MIN)
8. Baca skor %; unduh PDF → simpan ke uploads/reports (pakai lib/upload.ts)
9. Update Submission: similarityScore, reportFileName/…, autoCheckedAt
10. Apply SimilarityRule prodi → status REVIEWED (≤ batas) / FLAGGED (> batas)
11. Job → SUCCEEDED; audit log; (Fase 2: notif WA ke mahasiswa)
12. UI mahasiswa (polling) menampilkan skor + tombol "Lihat Report" (download PDF)
```

## Sesi & 2FA

- **Bootstrap sekali**: jalankan `scripts/turnitin-bootstrap.ts` (browser headed). Operator login manual termasuk 2FA/OTP → `storageState` disimpan.
- Worker memakai `storageState`. `ensureLoggedIn()` memverifikasi sesi; bila kadaluarsa **dan** akun ber-2FA → job `FAILED(SESSION)` + alert (jangan paksa login otomatis). Bila akun tanpa 2FA → boleh re-login otomatis dari env.
- **Status 2FA akun belum dikonfirmasi** → desain bootstrap manual menanganinya secara generik (aman untuk kedua kasus).

## Error Handling & Fallback

| Kegagalan | Penanganan |
|---|---|
| Sesi invalid/expired | `FAILED(SESSION)` → alert admin → bootstrap ulang. Submission tetap PROCESSING (fallback manual tersedia). |
| Selector tak ketemu (UI berubah) | Screenshot debug + `FAILED(SELECTOR)` + alert → perbaiki `selectors.ts`. |
| File ditolak Turnitin (format/ukuran) | `FAILED(REJECTED)` + simpan pesan → notify mahasiswa/instruktur. |
| Report timeout (> max wait) | Tetap `WAITING_REPORT` & re-poll; bila lewat batas keras → `FAILED(TIMEOUT)`. |
| Network/transient | Retry exponential backoff sampai `maxAttempts`, lalu `FAILED`. |
| **Semua kegagalan** | Instruktur dapat mengambil alih lewat `/result` manual. |

## Keamanan

- Kredensial Turnitin (env) & `storageState` (file) = akses **penuh** ke akun → rahasia tinggi. `.gitignore`, permission 600, **tidak pernah** di-commit/di-log.
- Hanya owner / instruktur-assigned / admin yang boleh enqueue.
- `AuditLog` (existing) untuk tiap enqueue + hasil job.
- Submission diproses **serial** (concurrency 1) + jeda manusiawi.

## Pacing / Anti-deteksi (jujur, terbatas)

Serial, satu akun, jeda acak kecil antar aksi, user-agent realistis, tanpa paralelisme. **Catatan jujur:** ini mengurangi tapi **tidak menghilangkan** risiko deteksi.

## Risiko & Mitigasi (eksplisit)

1. **ToS / suspend akun institusi** (dampak luas) → volume rendah, pacing, monitoring, fallback manual; siap pindah ke TCA/LTI bila bermasalah.
2. **Fragility selector** (UI Turnitin berubah) → `selectors.ts` terpusat + screenshot debug + alert.
3. **2FA/CAPTCHA memblok total** → bootstrap manual; bila CAPTCHA muncul tiap kali, pendekatan ini **gugur** → kembali ke manual/LTI. (Inilah alasan "testing dulu".)
4. **Beban maintenance** berkelanjutan.

## Scope

**Fase 1 (spec ini):** bootstrap sesi, queue + worker, Quick Submit happy-path, simpan skor + PDF, apply `SimilarityRule`, fallback manual, enqueue dari UI mahasiswa + status polling.

**Fase 2 (nanti):** retry canggih, multi-akun + rotasi, dashboard monitoring job (admin), notifikasi WA otomatis saat selesai, dukungan alur kelas+assignment (bila Quick Submit tidak aktif), pertimbangan ulang honorarium instruktur saat pengecekan otomatis.

## Env Vars Baru

```
TURNITIN_EMAIL=
TURNITIN_PASSWORD=
TURNITIN_BASE_URL=https://www.turnitin.com
TURNITIN_STATE_PATH=uploads/.turnitin/state.json
TURNITIN_HEADLESS=true
TURNITIN_MAX_WAIT_MIN=15
TURNITIN_POLL_INTERVAL_SEC=30
```

## Dependencies Baru

- `playwright` + browser Chromium (`npx playwright install chromium`).

## Testing

- **Unit:** logika queue (enqueue/claim/locking), penerapan `SimilarityRule` (skor → REVIEWED/FLAGGED), resolusi path file. (Logika selector → E2E, bukan unit.)
- **Integration:** worker memproses job dummy dengan modul `session`/`quick-submit`/`report` di-mock → memastikan `Submission` terupdate benar + status job benar.
- **Manual E2E:** bootstrap sesi → upload dokumen contoh → enqueue → verifikasi skor + PDF tersimpan, status benar; plus skenario gagal (sesi invalid, file ditolak).

**Checklist Manual:**
- Mahasiswa enqueue → Submission PROCESSING, job QUEUED→…→SUCCEEDED
- Skor tersimpan, PDF bisa diunduh mahasiswa
- Skor > batas `SimilarityRule` → FLAGGED + alasan; ≤ batas → REVIEWED
- Sesi invalid → job FAILED(SESSION), instruktur masih bisa `/result` manual
- Auth boundary: mahasiswa lain tidak bisa enqueue/lihat job submission orang lain
- Kredensial/`storageState` tidak ter-commit & tidak ter-log

## Hal yang Harus Diverifikasi Saat Implementasi (di-capture saat run manual pertama)

- Apakah akun memakai 2FA/CAPTCHA saat login.
- Apakah **Quick Submit** aktif; bila tidak → alur kelas + assignment.
- URL login + Quick Submit + selector aktual (di-capture saat bootstrap).
- Waktu rata-rata report jadi → kalibrasi `TURNITIN_MAX_WAIT_MIN`.
- Setting repository (no-repository?) sesuai kebijakan institusi.

## Status Verifikasi (2026-06-22, live Turnitin — akun ujicoba)

Dipetakan lewat run discovery nyata + dua test end-to-end:

- ✅ **Login headless berhasil** — tidak ada blok reCAPTCHA pada login bersih (akun instruktur). Selector login terverifikasi: `#email`, `#password` (`name=user_password`), submit `input[value="Log in"]`.
- ✅ **Quick Submit aktif** untuk akun ini. Alur terverifikasi: `t_home.asp` → `a.sn_quick_submit` → `a.submit_paper_button` → `t_custom_search.asp` (centang `compare_to_database`, `submit_papers_to=0` no-repository) → `t_submit.asp` (`#author_first`/`#author_last`/`#title`/`input[name=userfile]`) → `#upload-btn` → `#confirm-btn`.
- ✅ **Baca skor** dari inbox via baris yang judulnya mengandung token unik → `span.or-percentage`.
- ✅ **Test jalur produksi penuh** (queue → worker `processJob` → `applyTurnitinResult` → DB): Submission menjadi `REVIEWED`, `similarityScore` tersimpan, job `SUCCEEDED`.
- 🔓 **2FA:** akun ujicoba tidak meminta 2FA pada run ini. Bila akun produksi meminta 2FA, pakai `npm run turnitin:bootstrap`.
- ⏳ **Unduh PDF report:** ditunda ke Fase 2 (skor sudah cukup untuk Fase 1; report dilihat via UI Turnitin bila perlu).
- ⚠️ **Pagination inbox:** pencocokan baris mengandalkan paper ada di halaman inbox aktif (umumnya terbaru di atas). Handling pagination = Fase 2.

Skrip diagnostik untuk re-kalibrasi bila UI Turnitin berubah: `scripts/turnitin-discover.ts`, `scripts/turnitin-check-row.ts`, `scripts/turnitin-test-submit.ts`, `scripts/turnitin-test-job.ts`.

## Dampak ke Fitur Lain

- **Rekap/honorarium instruktur:** bila bot yang memeriksa, `reviewedBy`/honorarium perlu dipikir ulang (keputusan bisnis — di luar scope spec ini).
- **Notifikasi WA (wa.me) existing:** bisa dipicu otomatis saat job selesai (Fase 2).
