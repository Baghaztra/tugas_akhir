# Database Migration & Seeder

Dokumentasi setup database, migration, seeding data dummy, dan reset untuk project backend **Production Management System**.

---

## Daftar Isi

1. [Persyaratan](#persyaratan)
2. [Struktur File](#struktur-file)
3. [Cara Pakai (manage.py)](#cara-pakai-managepy)
4. [Migration](#migration)
5. [Seeder](#seeder)
6. [Reset Database](#reset-database)
7. [Skema Tabel](#skema-tabel)

---

## Persyaratan

Pastikan dependensi berikut sudah terinstall (semua ada di `requirements.txt`):

```bash
pip install -r requirements.txt
```

Package yang relevan untuk migration & seeder:

| Package | Fungsi |
|---|---|
| `sqlalchemy` | ORM & schema definition |
| `alembic` | Database migration tool |
| `mysql-connector-python` | Driver koneksi MySQL |

Pastikan MySQL sudah berjalan dan database `tugas_akhir` sudah dibuat:

```sql
CREATE DATABASE IF NOT EXISTS tugas_akhir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> **Konfigurasi koneksi** ada di `app/database.py`:
> ```
> mysql+mysqlconnector://root:@localhost/tugas_akhir
> ```
> Sesuaikan `user:password@host` jika berbeda.

---

## Struktur File

```
backend/
├── manage.py                          # CLI helper utama
├── alembic.ini                        # Konfigurasi Alembic
├── requirements.txt                   # Dependensi Python
│
├── migrations/                        # Folder migrasi (Alembic)
│   ├── env.py                         # Environment Alembic
│   ├── script.py.mako                 # Template file migrasi
│   └── versions/
│       └── 0001_create_initial_tables.py   # Migrasi pertama (semua tabel)
│
└── seeds/                             # Folder seeder
    ├── __init__.py
    ├── seeder.py                      # Dummy data seeder
    └── reset.py                       # Script reset tabel
```

---

## Cara Pakai (manage.py)

`manage.py` adalah satu-satunya entry point untuk semua operasi database. Jalankan dari root folder `backend/`.

```bash
# Lihat daftar perintah
python manage.py
```

### Tabel Perintah

| Perintah | Deskripsi |
|---|---|
| `python manage.py migrate` | Jalankan semua migration yang belum dijalankan |
| `python manage.py migrate:down` | Rollback migration terakhir (1 step) |
| `python manage.py migrate:reset` | Rollback semua migration (ke state kosong) |
| `python manage.py migrate:status` | Tampilkan revision migration saat ini |
| `python manage.py migrate:history` | Tampilkan riwayat semua migration |
| `python manage.py seed` | Isi database dengan data dummy |
| `python manage.py reset` | Kosongkan semua tabel (⚠️ konfirmasi diperlukan) |
| `python manage.py fresh` | Reset + seed ulang (⚠️ konfirmasi diperlukan) |

---

## Migration

Migrasi dikelola menggunakan **Alembic**. File migasi terletak di `migrations/versions/`.

### Menjalankan Migration

```bash
python manage.py migrate
```

Perintah ini setara dengan:
```bash
alembic upgrade head
```

### Membuat Migration Baru

Setelah mengubah model di `app/models/`, buat file migrasi baru secara **otomatis**:

```bash
alembic revision --autogenerate -m "deskripsi perubahan"
```

File baru akan dibuat di `migrations/versions/`. Periksa isinya sebelum dijalankan.

### Rollback Migration

```bash
# Rollback 1 step
python manage.py migrate:down

# Rollback ke awal (hapus semua tabel yang dibuat migration)
python manage.py migrate:reset
```

### Cek Status

```bash
python manage.py migrate:status    # revision aktif saat ini
python manage.py migrate:history   # seluruh riwayat revision
```

---

## Seeder

Seeder mengisi database dengan data dummy yang realistis untuk keperluan **development** dan **testing**.

### Menjalankan Seeder

```bash
python manage.py seed
```

### Data yang Dihasilkan

| Tabel | Jumlah Record | Keterangan |
|---|---|---|
| `workers` | 8 | Karyawan dengan role Potong, Jahit, Finishing |
| `orders` | 30 | Pesanan dengan berbagai status & pembayaran |
| `order_logs` | 30–150 | Log otomatis sesuai perjalanan status pesanan |
| `business_profiles` | 1 | Profil bisnis (id=1, upsert) |
| `portfolio_items` | 6 | Portofolio hasil jahit |

### Detail Data Dummy

#### Workers
```
Budi Santoso    – Potong,    Rp 15.000/pcs
Siti Rahayu     – Jahit,     Rp 20.000/pcs
Ahmad Fauzi     – Jahit,     Rp 20.000/pcs
Dewi Kusuma     – Finishing, Rp 12.000/pcs
Eko Prasetyo    – Potong,    Rp 15.000/pcs
Fitri Handayani – Jahit,     Rp 22.000/pcs
Gilang Ramadhan – Finishing, Rp 12.000/pcs
Hani Pratiwi    – Jahit,     Rp 18.000/pcs
```

#### Orders
- **Status distribusi**: ~35% Done, 25% Sewing, 15% Cutting, 15% Finishing, 10% Received  
- **Payment distribusi**: ~40% Paid, 30% Unpaid, 30% Partial  
- **Tipe garment**: Kemeja Formal, Batik, Celana, Rok, Blazer, Jas, Kebaya, dll  
- **Format nomor resi**: `ORD-YYYYMMDD-XXXX`

#### Business Profile
```
Nama      : Atelier Nusantara
Slogan    : Karya Tangan, Warisan Budaya
Alamat    : Jl. Mawar No. 12, Bandung
Telepon   : 022-7654321
Instagram : @ateliernusantara
```

---

## Reset Database

> ⚠️ **Peringatan**: Operasi reset **menghapus semua data secara permanen**. Gunakan hanya di lingkungan development.

### Reset Saja (tanpa seed ulang)

```bash
python manage.py reset
```

Script akan meminta konfirmasi sebelum berjalan:
```
⚠️  Semua data akan dihapus. Lanjutkan? (y/N):
```

### Reset + Seed Ulang (Fresh)

```bash
python manage.py fresh
```

Setara dengan menjalankan `reset` lalu `seed` sekaligus. Berguna saat ingin memulai dari data bersih.

### Langsung via Script

```bash
# Reset saja
python -m seeds.reset

# Reset + langsung seed ulang
python -m seeds.reset --reseed
```

---

## Skema Tabel

### `workers`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | Auto-increment |
| `name` | VARCHAR(100) | Nama karyawan |
| `role` | ENUM | `Potong` / `Jahit` / `Finishing` |
| `status` | ENUM | `Working` / `Idle` |
| `wagePerPiece` | FLOAT | Upah per satuan (Rp) |
| `currentTask` | VARCHAR(30) | Nomor resi yang sedang dikerjakan |
| `weeklyCompleted` | INT | Cache jumlah selesai minggu ini |
| `date_joined` | DATETIME | Tanggal bergabung |

### `orders`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | Auto-increment |
| `receiptNumber` | VARCHAR(30) UNIQUE | Nomor resi (`ORD-YYYYMMDD-XXXX`) |
| `customerName` | VARCHAR(150) | Nama pelanggan |
| `customerPhone` | VARCHAR(20) | Nomor HP pelanggan |
| `garmentType` | VARCHAR(100) | Jenis pakaian |
| `description` | VARCHAR(500) | Deskripsi pesanan |
| `measurements` | JSON | Data ukuran (lingkar dada, pinggang, dll) |
| `status` | ENUM | `received` / `cutting` / `sewing` / `finishing` / `done` |
| `paymentStatus` | ENUM | `paid` / `unpaid` / `partial` |
| `totalPrice` | FLOAT | Total harga (Rp) |
| `paidAmount` | FLOAT | Uang yang sudah dibayar (Rp) |
| `deadline` | VARCHAR(20) | Tenggat waktu (`YYYY-MM-DD`) |
| `assignedTo` | VARCHAR(100) | Nama karyawan yang menangani |
| `notes` | VARCHAR(500) | Catatan tambahan |
| `createdAt` | DATETIME | Waktu pesanan dibuat |
| `updatedAt` | DATETIME | Waktu terakhir diperbarui |

### `order_logs`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | Auto-increment |
| `order_id` | INT FK | Referensi ke `orders.id` (cascade delete) |
| `status` | VARCHAR(30) | Status pada saat log dibuat |
| `note` | VARCHAR(300) | Keterangan perubahan |
| `employeeName` | VARCHAR(100) | Nama karyawan yang mengubah |
| `createdAt` | DATETIME | Waktu log dibuat |

### `business_profiles`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | Selalu `1` (single-row) |
| `name` | VARCHAR(150) | Nama bisnis |
| `slogan` | VARCHAR(300) | Slogan |
| `address` | VARCHAR(500) | Alamat lengkap |
| `phone` | VARCHAR(30) | Nomor telepon |
| `email` | VARCHAR(150) | Email |
| `hours` | VARCHAR(200) | Jam operasional |
| `instagram` | VARCHAR(100) | Handle Instagram |
| `logo` | VARCHAR(500) | Path/URL logo |

### `portfolio_items`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | Auto-increment |
| `title` | VARCHAR(200) | Judul portofolio |
| `category` | VARCHAR(100) | Kategori (Kemeja, Gaun, dll) |
| `image` | VARCHAR(500) | Path/URL gambar |
| `description` | VARCHAR(1000) | Deskripsi item |
| `createdAt` | DATETIME | Waktu ditambahkan |

---

## Alur Kerja Setup Awal

Urutan yang disarankan saat pertama kali setup project:

```bash
# 1. Install dependensi
pip install -r requirements.txt

# 2. Jalankan migration (buat semua tabel)
python manage.py migrate

# 3. Isi data dummy
python manage.py seed

# 4. Jalankan server
uvicorn app.main:app --reload
```

---

## Alur Menambah Tabel Baru (Hingga Jadi API)

Jika Anda ingin menambahkan tabel baru (misalnya `products`), ikuti 6 langkah berikut:

### 1. Buat Model (Database)
Buat file definisi model SQLAlchemy di dalam folder `app/models/` (misalnya `app/models/product.py`):

```python
from sqlalchemy import Column, Integer, String, Float
from ..database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    price = Column(Float)
```

### 2. Daftarkan Model ke Alembic dan Main
Agar tabel terdeteksi oleh migrasi otomatis dan aplikasi:
- Tambahkan import di **`migrations/env.py`**:
  ```python
  from app.models import product  # <-- tambahkan ini
  ```
- Tambahkan import di **`app/main.py`** (tempat model di-_load_):
  ```python
  from .models import worker, order, profile, portfolio, product  # <-- tambahkan product
  ```

### 3. Buat dan Jalankan Migration
Gunakan terminal untuk menghasilkan file migrasi baru dan menerapkannya:

```bash
# 1. Buat file migrasi (otomatis membaca model baru)
alembic revision --autogenerate -m "tambah tabel product"

# 2. Terapkan ke database
python manage.py migrate
```

### 4. Buat Pydantic Schema (Validasi Data)
Buat struktur schema untuk menvalidasi request/respons API di `app/schemas/` (misalnya `app/schemas/product.py`):

```python
from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    price: float

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        orm_mode = True # pydantic v1
        # from_attributes = True # pydantic v2
```

### 5. Buat CRUD Function
Buat fungsi logic query database di `app/crud/` (misalnya `app/crud/product.py`):

```python
from sqlalchemy.orm import Session
from ..models.product import Product
from ..schemas.product import ProductCreate

def create_product(db: Session, product: ProductCreate):
    db_product = Product(name=product.name, price=product.price)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session):
    return db.query(Product).all()
```

### 6. Buat Router API
Terakhir, buat endpoint di `app/routers/` (misalnya `app/routers/product.py`):

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas.product import ProductResponse, ProductCreate
from ..crud import product as crud_product

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    return crud_product.create_product(db, product)

@router.get("/", response_model=List[ProductResponse])
def read_products(db: Session = Depends(get_db)):
    return crud_product.get_products(db)
```

**Lalu daftarkan router ini** ke `app/main.py`:

```python
from .routers import product

# ... baris ke bawah
app.include_router(product.router)
```
