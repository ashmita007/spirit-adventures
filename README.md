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

### 1. Run with Docker Compose (Recommended)

```bash
# Clone and enter directory
cd spirit_adventutes

# Launch PostgreSQL, Django Ninja Backend, and Next.js Frontend
docker compose up --build
```

- **Frontend Website**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)
- **API Docs (Interactive OpenAPI/Swagger)**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **Health Check**: [http://localhost:8000/api/v1/health/](http://localhost:8000/api/v1/health/)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

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
