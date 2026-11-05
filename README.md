# SPIRIT ADVENTURES

> **Small, Premium, Mobile-First Adventure & Nature Travel Website**

Website Reference: [https://spiritadventures.in/](https://spiritadventures.in/)

Spirit Adventures is a lightweight, cinematic, high-performance nature and adventure travel application focused on:
**Nature + Adventure + Trips + Visual Storytelling + Enquiries/Bookings**

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Django 5.x, Django Ninja, WhiteNoise, CORS Headers
- **Database**: PostgreSQL / SQLite (automatic fallback)
- **Deployment & Orchestration**: Docker & Docker Compose

---

## 🚀 Quick Start (Local-First)

### 1. Run with Docker (production stack)

The whole project (website, owner portal, CRM, API, Postgres, HTTPS, nightly backups) runs with
`docker compose up -d --build`. Full guide: **[DEPLOY.md](DEPLOY.md)**.

For local development use the venv + `npm run dev` instead (Django on :8000, Next.js on :3000).

---

### 2. Create Django Superuser

```bash
docker compose exec backend python manage.py createsuperuser
```

Or when running locally without Docker:
```bash
cd backend
python manage.py createsuperuser
```

---

### 3. Seed Realistic Demo Data

The database automatically seeds on first launch, or you can run:

```bash
docker compose exec backend python manage.py seed_data
```

This populates:
- **Destinations**: Uttarakhand, Himachal Pradesh, Kashmir, Ladakh, Maharashtra, Karnataka
- **Categories**: Treks, Camping, Water, Snow, Weekend, Group Trips
- **Featured Trips**: Kedarkantha Summit, Hampta Pass & Chandratal, Kashmir Great Lakes, Spiti Valley, Sandhan Valley, Gokarna Beach Trek
- **Media**: High-res nature imagery, day-by-day itineraries, FAQs, and verified reviews

---

## 🧭 Architecture

```text
                 USER
                  │
                  ▼
             NEXT.JS (SSR / Mobile First)
            http://localhost:3000
                  │
                API (/api/v1/)
                  │
                  ▼
           DJANGO NINJA
            http://localhost:8000
                  │
                  ▼
             POSTGRESQL (or SQLite)
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health/` | Service health status |
| `GET` | `/api/v1/trips/` | List trips (supports `destination`, `category`, `difficulty`, `featured`, `search`) |
| `GET` | `/api/v1/trips/{slug}/` | Full trip details (itinerary, inclusions, gallery, reviews) |
| `GET` | `/api/v1/destinations/` | List destinations |
| `GET` | `/api/v1/destinations/{slug}/` | Destination details and trips |
| `GET` | `/api/v1/categories/` | List travel categories |
| `POST` | `/api/v1/enquiries/` | Submit booking enquiry |
| `GET` | `/api/v1/reviews/` | Approved traveler reviews |
| `GET` | `/api/v1/gallery/` | Nature photo gallery |
| `GET` | `/api/v1/blog/` | Blog articles & trail guides |
| `GET` | `/api/v1/blog/{slug}/` | Single blog article |
| `GET` | `/api/v1/faqs/` | General FAQs |

---

## 🎨 Design System & Colors

```text
Deep Navy     #062B49   (Primary brand & footer)
Ocean Blue    #0A6FAE   (Interactive buttons & badges)
Sky Blue      #38BDF8   (Accents & highlights)
Light Blue    #EFF8FD   (Section backgrounds)
White         #FFFFFF   (Clean canvas)
Dark Text     #0F172A   (Headings & typography)
```

### Visual Rhythm
```text
White → Photography → White → Light Blue → Photography → Deep Navy
```

---

## 📱 Mobile-First Breakpoints Tested
- `390 × 844` (iPhone 12/13/14/15)
- `375 × 812` (iPhone X/XS/11 Pro)
- `412 × 915` (Pixel / Galaxy)
- `768 × 1024` (iPad)
- `1440 × 900` (Desktop)

---

## 🔐 Team Login, Owner Portal & Sales CRM

The sales CRM is part of this project: one Django backend, one database, one login.

| Area | URL | Who |
|---|---|---|
| Team sign in | `/owner/login` | everyone, with their **email** |
| Owner portal (packages, leads, analytics) | `/owner` | staff accounts |
| Sales CRM (leads, follow-ups, payments, departures, targets) | `/crm` | every active, approved team member |
| Django admin | `/admin/` | staff accounts |
| API docs | `/api/v1/docs` | |

- **Roles:** `admin` / `manager` see every lead and manage the team; `sales_person` / `counselor` only see their own leads.
- **First owner account:** `cd backend && ../venv/bin/python manage.py createsuperuser` (asks for email, first and last name).
  On Render, set `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD`, `DJANGO_SUPERUSER_FIRST_NAME`, `DJANGO_SUPERUSER_LAST_NAME` and `build.sh` creates it.
- **Add sales reps:** CRM → Team, or Django admin → *CRM · Team*.
- Step-by-step guide inside the portal: **`/owner/help`**.

### Photos, videos & gallery
- **Owner portal → Photo Gallery** (`/owner/gallery`): *Add photos* uploads several at once, *Paste link* adds an existing URL, click a photo to edit title / category / caption / featured, eye icon hides it, bin removes it.
- **Owner portal → Packages → Video loop selector**: *Upload cover photo*, *Upload your own video* (up to 100 MB), *Add trip photos* (the trip page's "View Photos").
- Files go from the browser straight to Cloudinary using a short-lived signature from `POST /api/v1/owner/media/sign/` (staff only), so Django never handles the bytes. Saved links use `f_auto,q_auto` for WebP/AVIF delivery.

### Website → CRM
Every website enquiry becomes a CRM lead the moment it is saved (`adventures/crm.py` → `crm/enquiries/services.py`),
tagged **Website** and assigned to the rep with the fewest open leads. Saved trips are mirrored as CRM packages.
If anything was missed: `../venv/bin/python manage.py sync_crm` (`--all` re-sends everything; safe to repeat).

### Code layout
- `backend/crm/accounts` – team accounts (`AUTH_USER_MODEL = accounts.CustomUser`, email login) and the CRM session auth
- `backend/crm/enquiries` – leads, comments, tour packages, website bridge
- `backend/crm/targets` – monthly targets
- `frontend/src/app/crm`, `frontend/src/components/crm`, `frontend/src/lib/crm` – CRM screens

## ⚙️ Environment Variables

| Where | Variable | Purpose |
|---|---|---|
| Backend | `CSRF_TRUSTED_ORIGINS_EXTRA` | Extra comma-separated origins for the team login in production |
| Backend | `DJANGO_SUPERUSER_*` | Optional first owner account created by `build.sh` |
| Backend | `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>` (Cloudinary → Settings → API Keys). Turns on photo/video uploads in the owner portal. Keep it secret. |
| Backend | `CLOUDINARY_FOLDER` | Folder for uploads (default `spirit_adventures`) |
| Frontend | `BACKEND_URL` | Django address for the Next.js rewrites (default `http://127.0.0.1:8000`) |
| Frontend | `NEXT_PUBLIC_SITE_URL` | Public site URL for canonicals, sitemap and OG tags |
| Frontend | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console token |
| Frontend | `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp booking number (optional) |
