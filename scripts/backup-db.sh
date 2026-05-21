#!/usr/bin/env bash
# Backup PostgreSQL database. Lihat docs/OPERATIONS.md untuk setup.
set -euo pipefail
ENV_FILE="${ENV_FILE:-/etc/turnitin-backup.env}"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

: "${DATABASE_URL:?DATABASE_URL belum diset}"
: "${BACKUP_DIR:=/var/backups/turnitin}"
: "${RETENTION_DAYS:=14}"

STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"
OUT="$BACKUP_DIR/turnitin-$STAMP.sql.gz"

echo "[backup] dumping to $OUT"
pg_dump --no-owner --no-privileges --format=plain "$DATABASE_URL" | gzip -9 > "$OUT"

if [ "$(stat -c%s "$OUT")" -lt 1024 ]; then
  echo "[backup] ERROR: backup file terlalu kecil, kemungkinan gagal" >&2
  exit 1
fi

if [ -n "${S3_BUCKET:-}" ] && command -v aws >/dev/null 2>&1; then
  echo "[backup] uploading to s3://$S3_BUCKET/"
  aws ${S3_ENDPOINT:+--endpoint-url "$S3_ENDPOINT"} s3 cp "$OUT" "s3://$S3_BUCKET/$(basename "$OUT")"
fi

find "$BACKUP_DIR" -name 'turnitin-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
echo "[backup] selesai: $OUT"
