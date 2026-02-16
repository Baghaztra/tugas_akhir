# Backend Production Management System

Backend untuk sistem manajemen produksi, dibangun menggunakan FastAPI.

## Struktur Project

```
backend/
├── app/
│   ├── crud/           # Operasi database (Create, Read, Update, Delete)
│   ├── models/         # SQLAlchemy models (definisi tabel database)
│   ├── routers/        # API Endpoints (mengelompokkan route)
│   ├── schemas/        # Pydantic models (validasi request/response)
│   ├── database.py     # Konfigurasi koneksi database
│   └── main.py         # Entry point aplikasi
├── requirements.txt    # Daftar dependency packages
└── .gitignore          # File yang diabaikan oleh git
```

## Prasyarat

- Python 3.8 atau lebih baru
- MySQL Server (Pastikan service MySQL sudah berjalan)

## Cara Setup

1.  **Buat Virtual Environment**

    Disarankan untuk menggunakan virtual environment agar dependencies project terisolasi.

    ```bash
    # Windows
    python -m venv .venv

    # Linux/MacOS
    python3 -m venv .venv
    ```

2.  **Aktifkan Virtual Environment**

    ```bash
    # Windows
    .\.venv\Scripts\activate

    # Linux/MacOS
    source .venv/bin/activate
    ```

3.  **Install Dependencies**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Konfigurasi Database**

    Buka file `app/database.py` dan sesuaikan `SQLALCHEMY_DATABASE_URL` dengan kredensial database MySQL Anda.

    ```python
    # Format: mysql+mysqlconnector://user:password@host/db_name
    SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:password@localhost/production_db"
    ```

    _Catatan: Disarankan untuk membuat database kosong terlebih dahulu di MySQL (misal: `production_db`)._

5.  **Jalankan Server**

    ```bash
    uvicorn app.main:app --reload
    ```

    Server akan berjalan di `http://127.0.0.1:8000`.

## Dokumentasi API

FastAPI menyediakan dokumentasi interaktif secara otomatis. Setelah server berjalan, buka:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Pengembangan Selanjutnya (To-Do)

Berdasarkan analisis awal, berikut adalah beberapa hal yang bisa ditingkatkan:

- [ ] **Environment Variables**: Gunakan `.env` file untuk menyimpan konfigurasi sensitif seperti kredensial database, daripada hardcode di `database.py`. (Library: `python-dotenv`)
- [ ] **Database Migrations**: Gunakan **Alembic** untuk manajemen skema database, agar perubahan struktur tabel lebih terkelola daripada sekadar `Base.metadata.create_all`.
- [ ] **Testing**: Tambahkan unit testing (misal dengan `pytest`) untuk memastikan endpoint berjalan sesuai ekspektasi.
- [ ] **Authentication**: Implementasi sistem login/auth (JWT) untuk mengamankan endpoint.
- [ ] **Error Handling**: Buat global exception handler untuk format error response yang konsisten.
