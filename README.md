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
├── docker-compose.yml          # MySQL + phpMyAdmin + Backend (lokal)
├── docker-compose.prod.yml     # MySQL + phpMyAdmin + Backend (produksi)
├── .github/
│   └── workflows/
│       ├── _deploy-template.yml   # Reusable deploy template
│       └── deploy-backend.yml     # CI/CD auto-deploy ke VPS
├── docs/                       # Dokumentasi teknis
├── backend/                    # FastAPI + SQLAlchemy + XGBoost
│   ├── Dockerfile              # Container image
│   ├── entrypoint.sh           # Wait DB + migrate + start
│   ├── .env.example            # Template env vars
│   ├── app/                    # Source code (models, schemas, crud, routers)
│   ├── migrations/             # Alembic migration
│   ├── seeds/                  # Database seeder
│   ├── xgboost/                # Model ML (.pkl)
│   ├── manage.py               # CLI management
│   └── requirements.txt
└── frontend/                   # Nuxt 4 + Vue 3 + Tailwind CSS
    ├── app/                    # Source code (pages, components, composables, stores)
    ├── e2e/                    # Playwright E2E tests
    ├── shared/                 # Shared types
    ├── nuxt.config.ts
    └── package.json
```

## Dokumentasi

- [docs/](docs/) — Dokumentasi teknis (per topik, terpisah)
  - [Arsitektur](docs/architecture.md) | [Setup](docs/setup.md) | [API](docs/api.md) | [Database](docs/database.md) | [Auth](docs/auth.md) | [ML](docs/ml.md) | [Testing](docs/testing.md) | [E2E Testing](docs/testing-e2e.md) | [Coding Style](docs/coding-conventions.md) | [Pages](docs/pages.md) | [Deploy](docs/deployment.md) | [Troubleshooting](docs/troubleshooting.md)

## Saran Pengembangan Lanjutan

1. **Role-Based Access Control (RBAC)** Saat ini semua user (Owner & Staff) memiliki akses penuh ke seluruh halaman admin. RBAC bisa ditambahkan untuk membatasi akses staff pada modul tertentu.
2. **Automatic Retrain** Saat ini model bersifat static, dilatih dengan data awal lalu disimpan dalam file pickel untuk diload dalam backend. Data historis terbaru dari database bisa digunakan untuk retrain model agar model terus dilatih diharapkan main baik dalam mengurutkan pesanan.
3. **Akun Pelanggan** Saat ini pelanggan melihat pesanan berdasarkan kode pesanannya. Jika pelanggan dapat login, pelanggan bisa melihat histori pesanan, hingga pembayaran via apliaksi.
4. **Layanan Permak** Aplikasi saat ini belum menyediakan fitur untuk permak secara terpisah, dimana jika ada pelanggan yang ingin memberbaiki pakaian, mungkin hanya sebagian fitur, aplikasi belum menyediakan fiturnya.

