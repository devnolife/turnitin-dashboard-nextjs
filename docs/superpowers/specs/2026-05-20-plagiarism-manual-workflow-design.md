# Alur Pengecekan Plagiarisme Manual via Instruktur

**Tanggal:** 2026-05-20
**Status:** Approved
**Konteks:** Sistem Perpusmu UNISMUH — Turnitin API belum tersedia, jadi instruktur menjembatani secara manual.

## Tujuan

Memungkinkan mahasiswa mengirim dokumen tugas akhir untuk dicek plagiarisme, instruktur mengambilnya, melakukan pengecekan manual di Turnitin (di luar aplikasi), lalu mengembalikan hasil PDF + skor similarity ke mahasiswa melalui aplikasi.

## Asumsi yang Disetujui

1. Granularitas **hybrid** — mengikuti `SimilarityRule.ruleType` per prodi (`PER_CHAPTER` vs `PER_EXAM`).
2. Mahasiswa sudah ter-link ke instruktur via `User.instructorId` (admin assign).
3. Storage **lokal** di folder `uploads/` (di luar repo, gitignored). Path absolut di `UPLOAD_DIR` env. Tidak diserve via `/public` — selalu via API yang memvalidasi auth.
4. Status baru `PROCESSING` + tambahan kolom di `Submission`.
5. **History resubmit** disimpan dengan `parentSubmissionId` + `version`.

## Arsitektur State Machine

```
PENDING ──(instructor claim)──► PROCESSING ──(upload result)──► REVIEWED
                                              │
                                              └─(reject)──────► FLAGGED ──(student resubmit)──► (Submission baru, version+1, parentSubmissionId terisi, status PENDING)
```

## Perubahan Schema

**Submission tambah:**
- `chapter String?` — `BAB_1`..`BAB_N` atau `FULL`
- `examType ExamType?`
- `fileName String`, `fileSize Int`, `fileMimeType String` (dipindah dari documentUrl)
- `reportFileName String?`, `reportFileSize Int?`, `reportMimeType String?`, `reportUploadedAt DateTime?`
- `rejectionReason String?`
- `version Int @default(1)`
- `parentSubmissionId String?` + relation self
- Index `[userId, examType]`, `[status]`, `[reviewedBy]`

**Enum SubmissionStatus tambah:** `PROCESSING`

`documentUrl` & `reportUrl` jadi optional (legacy) — pakai endpoint `/api/submissions/[id]/file` dan `/report`.

## API

| Endpoint | Method | Role | Fungsi |
|---|---|---|---|
| `/api/submissions/upload` | POST (multipart) | STUDENT | Buat submission baru |
| `/api/submissions/[id]/file` | GET | STUDENT(own) / INSTRUCTOR(assigned) | Download file mahasiswa |
| `/api/submissions/[id]/claim` | POST | INSTRUCTOR | PENDING → PROCESSING |
| `/api/submissions/[id]/result` | POST (multipart) | INSTRUCTOR | Upload report + similarity + status |
| `/api/submissions/[id]/report` | GET | STUDENT(own) / INSTRUCTOR | Download report PDF |
| `/api/instructor/submissions/queue` | GET | INSTRUCTOR | Antrian dengan tab status |
| `/api/student/submissions/summary` | GET | STUDENT | Rangkuman per bab/ujian |

## Validasi

- File: pdf/docx, max 20MB
- Tidak boleh ada submission aktif (PENDING/PROCESSING) untuk (userId, examType, chapter) yang sama
- Similarity 0-100; jika FLAGGED → `rejectionReason` wajib
- Instruktur hanya bisa beraksi pada mahasiswa dengan `instructorId = auth.userId`

## UI

**Student:** `/dashboard/student/submissions` — tabel + tombol upload, modal detail (download report, status, alasan reject, tombol resubmit jika FLAGGED).

**Instructor:** `/dashboard/instructor/submissions` — tab `Antrian | Diproses | Selesai`, action button per row, modal upload hasil dengan auto-suggest status berdasarkan batas `SimilarityRule`.

## Testing Manual Checklist

- Student upload → muncul di queue instructor yang ter-assign
- Instructor claim → status PROCESSING, student lihat "Sedang diperiksa"
- Instructor result REVIEWED → student bisa download report
- Instructor result FLAGGED → student lihat alasan + tombol resubmit (membuat row baru, version=2)
- Auth boundary: student lain tidak bisa download file/report
- Storage: file tersimpan di UPLOAD_DIR, tidak accessible langsung via URL publik
