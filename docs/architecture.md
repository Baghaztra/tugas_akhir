# Arsitektur Sistem

## Overview

```
┌──────────────┐     HTTP/REST     ┌──────────────┐     SQLAlchemy     ┌──────────┐
│   Frontend   │ ────────────────→ │   Backend    │ ────────────────→  │  MySQL   │
│  (Nuxt 4)   │  ←──────────────  │  (FastAPI)   │  ←───────────────  │  8.0     │
│  Port 3000   │     JSON          │  Port 8000   │                    │  3306    │
└──────────────┘                   └──────────────┘                    └──────────┘
```

Arsitektur **monorepo** dengan frontend dan backend terpisah.

## Tech Stack

### Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Nuxt | 4.x | Framework Vue.js (SSR/SPA hybrid) |
| Vue | 3.5.x | Reactive UI framework |
| Tailwind CSS | via `@nuxtjs/tailwindcss` | Utility-first CSS |
| Pinia | via `@pinia/nuxt` | State management |
| Nuxt Icon | 2.x | Icon component (Heroicons) |
| Fabric.js | 7.x | Canvas sketch/drawing |
| Chart.js + vue-chartjs | 4.x / 5.x | Dashboard charts |
| vue-easy-lightbox | 1.x | Image lightbox |
| Playwright | 1.59.x | E2E & API testing |

### Backend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| FastAPI | 0.129.x | Web framework (async) |
| SQLAlchemy | 2.0.x | ORM database |
| Alembic | 1.18.x | Database migration |
| MySQL Connector | 9.6.x | Driver MySQL |
| Pydantic | 2.12.x | Data validation |
| XGBoost | 3.2.x | ML ranking model |
| Pandas | 3.0.x | Data processing |
| python-jose | 3.5.x | JWT token |
| passlib + bcrypt | - | Password hashing |
| openpyxl | - | Excel export |
| Uvicorn | 0.40.x | ASGI server |

### Infrastructure

| Teknologi | Fungsi |
|-----------|--------|
| Docker Compose | MySQL + phpMyAdmin (development) |
| MySQL 8.0 | Database utama |
| phpMyAdmin | Database admin GUI |

## Backend Layer Architecture

```
Router (endpoint) → CRUD (business logic) → Model (database) → Schema (validation)
```

- **Router** (`app/routers/`): Mendefinisikan endpoint, menangani request/response
- **Schema** (`app/schemas/`): Pydantic model untuk validasi input/output
- **CRUD** (`app/crud/`): Fungsi operasi database (query, insert, update, delete)
- **Model** (`app/models/`): SQLAlchemy ORM model (tabel database)

## Struktur Direktori

```
project/
├── docker-compose.yml
├── docs/                       # Dokumentasi (file ini)
├── backend/                    # FastAPI Application
│   ├── app/
│   │   ├── main.py             # Entry point, register routers & middleware
│   │   ├── database.py         # SQLAlchemy engine & session
│   │   ├── auth.py             # JWT auth logic
│   │   ├── email.py            # SMTP email (OTP reset password)
│   │   ├── storage.py          # File upload storage
│   │   ├── ranking_logic.py    # XGBoost ranking inference
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── crud/               # Database operations
│   │   └── routers/            # API route handlers
│   ├── migrations/             # Alembic migration files
│   ├── seeds/                  # Database seeder & reset
│   ├── xgboost/                # Model ML (.pkl)
│   ├── uploads/                # Uploaded files
│   ├── manage.py               # CLI management
│   ├── alembic.ini
│   └── requirements.txt
│
└── frontend/                   # Nuxt 4 Application
    ├── app/
    │   ├── app.vue             # Root component
    │   ├── pages/              # File-based routing
    │   ├── layouts/            # Layout templates
    │   ├── components/         # Reusable components
    │   ├── composables/        # Vue composables (data fetching)
    │   ├── stores/             # Pinia stores
    │   └── middleware/         # Route middleware
    ├── e2e/                    # E2E tests (Playwright)
    ├── nuxt.config.ts
    ├── tailwind.config.ts
    └── package.json
```
