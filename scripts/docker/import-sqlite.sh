#!/usr/bin/env bash
# Copy everything from backend/db.sqlite3 (trips, leads, CRM users, gallery...) into the
# Docker Postgres. Run once on a NEW server, before the first `docker compose up -d`.
#
#   ./scripts/docker/import-sqlite.sh [path/to/db.sqlite3]
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC="${1:-backend/db.sqlite3}"
[ -f "$SRC" ] || { echo "No SQLite file at $SRC"; exit 1; }
SRC_DIR="$(cd "$(dirname "$SRC")" && pwd)"
SRC_FILE="$(basename "$SRC")"
mkdir -p backups
OUT="backups/sqlite-export-$(date +%Y%m%d-%H%M%S).json"

run() { docker compose run --rm --no-deps --entrypoint "" "$@"; }

echo "1/5 Building backend image and starting Postgres..."
docker compose build backend >/dev/null
docker compose up -d db
until docker compose exec -T db pg_isready -q; do sleep 1; done

echo "2/5 Exporting $SRC ..."
run -e DATABASE_URL="sqlite:////import/$SRC_FILE" -v "$SRC_DIR:/import:ro" backend \
  python manage.py dumpdata --natural-foreign --natural-primary \
  -e contenttypes -e auth.permission -e admin.logentry -e sessions > "$OUT"
echo "    saved $OUT ($(du -h "$OUT" | cut -f1))"

echo "3/5 Creating tables in Postgres..."
run backend python manage.py migrate --no-input >/dev/null

echo "4/5 Checking Postgres is empty..."
COUNT=$(run backend python manage.py shell -c "from adventures.models import Trip; print(Trip.objects.count())" | tail -1)
if [ "$COUNT" != "0" ]; then
  echo "    Postgres already has $COUNT trips. Refusing to import over live data."
  exit 1
fi

echo "5/5 Importing..."
run -v "$PWD/backups:/import:ro" backend python manage.py loaddata "/import/$(basename "$OUT")"

echo "Done. Start everything with: docker compose up -d --build"
