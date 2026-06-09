# Backend — Sistem Manajemen Produksi

Backend API untuk aplikasi manajemen produksi konveksi, dibangun dengan FastAPI + SQLAlchemy + Alembic.

## Teknologi

| Package | Versi | Fungsi |
|---------|-------|--------|
| FastAPI | 0.129.x | Web framework |
| SQLAlchemy | 2.0.x | ORM database |
| Alembic | 1.18.x | Database migration |
| Pydantic | 2.12.x | Data validation |
| mysql-connector-python | 9.6.x | MySQL driver |
| XGBoost | 3.2.x | ML ranking model |
| Pandas | 3.0.x | Data processing |
| python-jose | 3.5.x | JWT token |
| passlib + bcrypt | - | Password hashing |
| Uvicorn | 0.40.x | ASGI server |

## Struktur Project

```
backend/
├── app/
│   ├── main.py              # Entry point, register routers & middleware
│   ├── database.py          # SQLAlchemy engine & session
│   ├── auth.py              # JWT auth (login, token, hash)
│   ├── email.py             # SMTP email (OTP reset password)
│   ├── storage.py           # File upload storage
│   ├── ranking_logic.py     # XGBoost ranking inference
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── worker.py
│   │   ├── order.py         # Order, OrderItem, OrderLog, GarmentType
│   │   ├── profile.py
│   │   ├── portfolio.py
│   │   ├── attributes.py
│   │   └── password_reset_token.py
│   ├── schemas/             # Pydantic schemas
│   ├── crud/                # Database operations
│   └── routers/             # API endpoints
│       ├── auth.py          # /auth (login, logout, password)
│       ├── orders.py        # /orders (CRUD, tracking, kanban)
│       ├── workers.py       # /workers (CRUD, wages, performance)
│       ├── profile.py       # /profile (public, update)
│       ├── portfolio.py     # /portfolio (CRUD + image)
│       ├── dashboard.py     # /dashboard (summary, trend, notifications)
│       ├── analytics.py     # /reports (volume, trends, productivity)
│       ├── garment_types.py # /garment-types (CRUD)
│       └── attributes.py    # /attributes (CRUD)
├── migrations/              # Alembic migration files
├── seeds/                   # Database seeder & reset
├── xgboost/                 # Model ML (.pkl)
├── uploads/                 # Uploaded files
├── manage.py                # CLI management
├── alembic.ini
├── requirements.txt
└── .env
```

## Prasyarat

- Python 3.10+
- MySQL 8.0

## Setup

### 1. Buat Virtual Environment

```bash
python -m venv .venv
```

### 2. Aktifkan Virtual Environment

```bash
# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Konfigurasi Environment

Buat file `.env` di root `backend/`:

```env
APP_NAME="Backend Rumah Jahit App"
APP_VERSION="0.0.0"
SQLALCHEMY_DATABASE_URL="mysql+mysqlconnector://root:root@localhost/tugas_akhir"
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
JWT_SECRET=<random-secret-key>
JWT_EXPIRE_MINUTES=1440
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<app-password>
SMTP_FROM_EMAIL=<email>
```

Pastikan database sudah dibuat:

```sql
CREATE DATABASE IF NOT EXISTS tugas_akhir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Jalankan Migration & Seeder

```bash
python manage.py migrate
python manage.py seed
```

### 6. Jalankan Server

```bash
uvicorn app.main:app --reload
```

Server berjalan di `http://localhost:8000`

## CLI Management (manage.py)

| Perintah | Deskripsi |
|----------|-----------|
| `python manage.py migrate` | Jalankan migration ke versi terbaru |
| `python manage.py migrate:down` | Rollback migration terakhir |
| `python manage.py migrate:reset` | Rollback semua migration |
| `python manage.py migrate:status` | Cek revision saat ini |
| `python manage.py migrate:history` | Riwayat semua migration |
| `python manage.py seed` | Isi database dengan data dummy |
| `python manage.py reset` | Kosongkan semua tabel |
| `python manage.py fresh` | Reset + seed ulang |
| `alembic revision --autogenerate -m "msg"` | Buat migration baru |

## Dokumentasi API

Swagger UI: `http://localhost:8000/docs`
ReDoc: `http://localhost:8000/redoc`

Lihat [DOCUMENTATION.md](../DOCUMENTATION.md) untuk daftar lengkap semua API endpoints.

## Alur Development

1. Ubah/tambah model di `app/models/`
2. Buat schema di `app/schemas/`
3. Buat CRUD function di `app/crud/`
4. Buat router di `app/routers/`
5. Register router di `app/main.py`
6. Generate migration: `alembic revision --autogenerate -m "message"`
7. Apply migration: `python manage.py migrate`
