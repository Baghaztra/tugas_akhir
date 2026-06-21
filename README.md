# Sistem Manajemen Produksi — Penjahit Yan

Aplikasi manajemen produksi untuk usaha konveksi/jahit. Mencakup manajemen pesanan, karyawan, portofolio, tracking pelanggan, dan rekomendasi prioritas berbasis AI (XGBoost).

## Arsitektur

```
Frontend (Nuxt 4, port 3000)  ←→  Backend (FastAPI, port 8000)  ←→  MySQL 8.0
```

## Tech Stack

| Layer      | Teknologi                                       |
| ---------- | ----------------------------------------------- |
| Frontend   | Nuxt 4, Vue 3, Tailwind CSS, Pinia, Fabric.js   |
| Backend    | FastAPI, SQLAlchemy, Alembic, Pydantic, XGBoost  |
| Database   | MySQL 8.0                                        |
| Auth       | JWT (HTTP-only cookie), bcrypt                   |
| Testing    | Playwright (E2E + API)                           |
| Infra      | Docker Compose                                   |

## Fitur Utama

- **Profil Usaha (Public)** — Landing page, portofolio, cek status pesanan via nomor resi
- **Manajemen Pesanan** — CRUD pesanan, multi-item, sketch upload, status flow tracking
- **Papan Kerja Kanban** — Visualisasi antrian per fase (Potong → Jahit → Finishing)
- **Manajemen Karyawan** — Data karyawan, kalkulasi upah per pcs, statistik performa
- **Laporan & Analitik** — Volume pesanan, tren pakaian, produktivitas karyawan
- **AI Priority Ranking** — XGBoost XGBRanker untuk rekomendasi prioritas pesanan
- **Autentikasi** — JWT via HTTP-only cookie, forgot password via OTP email

## Quick Start

```bash
# 1. Jalankan MySQL + phpMyAdmin
docker-compose up -d

# 2. Setup Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
uvicorn app.main:app --reload

# 3. Setup Frontend (terminal baru)
cd frontend
npm install
npm run dev
```

## URL Akses

| Service      | URL                        |
| ------------ | -------------------------- |
| Frontend     | http://localhost:3000       |
| Backend API  | http://localhost:8000       |
| Swagger Docs | http://localhost:8000/docs  |
| phpMyAdmin   | http://localhost:8080       |

## Struktur Project

```
project/
├── docker-compose.yml        # MySQL + phpMyAdmin
├── DOCUMENTATION.md          # Dokumentasi teknis lengkap
├── E2E_TESTING.md            # Panduan E2E testing
├── backend/                  # FastAPI + SQLAlchemy + XGBoost
│   ├── app/                  # Source code (models, schemas, crud, routers)
│   ├── migrations/           # Alembic migration
│   ├── seeds/                # Database seeder
│   ├── xgboost/              # Model ML (.pkl)
│   ├── manage.py             # CLI management
│   └── requirements.txt
└── frontend/                 # Nuxt 4 + Vue 3 + Tailwind CSS
    ├── app/                  # Source code (pages, components, composables, stores)
    ├── e2e/                  # Playwright E2E tests
    ├── shared/               # Shared types
    ├── nuxt.config.ts
    └── package.json
```

## Dokumentasi

- [DOCUMENTATION.md](DOCUMENTATION.md) — Dokumentasi teknis lengkap (API, DB schema, coding style)
- [E2E_TESTING.md](E2E_TESTING.md) — Panduan E2E testing dengan Playwright
- [frontend/README.md](frontend/README.md) — Setup & struktur frontend
- [backend/README.md](backend/README.md) — Setup & struktur backend
