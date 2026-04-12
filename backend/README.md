# Backend Production Management System

Backend untuk sistem manajemen produksi, dibangun menggunakan FastAPI + SQLAlchemy + Alembic.

## Struktur Project

```
backend/
├── app/
│   ├── crud/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── database.py
│   └── main.py
├── migrations/        # Alembic migration files
├── seeds/             # Database seeder
├── uploads/           # File upload
├── alembic.ini        # Alembic configuration
├── manage.py          # CLI management
└── requirements.txt
```

## Prasyarat

- Python 3.8+
- MySQL Server
- Virtualenv (disarankan)

---

## Setup Project

### 1. Clone repository

```
git clone <repository-url>
cd backend
```

### 2. Buat Virtual Environment

Windows:

```
python -m venv .venv
```

Linux / MacOS:

```
python3 -m venv .venv
```

### 3. Aktifkan Virtual Environment

Windows:

```
.venv\Scripts\activate
```

Linux / MacOS:

```
source .venv/bin/activate
```

### 4. Install Dependencies

```
pip install -r requirements.txt
```

---

## Konfigurasi Database

Buat file `.env` di root project:

```
SQLALCHEMY_DATABASE_URL=mysql+mysqlconnector://root:@localhost/tugas_akhir
```

Pastikan database sudah dibuat di MySQL:

```
CREATE DATABASE tugas_akhir;
```

---

## Migration Database (Alembic)

Apply migration:

```
alembic upgrade head
```

Buat migration baru:

```
alembic revision --autogenerate -m "message"
```

Rollback migration:

```
alembic downgrade -1
```

---

## Seeder Database

Menjalankan seeder:

```
python manage.py seed
```

Reset database + seed ulang:

```
python manage.py reset
```

---

## Menjalankan Server

```
uvicorn app.main:app --reload
```

Server berjalan di:

```
http://127.0.0.1:8000
```

---

## Dokumentasi API

Swagger UI:

```
http://127.0.0.1:8000/docs
```

ReDoc:

```
http://127.0.0.1:8000/redoc
```

---

## Alur Development

1. Ubah / tambah model

2. Generate migration

   ```
   alembic revision --autogenerate -m "update"
   ```

3. Apply migration

   ```
   alembic upgrade head
   ```

4. Jalankan seeder

   ```
   python manage.py seed
   ```

---

## Pengembangan Selanjutnya (To-Do)

Berdasarkan analisis awal, berikut adalah beberapa hal yang bisa ditingkatkan:

- [ ] **Environment Variables**: Gunakan `.env` file untuk menyimpan konfigurasi sensitif seperti kredensial database, daripada hardcode di `database.py`. (Library: `python-dotenv`)
- [ ] **Database Migrations**: Gunakan **Alembic** untuk manajemen skema database, agar perubahan struktur tabel lebih terkelola daripada sekadar `Base.metadata.create_all`.
- [ ] **Testing**: Tambahkan unit testing (misal dengan `pytest`) untuk memastikan endpoint berjalan sesuai ekspektasi.
- [ ] **Authentication**: Implementasi sistem login/auth (JWT) untuk mengamankan endpoint.
- [ ] **Error Handling**: Buat global exception handler untuk format error response yang konsisten.
