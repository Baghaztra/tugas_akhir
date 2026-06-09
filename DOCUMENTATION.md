# Dokumentasi Teknis — Sistem Manajemen Produksi Penjahit Yan

Aplikasi manajemen produksi untuk usaha konveksi/jahit, terdiri dari frontend (Nuxt 4) dan backend (FastAPI).

---

## Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Struktur Direktori](#3-struktur-direktori)
4. [Cara Menjalankan](#4-cara-menjalankan)
5. [Konfigurasi Environment](#5-konfigurasi-environment)
6. [Struktur & Format Penulisan Kode](#6-struktur--format-penulisan-kode)
7. [Halaman (Pages)](#7-halaman-pages)
8. [API Endpoints](#8-api-endpoints)
9. [Database](#9-database)
10. [Autentikasi](#10-autentikasi)
11. [Machine Learning (XGBoost Ranking)](#11-machine-learning-xgboost-ranking)
12. [Testing](#12-testing)
13. [Deployment](#13-deployment)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Arsitektur Sistem

Arsitektur **monorepo** dengan frontend dan backend terpisah:

```
┌──────────────┐     HTTP/REST     ┌──────────────┐     SQLAlchemy     ┌──────────┐
│   Frontend   │ ────────────────→ │   Backend    │ ────────────────→  │  MySQL   │
│  (Nuxt 4)   │  ←──────────────  │  (FastAPI)   │  ←───────────────  │  8.0     │
│  Port 3000   │     JSON          │  Port 8000   │                    │  3306    │
└──────────────┘                   └──────────────┘                    └──────────┘
```

- **Frontend**: Nuxt 4 (Vue 3) + Tailwind CSS + Pinia (state management)
- **Backend**: FastAPI + SQLAlchemy ORM + Alembic (migration)
- **Database**: MySQL 8.0
- **AI**: XGBoost (XGBRanker) untuk rekomendasi prioritas pesanan

---

## 2. Teknologi yang Digunakan

### Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Nuxt | 4.x | Framework Vue.js (SSR/SPA hybrid) |
| Vue | 3.5.x | Reactive UI framework |
| Tailwind CSS | via `@nuxtjs/tailwindcss` | Utility-first CSS |
| Pinia | via `@pinia/nuxt` | State management |
| Nuxt Icon | 2.x | Icon component (Heroicons) |
| Fabric.js | 7.x | Canvas sketch/drawing |
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
| Uvicorn | 0.40.x | ASGI server |

### Infrastructure

| Teknologi | Fungsi |
|-----------|--------|
| Docker Compose | MySQL + phpMyAdmin (development) |
| MySQL 8.0 | Database utama |
| phpMyAdmin | Database admin GUI |

---

## 3. Struktur Direktori

```
project/
├── docker-compose.yml          # Docker: MySQL + phpMyAdmin
├── DOCUMENTATION.md            # Dokumentasi ini
├── E2E_TESTING.md              # Panduan E2E testing
│
├── backend/                    # FastAPI Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # Entry point, register routers & middleware
│   │   ├── database.py         # SQLAlchemy engine & session
│   │   ├── auth.py             # JWT auth logic (login, token, hash)
│   │   ├── email.py            # SMTP email (OTP reset password)
│   │   ├── storage.py          # File upload storage
│   │   ├── ranking_logic.py    # XGBoost ranking inference
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── __init__.py     # Register semua model
│   │   │   ├── user.py
│   │   │   ├── worker.py
│   │   │   ├── order.py        # Order, OrderItem, OrderLog, GarmentType
│   │   │   ├── profile.py
│   │   │   ├── portfolio.py
│   │   │   ├── attributes.py
│   │   │   └── password_reset_token.py
│   │   ├── schemas/            # Pydantic schemas (request/response)
│   │   │   ├── order.py
│   │   │   ├── worker.py
│   │   │   ├── profile.py
│   │   │   ├── portfolio.py
│   │   │   ├── garment_type.py
│   │   │   └── attributes.py
│   │   ├── crud/               # Database operations
│   │   │   ├── order.py
│   │   │   ├── worker.py
│   │   │   ├── profile.py
│   │   │   ├── portfolio.py
│   │   │   ├── garment_type.py
│   │   │   └── attributes.py
│   │   └── routers/            # API route handlers
│   │       ├── auth.py         # /auth (login, logout, forgot-password, reset-password)
│   │       ├── orders.py       # /orders (CRUD, tracking, admin-work, status flow)
│   │       ├── workers.py      # /workers (CRUD, wages, performance)
│   │       ├── profile.py      # /profile (public, update)
│   │       ├── portfolio.py    # /portfolio (CRUD + image upload)
│   │       ├── dashboard.py    # /dashboard (summary, trend, notifications)
│   │       ├── analytics.py    # /reports (volume, product-trends, productivity)
│   │       ├── garment_types.py # /garment-types (CRUD)
│   │       └── attributes.py   # /attributes (CRUD)
│   ├── migrations/             # Alembic migration files
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── seeds/                  # Database seeder & reset
│   │   ├── seeder.py
│   │   └── reset.py
│   ├── xgboost/                # Model ML (.pkl)
│   ├── uploads/                # Uploaded files (sketch, portfolio images)
│   ├── manage.py               # CLI management (migrate, seed, reset, fresh)
│   ├── alembic.ini             # Alembic configuration
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables
│
├── frontend/                   # Nuxt 4 Application
│   ├── app/
│   │   ├── app.vue             # Root component
│   │   ├── pages/              # File-based routing
│   │   │   ├── index.vue       # Landing page (public)
│   │   │   ├── login.vue       # Login page
│   │   │   ├── forgot-password.vue
│   │   │   ├── tracking/       # Cek status pesanan (public)
│   │   │   │   ├── index.vue
│   │   │   │   └── [orderId].vue
│   │   │   ├── admin/          # Admin panel (protected)
│   │   │   │   ├── dashboard.vue
│   │   │   │   ├── work/       # Papan kerja (Kanban)
│   │   │   │   │   ├── index.vue
│   │   │   │   │   └── history.vue
│   │   │   │   ├── orders/     # Manajemen pesanan
│   │   │   │   │   ├── index.vue
│   │   │   │   │   ├── create.vue
│   │   │   │   │   └── [id].vue
│   │   │   │   ├── workers/    # Manajemen karyawan
│   │   │   │   │   ├── index.vue
│   │   │   │   │   └── [id].vue
│   │   │   │   ├── garment-types/
│   │   │   │   │   └── index.vue
│   │   │   │   ├── reports.vue # Laporan & analitik
│   │   │   │   └── settings.vue
│   │   │   └── task-list/      # Halaman khusus karyawan
│   │   │       └── index.vue
│   │   ├── layouts/            # Layout templates
│   │   │   ├── default.vue     # Public layout (navbar + footer)
│   │   │   ├── admin.vue       # Admin layout (sidebar + topbar)
│   │   │   └── employee.vue    # Employee layout (topbar + tabs)
│   │   ├── components/         # Reusable components
│   │   │   ├── ui/             # UI primitives
│   │   │   │   ├── AppButton.vue
│   │   │   │   ├── AppCard.vue
│   │   │   │   ├── AppBadge.vue
│   │   │   │   ├── AppModal.vue
│   │   │   │   ├── AppConfirmModal.vue
│   │   │   │   ├── AppStatCard.vue
│   │   │   │   ├── AppSkeleton.vue
│   │   │   │   └── AppEmptyState.vue
│   │   │   ├── PageHeader.vue
│   │   │   ├── ProductCard.vue
│   │   │   ├── ProductModal.vue
│   │   │   ├── SketchModal.vue
│   │   │   └── HistoryMeasurementModal.vue
│   │   ├── composables/        # Vue composables (data fetching)
│   │   │   ├── useOrders.ts
│   │   │   ├── useEmployees.ts
│   │   │   ├── useDashboard.ts
│   │   │   ├── useGarmentTypes.ts
│   │   │   ├── useAttributes.ts
│   │   │   ├── usePublic.ts
│   │   │   ├── useTasks.ts
│   │   │   └── useSketchCanvas.ts
│   │   ├── stores/             # Pinia stores
│   │   │   └── auth.ts         # Auth state (login, logout, token)
│   │   └── middleware/         # Route middleware
│   │       └── auth.global.ts  # Protect /admin/* routes
│   ├── e2e/                    # E2E tests (Playwright)
│   │   ├── playwright.config.ts
│   │   ├── tests/
│   │   │   ├── landing.spec.ts
│   │   │   ├── admin-dashboard.spec.ts
│   │   │   ├── orders.spec.ts
│   │   │   ├── workers.spec.ts
│   │   │   ├── tracking.spec.ts
│   │   │   ├── kanban.spec.ts
│   │   │   ├── forgot-password.spec.ts
│   │   │   └── api/
│   │   │       ├── orders.api.spec.ts
│   │   │       ├── workers.api.spec.ts
│   │   │       └── dashboard.api.spec.ts
│   │   ├── fixtures/
│   │   └── utils/
│   ├── shared/                 # Shared types/utils
│   ├── nuxt.config.ts          # Nuxt configuration
│   ├── tailwind.config.ts      # Tailwind customization (colors)
│   ├── tsconfig.json
│   ├── package.json
│   └── .env
```

---

## 4. Cara Menjalankan

### Prasyarat

- **Node.js** 18+ (direkomendasikan 20+)
- **Python** 3.10+
- **MySQL** 8.0
- **Docker** (opsional, untuk menjalankan MySQL)

### 4.1 Setup Database (Docker)

```bash
# Dari root project
docker-compose up -d
```

Ini akan menjalankan:
- MySQL 8.0 di port `3306`
- phpMyAdmin di port `8080` (akses via browser)

Buat database secara manual:

```sql
CREATE DATABASE IF NOT EXISTS tugas_akhir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4.2 Setup Backend

```bash
cd backend

# Buat virtual environment
python -m venv .venv

# Aktifkan venv (Windows)
.venv\Scripts\activate

# Aktifkan venv (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Konfigurasi .env (sesuaikan jika perlu)
# SQLALCHEMY_DATABASE_URL=mysql+mysqlconnector://root:root@localhost/tugas_akhir

# Jalankan migration
python manage.py migrate

# Seed data dummy
python manage.py seed

# Jalankan server
uvicorn app.main:app --reload
```

Backend berjalan di `http://localhost:8000`

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 4.3 Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Frontend berjalan di `http://localhost:3000`

### 4.4 Ringkasan Perintah

| Perintah | Lokasi | Fungsi |
|----------|--------|--------|
| `docker-compose up -d` | root | Jalankan MySQL + phpMyAdmin |
| `uvicorn app.main:app --reload` | backend | Jalankan backend (port 8000) |
| `npm run dev` | frontend | Jalankan frontend (port 3000) |
| `python manage.py migrate` | backend | Jalankan database migration |
| `python manage.py seed` | backend | Seed data dummy |
| `python manage.py reset` | backend | Reset semua data |
| `python manage.py fresh` | backend | Reset + seed ulang |
| `alembic revision --autogenerate -m "msg"` | backend | Buat migration baru |

---

## 5. Konfigurasi Environment

### Backend (.env)

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

### Frontend (.env)

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## 6. Struktur & Format Penulisan Kode

### Backend (Python / FastAPI)

**Konvensi penulisan:**

- **Python style**: PEP 8, type hints pada semua function signature
- **Naming**: `snake_case` untuk variable/function, `PascalCase` untuk class
- **File organization**: Satu file per entity di setiap layer (models, schemas, crud, routers)
- **Import**: Menggunakan relative import (`from ..models import ...`)

**Layer architecture:**

```
Router (endpoint) → CRUD (business logic) → Model (database) → Schema (validation)
```

- **Router** (`app/routers/`): Mendefinisikan endpoint, menangani request/response
- **Schema** (`app/schemas/`): Pydantic model untuk validasi input/output
- **CRUD** (`app/crud/`): Fungsi operasi database (query, insert, update, delete)
- **Model** (`app/models/`): SQLAlchemy ORM model (tabel database)

**Contoh pattern (CRUD):**

```python
# routers/worker.py - Endpoint
@router.post("/", response_model=Worker)
def create_worker(worker: WorkerCreate, db: Session = Depends(get_db)):
    return crud_worker.create_worker(db=db, worker=worker)

# crud/worker.py - Business logic
def create_worker(db: Session, worker: WorkerCreate):
    db_worker = Worker(**worker.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

# schemas/worker.py - Validation
class WorkerCreate(BaseModel):
    name: str
    role: WorkerRole
    wagePerPiece: float

# models/worker.py - Database model
class Worker(Base):
    __tablename__ = "workers"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    role = Column(Enum(WorkerRole))
```

**Router registration** di `app/main.py`:

```python
from .routers import workers, orders, profile
app.include_router(workers.router)
app.include_router(orders.router)
```

### Frontend (TypeScript / Vue 3 / Nuxt 4)

**Konvensi penulisan:**

- **Component**: `PascalCase` untuk nama file dan komponen (`AppButton.vue`)
- **Composable**: `camelCase` dengan prefix `use` (`useOrders.ts`)
- **Script**: `<script setup lang="ts">` (Composition API)
- **Style**: Tailwind CSS utility classes langsung di template
- **Naming**: `camelCase` untuk variable/function, `PascalCase` untuk component

**Composables pattern:**

Setiap entitas punya composable yang meng-handle data fetching:

```typescript
// composables/useOrders.ts
export function useOrders() {
  const { apiBase } = useRuntimeConfig().public
  const { data, status, refresh } = useFetch(`${apiBase}/orders`, {
    credentials: 'include',
  })
  return { orders: data, status, refresh }
}
```

**Page pattern:**

```vue
<template>
  <div>
    <definePageMeta :layout="'admin'" />
    <!-- Template content -->
  </div>
</template>

<script setup lang="ts">
const { orders, status } = useOrders()
</script>
```

**Component pattern:**

```vue
<template>
  <button :class="[baseClass, variantClass]">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
}>()
</script>
```

**UI Components** (`components/ui/`): Prefix `App` untuk semua UI primitives:

- `AppButton.vue` - Tombol dengan variant
- `AppCard.vue` - Card container
- `AppBadge.vue` - Label badge
- `AppModal.vue` - Modal dialog
- `AppConfirmModal.vue` - Konfirmasi dialog
- `AppStatCard.vue` - Statistik card (dashboard)
- `AppSkeleton.vue` - Loading skeleton
- `AppEmptyState.vue` - Empty state illustration

**State Management** (Pinia):

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  // ... actions
  return { user, isAuthenticated, login, logout }
})
```

**Route Protection** (`middleware/auth.global.ts`):

- `/admin/*` routes dilindungi, redirect ke `/login` jika belum autentikasi
- Jika sudah login dan akses `/login`, redirect ke `/admin/dashboard`

**Hybrid Rendering** (di `nuxt.config.ts`):

- `/` → Prerender (statis, SEO optimal)
- `/login`, `/admin/*`, `/task-list/*`, `/tracking/*` → SPA (client-side)

**Tailwind Custom Colors** (di `tailwind.config.ts`):

- `primary`: Teal/hijau (brand color)
- `secondary`: Cream/beige

---

## 7. Halaman (Pages)

### Public Pages

| Route | File | Layout | Deskripsi |
|-------|------|--------|-----------|
| `/` | `pages/index.vue` | default | Landing page: hero, profil usaha, portofolio, kontak |
| `/login` | `pages/login.vue` | - | Halaman login admin |
| `/forgot-password` | `pages/forgot-password.vue` | - | Reset password via OTP |
| `/tracking` | `pages/tracking/index.vue` | default | Form cek pesanan by nomor resi |
| `/tracking/[orderId]` | `pages/tracking/[orderId].vue` | default | Detail status pesanan |

### Admin Pages (Protected)

| Route | File | Layout | Deskripsi |
|-------|------|--------|-----------|
| `/admin/dashboard` | `pages/admin/dashboard.vue` | admin | Dashboard: stat cards, tren chart, notifikasi deadline |
| `/admin/work` | `pages/admin/work/index.vue` | admin | Papan kerja Kanban (Potong → Jahit → Finishing) |
| `/admin/work/history` | `pages/admin/work/history.vue` | admin | Riwayat pekerjaan |
| `/admin/orders` | `pages/admin/orders/index.vue` | admin | Daftar pesanan (search, filter) |
| `/admin/orders/create` | `pages/admin/orders/create.vue` | admin | Form buat pesanan baru |
| `/admin/orders/[id]` | `pages/admin/orders/[id].vue` | admin | Detail/edit pesanan |
| `/admin/workers` | `pages/admin/workers/index.vue` | admin | Daftar karyawan |
| `/admin/workers/[id]` | `pages/admin/workers/[id].vue` | admin | Detail karyawan (upah, performa) |
| `/admin/garment-types` | `pages/admin/garment-types/index.vue` | admin | Kelola jenis pakaian |
| `/admin/reports` | `pages/admin/reports.vue` | admin | Laporan & analitik (volume, tren, produktivitas) |
| `/admin/settings` | `pages/admin/settings.vue` | admin | Pengaturan profil usaha & ganti password |

### Employee Pages

| Route | File | Layout | Deskripsi |
|-------|------|--------|-----------|
| `/task-list` | `pages/task-list/index.vue` | employee | Daftar tugas karyawan (prioritas ML) |

### Layouts

| Layout | File | Digunakan oleh |
|--------|------|----------------|
| `default` | `layouts/default.vue` | Halaman public (navbar + footer) |
| `admin` | `layouts/admin.vue` | Halaman admin (sidebar + topbar + mobile bottom nav) |
| `employee` | `layouts/employee.vue` | Halaman karyawan (topbar + tab nav) |

---

## 8. API Endpoints

Base URL: `http://localhost:8000`

### Auth (`/auth`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/auth/login` | No | Login, set cookie `access_token` |
| POST | `/auth/logout` | No | Hapus cookie |
| PUT | `/auth/password` | Yes | Ganti password |
| POST | `/auth/forgot-password` | No | Kirim OTP ke email |
| PUT | `/auth/reset-password` | No | Reset password dengan OTP |

### Orders (`/orders`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/orders/` | Yes | Buat order baru (multipart: JSON + sketch files) |
| GET | `/orders/` | Yes | List semua order (query: `search`, `skip`, `limit`) |
| GET | `/orders/history` | Yes | Riwayat pelanggan (query: `search`) |
| GET | `/orders/tracking/{receipt}` | No | Tracking pesanan by nomor resi (public) |
| GET | `/orders/admin-work` | Yes | Data Kanban board (grouped by phase) |
| PUT | `/orders/items/{item_id}/status` | Yes | Update status item (progress flow) |
| GET | `/orders/{order_id}` | Yes | Detail order |
| PUT | `/orders/{order_id}` | Yes | Update order |
| DELETE | `/orders/{order_id}` | Yes | Hapus order |

### Workers (`/workers`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/workers/` | Yes | Tambah karyawan |
| GET | `/workers/` | Yes | List semua karyawan |
| GET | `/workers/{id}` | Yes | Detail karyawan |
| PUT | `/workers/{id}` | Yes | Update karyawan |
| DELETE | `/workers/{id}` | Yes | Hapus karyawan |
| GET | `/workers/{id}/wages` | Yes | Hitung upah (query: `start_date`, `end_date`) |
| GET | `/workers/{id}/performance` | Yes | Statistik performa (query: `days`) |

### Profile (`/profile`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/profile/public` | No | Ambil profil bisnis (public) |
| PUT | `/profile/` | Yes | Update profil bisnis |

### Portfolio (`/portfolio`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/portfolio/` | No | List portofolio (public) |
| POST | `/portfolio/` | Yes | Tambah portofolio (dengan gambar) |
| PUT | `/portfolio/{id}` | Yes | Update metadata portofolio |
| POST | `/portfolio/{id}/image` | Yes | Ganti gambar portofolio |
| DELETE | `/portfolio/{id}` | Yes | Hapus portofolio |

### Dashboard (`/dashboard`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/dashboard/summary` | Yes | Ringkasan: pesanan aktif, pendapatan mingguan, selesai hari ini |
| GET | `/dashboard/trend` | Yes | Tren 7 hari: pesanan masuk vs selesai |
| GET | `/dashboard/notifications` | Yes | Pesanan mendekati deadline (≤3 hari) |

### Reports (`/reports`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/reports/volume` | Yes | Volume pesanan (query: `period=weekly\|monthly`) |
| GET | `/reports/product-trends` | Yes | Tren jenis pakaian |
| GET | `/reports/productivity` | Yes | Produktivitas karyawan |

### Garment Types (`/garment-types`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/garment-types/` | Yes | Tambah jenis pakaian |
| GET | `/garment-types/` | Yes | List semua jenis |
| GET | `/garment-types/{id}` | Yes | Detail jenis |
| PUT | `/garment-types/{id}` | Yes | Update jenis |
| DELETE | `/garment-types/{id}` | Yes | Hapus jenis (soft delete) |

### Attributes (`/attributes`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/attributes/` | Yes | Tambah attribute |
| GET | `/attributes/` | Yes | List semua attribute |
| DELETE | `/attributes/{id}` | Yes | Hapus attribute |

---

## 9. Database

### ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  orders     │──1:N──│  order_items  │──1:N──│  order_logs │
└─────────────┘       └──────────────┘       └─────────────┘
                            │                      │
                           N:1                    N:1
                            │                      │
                      ┌─────┴──────┐         ┌────┴────┐
                      │garment_types│         │ workers │
                      └────────────┘         └─────────┘

┌──────────────────┐  ┌────────────────┐  ┌──────────┐  ┌───────────────┐
│business_profiles │  │portfolio_items │  │attributes│  │     users     │
└──────────────────┘  └────────────────┘  └──────────┘  └───────────────┘
```

### Tabel Utama

| Tabel | Fungsi |
|-------|--------|
| `orders` | Data pesanan (customer, deadline, pembayaran) |
| `order_items` | Item dalam pesanan (garment type, ukuran, status, sketch) |
| `order_logs` | Log perubahan status setiap item |
| `workers` | Data karyawan (nama, role, upah per pcs) |
| `garment_types` | Jenis pakaian (Kemeja, Batik, dll) |
| `attributes` | Attribute tags (Bordir, Furing, dll) |
| `business_profiles` | Profil bisnis (single row, id=1) |
| `portfolio_items` | Portofolio hasil jahit |
| `users` | Akun admin |
| `password_reset_tokens` | Token OTP reset password |

### Status Flow Order Item

```
received → cutting → cutted → sewing → sewed → finishing → done
```

- `received`: Pesanan diterima
- `cutting`: Sedang dipotong
- `cutted`: Selesai dipotong (siap dijahit)
- `sewing`: Sedang dijahit
- `sewed`: Selesai dijahit (siap finishing)
- `finishing`: Sedang finishing
- `done`: Selesai

### Alur Development Database

1. Ubah model di `app/models/`
2. Generate migration: `alembic revision --autogenerate -m "message"`
3. Apply migration: `python manage.py migrate`
4. (Opsional) Seed data: `python manage.py seed`

---

## 10. Autentikasi

- **Metode**: JWT (JSON Web Token) via HTTP-only cookie
- **Library**: `python-jose` (JWT), `passlib` + `bcrypt` (password hashing)
- **Token disimpan di**: Cookie `access_token` (httponly, samesite=lax)
- **Fallback**: Header `Authorization: Bearer <token>`
- **Durasi token**: 1440 menit (24 jam), dikonfigurasi via `JWT_EXPIRE_MINUTES`

### Alur Login

1. Frontend mengirim `POST /auth/login` dengan `{email, password}`
2. Backend verifikasi credential, generate JWT
3. JWT diset sebagai cookie `access_token`
4. Frontend menyimpan user info di localStorage (`auth_user`)
5. Setiap request ke `/admin/*` menyertakan cookie secara otomatis

### Proteksi Route

- **Backend**: Dependency `get_current_user` pada endpoint yang memerlukan auth
- **Frontend**: Global middleware `auth.global.ts` melindungi `/admin/*` routes

---

## 11. Machine Learning (XGBoost Ranking)

Model XGBoost (XGBRanker) digunakan untuk mengurutkan pesanan berdasarkan prioritas.

**File model**: `backend/xgboost/xgboost_ranker_v5.pkl`

**Fitur yang digunakan:**
- `days_to_deadline`: Sisa hari ke deadline
- Attribute flags (Bordir, Furing, dll): 1/0

**Alur inference:**
1. Ambil data pesanan dari database
2. Hitung `days_to_deadline` dari hari ini
3. Parse attributes sebagai binary features
4. Prediksi skor menggunakan model XGBoost
5. Sort descending (skor tertinggi = prioritas tertinggi)

**Fallback**: Jika model tidak tersedia, sort berdasarkan deadline ascending.

**Digunakan di:**
- `GET /orders/admin-work` → Kanban board
- Halaman task-list karyawan

---

## 12. Testing

### Stack Testing

| Tool | Fungsi |
|------|--------|
| Playwright | E2E testing (browser) + API contract testing |
| TypeScript | Bahasa test |

### Struktur Test

```
frontend/e2e/
├── playwright.config.ts
├── tests/
│   ├── landing.spec.ts           # Landing page render
│   ├── admin-dashboard.spec.ts   # Dashboard stat cards, chart
│   ├── orders.spec.ts            # Order CRUD flows
│   ├── workers.spec.ts           # Worker CRUD flows
│   ├── tracking.spec.ts          # Public tracking page
│   ├── kanban.spec.ts            # Kanban board
│   ├── forgot-password.spec.ts   # Forgot password flow
│   └── api/
│       ├── orders.api.spec.ts    # API contract: orders
│       ├── workers.api.spec.ts   # API contract: workers
│       └── dashboard.api.spec.ts # API contract: dashboard & reports
```

### Menjalankan Test

**Prasyarat**: Backend dan frontend harus berjalan.

```bash
# Jalankan semua test
cd frontend
npx playwright test --config=e2e/playwright.config.ts

# Jalankan dengan browser terlihat
npx playwright test --config=e2e/playwright.config.ts --headed

# Jalankan satu file test
npx playwright test --config=e2e/playwright.config.ts e2e/tests/orders.spec.ts

# Jalankan API test saja
npx playwright test --config=e2e/playwright.config.ts e2e/tests/api/

# Debug mode
npx playwright test --config=e2e/playwright.config.ts --debug

# Lihat HTML report
npx playwright show-report .playwright-report
```

### Konfigurasi Playwright

| Setting | Value | Keterangan |
|---------|-------|------------|
| `baseURL` | `http://localhost:3000` | Nuxt dev server |
| `workers` | `1` | Sequential (hindari race condition DB) |
| `retries` | `0` (local), `1` (CI) | Retry on failure |
| `trace` | `on-first-retry` | Debug trace saat retry |
| `webServer` | `npm run dev` on port 3000 | Auto-start frontend |

### Prinsip Testing

1. **API tests** buat data sendiri dan cleanup di `afterEach`
2. **UI tests** read-only (verifikasi render dengan data existing)
3. **Isolated** — setiap file test independen
4. **Deterministic** — prefix test data dengan "E2E Test"
5. **No hardcoded waits** — gunakan `waitForLoadState` atau `toBeVisible`

---

## 13. Deployment

### Build Frontend (Production)

```bash
cd frontend
npm run build
npm run preview  # Preview hasil build
```

### Backend Production

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Environment Variables Production

Pastikan mengatur:
- `JWT_SECRET` → random string yang kuat
- `SQLALCHEMY_DATABASE_URL` → koneksi database production
- `ALLOWED_ORIGINS` → domain frontend production
- `SMTP_*` → konfigurasi email production

---

## 14. Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `SQLALCHEMY_DATABASE_URL not set` | `.env` tidak ada atau salah | Buat/sesuaikan file `.env` di `backend/` |
| `Connection refused` ke MySQL | MySQL tidak berjalan | `docker-compose up -d` atau jalankan MySQL manual |
| CORS error dari frontend | `ALLOWED_ORIGINS` tidak sesuai | Tambahkan origin frontend di `.env` backend |
| `Module not found` di backend | Virtual env tidak aktif | Aktifkan `.venv\Scripts\activate` |
| Playwright `ERR_CONNECTION_REFUSED` | Server tidak berjalan | Pastikan backend (8000) dan frontend (3000) running |
| Migration error | Model baru belum di-import | Tambahkan import di `migrations/env.py` dan `app/models/__init__.py` |
| XGBoost model not loaded | File `.pkl` tidak ada | Pastikan `backend/xgboost/xgboost_ranker_v5.pkl` exists |
| Cookie tidak terkirim | CORS credentials issue | Pastikan `allow_credentials=True` di backend CORS config |
