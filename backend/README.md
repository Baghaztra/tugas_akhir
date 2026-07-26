# Backend — Sistem Manajemen Produksi

Backend API untuk aplikasi manajemen produksi konveksi, dibangun dengan **FastAPI + SQLAlchemy + Alembic**.

## Teknologi

| Package                | Fungsi                 |
| ---------------------- | ---------------------- |
| FastAPI                | Web framework          |
| SQLAlchemy 2.0         | ORM database           |
| Alembic                | Database migration     |
| Pydantic 2.0           | Data validation        |
| mysql-connector-python | MySQL driver           |
| XGBoost                | ML ranking model       |
| Pandas                 | Data processing        |
| python-jose            | JWT token              |
| passlib + bcrypt       | Password hashing       |
| Uvicorn                | ASGI server            |

## Prasyarat

- Python 3.10+
- MySQL 8.0 (jalankan via Docker Compose di root project)

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

File `.env` di root `backend/`:

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

## CLI Management (`manage.py`)

| Perintah               | Deskripsi                       |
| ---------------------- | ------------------------------- |
| `python manage.py migrate`       | Jalankan migration ke versi terbaru |
| `python manage.py migrate:down`  | Rollback migration terakhir     |
| `python manage.py migrate:reset` | Rollback semua migration        |
| `python manage.py migrate:status`| Cek revision saat ini           |
| `python manage.py migrate:history`| Riwayat semua migration        |
| `python manage.py seed`          | Isi database dengan data dummy  |
| `python manage.py reset`         | Kosongkan semua tabel           |
| `python manage.py fresh`         | Reset + seed ulang              |

## Struktur Project

```
backend/
├── app/
│   ├── main.py                  # Entry point, register routers & middleware
│   ├── database.py              # SQLAlchemy engine & session
│   ├── auth.py                  # JWT auth (login, token, hash)
│   ├── email.py                 # SMTP email (OTP reset password)
│   ├── storage.py               # File upload storage
│   ├── ranking_logic.py         # XGBoost ranking inference
│   ├── models/                  # SQLAlchemy models
│   │   ├── __init__.py          # Register semua model
│   │   ├── user.py              # User model
│   │   ├── worker.py            # Worker model
│   │   ├── order.py             # Order, OrderItem, OrderLog, GarmentType
│   │   ├── customer.py          # Customer model
│   │   ├── profile.py           # Profile usaha
│   │   ├── portfolio.py         # Portfolio produk
│   │   ├── attributes.py        # Atribut pakaian
│   │   └── password_reset_token.py
│   ├── schemas/                 # Pydantic schemas (request/response)
│   │   ├── user.py
│   │   ├── worker.py
│   │   ├── order.py
│   │   ├── customer.py
│   │   ├── profile.py
│   │   ├── portfolio.py
│   │   ├── garment_type.py
│   │   └── attributes.py
│   ├── crud/                    # Database operations
│   │   ├── user.py
│   │   ├── worker.py
│   │   ├── order.py
│   │   ├── customer.py
│   │   ├── profile.py
│   │   ├── portfolio.py
│   │   ├── garment_type.py
│   │   └── attributes.py
│   └── routers/                 # API endpoints
│       ├── auth.py              # /auth (login, logout, password)
│       ├── orders.py            # /orders (CRUD, tracking, kanban)
│       ├── customers.py         # /customers (CRUD, search autocomplete)
│       ├── workers.py           # /workers (CRUD, wages, performance)
│       ├── profile.py           # /profile (public, update)
│       ├── portfolio.py         # /portfolio (CRUD + image)
│       ├── dashboard.py         # /dashboard (summary, trend, notifications)
│       ├── analytics.py         # /reports (volume, trends, productivity)
│       ├── garment_types.py     # /garment-types (CRUD)
│       ├── attributes.py        # /attributes (CRUD)
│       └── users.py             # /users (CRUD)
├── migrations/                  # Alembic migration files
│   ├── versions/                # Migration scripts
│   └── env.py                   # Alembic env config
├── seeds/                       # Database seeder & reset
│   ├── seeder.py                # Seed data dummy
│   └── reset.py                 # Reset semua tabel
├── xgboost/                     # Model ML
│   ├── xgboost_ranker_v7.pkl    # Model terbaru
│   ├── training_model_v6.ipynb  # Training notebook
│   └── data_processed_clean.csv # Dataset training
├── uploads/                     # Uploaded files (sketch, portfolio)
├── manage.py                    # CLI management
├── alembic.ini                  # Alembic config
├── requirements.txt
└── .env
```

## Dokumentasi API

| URL                       | Deskripsi           |
| ------------------------- | ------------------- |
| `http://localhost:8000/docs`  | Swagger UI          |
| `http://localhost:8000/redoc` | ReDoc               |

Lihat [DOCUMENTATION.md](../DOCUMENTATION.md) untuk daftar lengkap semua API endpoints.

## Alur Development

1. Ubah/tambah model di `app/models/`
2. Buat schema di `app/schemas/`
3. Buat CRUD function di `app/crud/`
4. Buat router di `app/routers/`
5. Register router di `app/main.py`
6. Generate migration: `python manage.py generate`
7. Apply migration: `python manage.py migrate`