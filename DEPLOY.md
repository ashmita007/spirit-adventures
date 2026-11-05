# Deploying Spirit Adventures with Docker (one VPS)

Everything runs from `docker-compose.yml`:

| Service | What it does |
|---|---|
| `caddy` | Public entry on ports 80/443. Gets and renews the HTTPS certificate automatically. Sends `/api`, `/admin`, `/static` to Django, everything else to Next.js. |
| `frontend` | Next.js: website, owner portal (`/owner`), sales CRM (`/crm`) |
| `backend` | Django API + admin (gunicorn). Migrates, creates the owner login and syncs the CRM on start. |
| `db` | PostgreSQL 16, private to the server, data in the `postgres_data` volume |
| `backup` | Dumps the database every 24 h to `./backups/`, keeps 14 days |

Photos and videos live on Cloudinary, not on the server.

## 1. Server

- Ubuntu 22.04/24.04 VPS, **2 vCPU / 4 GB RAM** or more (the Next.js build needs ~2 GB).
- Install Docker: `curl -fsSL https://get.docker.com | sh`
- Firewall: allow 22, 80, 443 only (`ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable`).
- DNS: `A` records for `spiritadventures.in` **and** `www.spiritadventures.in` → the VPS IP.

## 2. First deploy

```bash
git clone <repo> spirit && cd spirit
cp .env.production.example .env
nano .env          # DOMAIN, SECRET_KEY, POSTGRES_PASSWORD, owner login, CLOUDINARY_URL

# Optional, once: bring over the current data (trips, leads, CRM users, gallery)
./scripts/docker/import-sqlite.sh backend/db.sqlite3

docker compose up -d --build
docker compose ps            # all services "healthy" / "running"
```

Open `https://<DOMAIN>` — the certificate appears within a minute. Team login: `https://<DOMAIN>/owner/login`.

Fresh server without old data? Set `SEED_DEMO_DATA=1` for the first start to load the demo trips
(it never touches a database that already has trips).

## 3. Everyday commands

```bash
git pull && docker compose up -d --build     # deploy an update (migrations run automatically)
docker compose logs -f backend               # live logs (frontend / caddy / db / backup)
docker compose exec backend python manage.py createsuperuser
docker compose restart backend
ls backups/                                  # nightly database dumps
```

Restore a backup:

```bash
gunzip -c backups/spirit_YYYY-MM-DD_HHMM.sql.gz | docker compose exec -T db psql -U spirit -d spirit_adventures
```

Copy `backups/` off the server regularly (e.g. `rclone` to Google Drive) — a backup on the same disk
does not survive a lost server.

## Notes

- `NEXT_PUBLIC_*` values and the domain are baked into the frontend at build time: after changing them run
  `docker compose up -d --build frontend`.
- Secrets stay in `.env` on the server; it is git-ignored and never copied into the images.

---

## 4. Single-Service Deployment (Option B: One Container on Render / Railway / Fly.io / VPS)

If you prefer deploying the entire platform (Next.js frontend + Django API/Admin + SQLite or Postgres) as a **single unified container**, use the root `Dockerfile` and `start.sh`:

### Run via Docker
```bash
docker build -t spirit-adventures .
docker run -p 3000:3000 \
  -e SECRET_KEY="your-secret-key" \
  -e DJANGO_SUPERUSER_EMAIL="admin@spiritadventures.in" \
  -e DJANGO_SUPERUSER_PASSWORD="SecurePassword123" \
  spirit-adventures
```

### Deploy on Render / Cloud Platform
- In Render, choose **Web Service** → Connect your repository.
- Runtime: **Docker** (using `./Dockerfile`).
- Set environment variables:
  - `SECRET_KEY`: generated random string
  - `DJANGO_SUPERUSER_EMAIL`: your owner email
  - `DJANGO_SUPERUSER_PASSWORD`: your owner password
  - `CLOUDINARY_URL` (optional): `cloudinary://<key>:<secret>@<cloud_name>`
  - `DATABASE_URL` (optional): Postgres connection string (falls back to SQLite automatically if omitted).
  - `PORT`: `3000` (Render handles this automatically).
- The container executes `start.sh`, automatically runs migrations, syncs the CRM, checks health, and boots Next.js with internal reverse proxying to Django.
