# Sistem Manajemen Produksi — Penjahit Yan

Aplikasi manajemen produksi untuk usaha konveksi/jahit, mencakup manajemen pesanan, karyawan, portofolio, tracking pelanggan, dan rekomendasi prioritas berbasis AI (XGBoost).

## Arsitektur

```
Frontend (Nuxt 4, port 3000)  ←→  Backend (FastAPI, port 8000)  ←→  MySQL 8.0
```

- **Frontend**: Nuxt 4 + Vue 3 + Tailwind CSS + Pinia
- **Backend**: FastAPI + SQLAlchemy + Alembic + XGBoost
- **Database**: MySQL 8.0 (via Docker Compose)

## Quick Start

```bash
# 1. Jalankan MySQL
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

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| phpMyAdmin | http://localhost:8080 |

## Fitur Utama

- **Profil Usaha (Public)**: Landing page, portofolio, cek status pesanan
- **Manajemen Pesanan**: CRUD pesanan, multi-item per order, sketch upload, status flow tracking
- **Papan Kerja Kanban**: Visualisasi antrian per fase (Potong → Jahit → Finishing)
- **Manajemen Karyawan**: Data karyawan, kalkulasi upah per pcs, statistik performa
- **Laporan & Analitik**: Volume pesanan, tren pakaian, produktivitas karyawan
- **AI Priority Ranking**: XGBoost XGBRanker untuk rekomendasi prioritas pesanan
- **Autentikasi**: JWT via HTTP-only cookie, forgot password via OTP email
- **Tracking Pelanggan**: Cek status pesanan via nomor resi (public)

## Dokumentasi

Lihat [DOCUMENTATION.md](DOCUMENTATION.md) untuk dokumentasi teknis lengkap meliputi:

- Struktur & format penulisan kode (frontend & backend)
- Semua halaman dan API endpoints
- Database schema dan ERD
- Cara testing (E2E dengan Playwright)
- Konfigurasi environment
- Troubleshooting

## Struktur Project

```
project/
├── docker-compose.yml      # MySQL + phpMyAdmin
├── DOCUMENTATION.md        # Dokumentasi teknis lengkap
├── E2E_TESTING.md          # Panduan E2E testing
├── backend/                # FastAPI + SQLAlchemy + XGBoost
│   ├── app/                # Source code (models, schemas, crud, routers)
│   ├── migrations/         # Alembic migration
│   ├── seeds/              # Database seeder
│   ├── xgboost/            # Model ML (.pkl)
│   ├── manage.py           # CLI management
│   └── requirements.txt
└── frontend/               # Nuxt 4 + Vue 3 + Tailwind CSS
    ├── app/                # Source code (pages, components, composables, stores)
    ├── e2e/                # Playwright E2E tests
    ├── nuxt.config.ts
    └── package.json
```

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Nuxt 4, Vue 3, Tailwind CSS, Pinia, Fabric.js |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic, XGBoost |
| Database | MySQL 8.0 |
| Auth | JWT (python-jose), bcrypt |
| Testing | Playwright (E2E + API) |
| Infra | Docker Compose |
