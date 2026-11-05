#!/bin/sh
# Nightly Postgres dump (runs inside the `backup` container). Restore with:
#   gunzip -c backups/<file>.sql.gz | docker compose exec -T db psql -U $POSTGRES_USER -d $POSTGRES_DB
set -eu
KEEP="${BACKUP_KEEP_DAYS:-14}"
mkdir -p /backups
while true; do
  STAMP=$(date +%Y-%m-%d_%H%M)
  FILE="/backups/spirit_${STAMP}.sql.gz"
  if pg_dump --no-owner --clean --if-exists | gzip > "${FILE}.tmp"; then
    mv "${FILE}.tmp" "$FILE"
    echo "[backup] wrote $FILE ($(du -h "$FILE" | cut -f1))"
  else
    rm -f "${FILE}.tmp"
    echo "[backup] pg_dump FAILED" >&2
  fi
  find /backups -name 'spirit_*.sql.gz' -mtime +"$KEEP" -delete
  sleep 86400
done
