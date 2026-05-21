# Operasional Produksi

## 1. Backup database

Skrip: `scripts/backup-db.sh` — dump PostgreSQL, gzip, opsional upload ke S3, rotasi otomatis.

### Setup di server (Linux)

```bash
sudo install -m 0755 scripts/backup-db.sh /usr/local/bin/turnitin-backup
sudo tee /etc/turnitin-backup.env >/dev/null <<'EOF'
DATABASE_URL=postgresql://user:pass@host:5401/turnitin
BACKUP_DIR=/var/backups/turnitin
RETENTION_DAYS=14
# Opsional remote:
# S3_BUCKET=turnitin-backup
# S3_ENDPOINT=https://s3.wasabisys.com
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
EOF
sudo chmod 600 /etc/turnitin-backup.env

# Cron tiap hari pukul 02:00
echo '0 2 * * * root /usr/local/bin/turnitin-backup >> /var/log/turnitin-backup.log 2>&1' | sudo tee /etc/cron.d/turnitin-backup
```

### Restore

```bash
# 1. Stop service Next.js
sudo systemctl stop turnitin

# 2. Drop & recreate DB (HATI-HATI)
psql "$DATABASE_URL_ADMIN" -c "DROP DATABASE turnitin;"
psql "$DATABASE_URL_ADMIN" -c "CREATE DATABASE turnitin OWNER turnitin_user;"

# 3. Restore
gunzip -c /var/backups/turnitin/turnitin-YYYYMMDD-HHMMSS.sql.gz | psql "$DATABASE_URL"

# 4. Start service
sudo systemctl start turnitin
```

### Verifikasi rutin

- Setelah setup, jalankan manual sekali: `sudo turnitin-backup`
- Tiap minggu, lakukan **restore test** ke DB staging — backup yang tidak pernah direstore = backup yang belum tentu valid.

## 2. Audit log

Setiap aksi sensitif tercatat di tabel `audit_logs` via `lib/audit.ts`. Endpoint admin:

```
GET /api/admin/audit-logs?action=admin.password_reset&page=1&limit=50
```

Filter yang didukung: `action`, `actorId`, `targetType`, `targetId`.

Aksi yang dicatat saat ini:
- `auth.password_changed`
- `admin.password_reset`
- `admin.complaint_responded`
- `admin.pricing_changed`

Tambahkan aksi lain dengan memanggil `audit(...)` dari endpoint baru.

## 3. Notifikasi WhatsApp

Belum diintegrasikan. Saat siap, opsi:

1. **Fonnte** (paling murah untuk Indonesia, ~Rp 500/pesan): set `FONNTE_TOKEN` env, POST ke `https://api.fonnte.com/send`.
2. **WAHA / wppconnect** (self-hosted, gratis tapi rawan banned): jalankan kontainer + REST API.
3. **WhatsApp Business API resmi via BSP** (Twilio/360dialog/Meta langsung): paling mahal, paling stabil.

Direkomendasikan: bungkus di `lib/notify.ts` dengan interface generik, lalu panggil dari:
- After admin reset password (kirim password sementara ke nomor WA mahasiswa)
- After submission status berubah ke REVIEWED/FLAGGED
- After complaint dijawab
- After akun mahasiswa di-set GRADUATED

## 4. Rate limiting

Saat ini in-memory fallback (per-process). Untuk multi-instance / serverless, set:

```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Endpoint dengan rate limit:
| Endpoint | Limit | Window |
|---|---|---|
| POST /auth/login | 5 | 15 menit per IP |
| POST /auth/change-password | 5 | 15 menit per user |
| POST /admin/users/[id]/reset-password | 30 | 1 jam per admin |
| POST /complaints | 5 | 1 jam per user |
| POST /submissions/upload | 20 | 1 jam per user |

## 5. Logging produksi

`lib/logger.ts` otomatis:
- Di production: JSON satu baris per log + level (`info`/`warn`/`error`), `debug` di-suppress.
- Redact otomatis field yang namanya match `/password|token|secret|cookie|authorization|api[-_]?key|session/i`.

Untuk forward ke layanan eksternal:
- **Sentry**: install `@sentry/nextjs`, jalankan `npx @sentry/wizard@latest -i nextjs`. Sentry akan otomatis menangkap error & exception API.
- **Logtail/BetterStack/Axiom**: stdout JSON sudah cocok untuk di-tail oleh agent (vector/fluent-bit/promtail) di host.

## 6. Security headers

Diset di `next.config.mjs`:
- HSTS (production only)
- CSP (script: 'self' + 'unsafe-inline'; tighten ke nonce kalau sempat)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: kamera/mic/geolokasi off
