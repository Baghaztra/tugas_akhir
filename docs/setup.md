# Setup & Menjalankan

## Prasyarat

- **Node.js** 18+ (direkomendasikan 20+)
- **Python** 3.10+
- **MySQL** 8.0
- **Docker** (opsional, untuk menjalankan MySQL)

## 1. Database (Docker)

```bash
# Dari root project
docker-compose up -d
```

Menjalankan:
- MySQL 8.0 di port `3306` (user: `user`, password: `password`, db: `testdb`)
- phpMyAdmin di port `8080`

Buat database secara manual jika tidak pakai Docker:

```sql
CREATE DATABASE IF NOT EXISTS tugas_akhir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Backend

```bash
cd backend

python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt

# Konfigurasi .env (lihat Environment Variables di bawah)

# Jalankan migration
python manage.py migrate

# Seed data dummy
python manage.py seed

# Jalankan server
uvicorn app.main:app --reload
```

Backend: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## Ringkasan Perintah

| Perintah | Lokasi | Fungsi |
|----------|--------|--------|
| `docker-compose up -d` | root | Jalankan MySQL + phpMyAdmin |
| `uvicorn app.main:app --reload` | backend | Jalankan backend (port 8000) |
| `npm run dev` | frontend | Jalankan frontend (port 3000) |
| `python manage.py migrate` | backend | Jalankan database migration |
| `python manage.py migrate:down` | backend | Rollback 1 migration |
| `python manage.py migrate:reset` | backend | Rollback semua migration |
| `python manage.py migrate:status` | backend | Cek status migration |
| `python manage.py seed` | backend | Seed data dummy |
| `python manage.py reset` | backend | Reset semua data |
| `python manage.py fresh` | backend | Reset + seed ulang |
| `python manage.py generate` | backend | Buat migration baru (alembic revision --autogenerate) |

## Environment Variables

### Backend (`backend/.env`)

```env
APP_NAME="Backend Rumah Jahit App"
APP_VERSION="0.0.0"

SQLALCHEMY_DATABASE_URL="mysql+mysqlconnector://root:root@localhost/tugas_akhir"
PUBLIC_BASE_URL="http://localhost:8000"
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

JWT_SECRET=<random-secret-key>
JWT_EXPIRE_MINUTES=1440

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<app-password>
SMTP_FROM_EMAIL=<email>
```

### Frontend (`frontend/.env`)

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```
