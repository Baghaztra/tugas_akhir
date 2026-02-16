# Rencana Implementasi: Sistem Manajemen Produksi

Dokumen ini merangkum rencana migrasi dari prototype ke aplikasi production-ready, disesuaikan dengan proposal dan tabel fitur yang diajukan.

## 1. Arsitektur Sistem

Aplikasi akan menggunakan arsitektur frontend dan backend yang terpisah:

- **Frontend**: Nuxt 4 (Framework Vue.js) + Tailwind CSS
  - Direktori `frontend/`.
  - Bertanggung jawab untuk UI/UX dan interaksi dengan API Backend.
- **Backend**: FastAPI (Python)
  - Direktori `backend/`.
  - Bertanggung jawab untuk logika bisnis, operasi database, dan inferensi XGBoost (Ranking Prioritas).
  - Database: MySQL (untuk produksi).

## 2. Struktur Modul & Fitur

Berdasarkan proposal, aplikasi akan terdiri dari 5 modul utama:

### A. Modul Profil Usaha (Public)

- **Fungsi**: Menampilkan informasi usaha kepada publik.
- **Fitur**:
  - Halaman Landing Page berisi: Alamat, Kontak, Jam Operasional.
  - Portofolio jahitan (Galeri foto).
  - Cek Status Pesanan (via Nomor Resi/Order ID).

### B. Modul Manajemen Pesanan

- **Fungsi**: Mengelola siklus hidup pesanan dari masuk hingga selesai.
- **Fitur**:
  - **Pencatatan**: Input data pelanggan, ukuran, jenis pakaian, dan deadline.
  - **Status Pengerjaan**: Update status (Potong -> Jahit -> Finishing -> Selesai).
  - **Nota Digital**: Generate link unik untuk pelanggan berisi detail pesanan dan progres.

### C. Modul Manajemen Pekerja

- **Fungsi**: Mengelola data dan kinerja SDM.
- **Fitur**:
  - **Data Pekerja**: Nama, Spesialisasi (Potong/Jahit/Finishing).
  - **Beban Kerja**: Monitoring jumlah pesanan aktif per pekerja.
  - **Kalkulasi Upah**: Hitung upah mingguan berdasarkan jumlah pesanan yang diselesaikan (Piece-rate).
  - **View Pekerja**: Halaman khusus pekerja untuk melihat daftar prioritas pekerjaan (Rekomendasi ML).

### D. Modul Laporan & Analitik

- **Fungsi**: Evaluasi performa usaha.
- **Fitur**:
  - **Analitik Volume**: Grafik pesanan masuk/selesai per periode.
  - **Tren Pakaian**: Jenis pakaian paling populer.
  - **Produktivitas**: Rata-rata waktu penyelesaian per pekerja.
  - **Laporan Otomatis**: Rekap mingguan yang bisa di-export (PDF/Excel).

### E. Core AI: Rekomendasi Prioritas

- **Algoritma**: XGBRanker.
- **Fungsi**: Mengurutkan antrean pesanan di setiap tahap (Potong, Jahit, Finishing) berdasarkan urgensi (deadline) dan kompleksitas.

## 3. Struktur Direktori Project

```
project/
├── backend/                # Aplikasi FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # Entry point
│   │   ├── models.py       # Model Database (SQLAlchemy -> MySQL)
│   │   ├── schemas.py      # Schema Pydantic
│   │   ├── crud.py         # Operasi Database
│   │   ├── database.py     # Koneksi DB MySQL
│   │   ├── ranking_logic.py # Integrasi Model XGBoost
│   │   └── routers/        # API Routes
│   │       ├── orders.py
│   │       ├── workers.py
│   │       ├── analytics.py # Endpoint laporan
│   │       └── profile.py   # Endpoint profil usaha
│   ├── models/             # File .pkl Model ML
│   ├── requirements.txt
│   └── .env
├── frontend/               # Aplikasi Nuxt 4
│   ├── app/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── index.vue           # Landing Page / Profil Usaha
│   │   │   ├── tracking/           # Halaman Cek Resi
│   │   │   ├── admin/              # Halaman Admin (Protected)
│   │   │   │   ├── dashboard.vue
│   │   │   │   ├── orders/
│   │   │   │   ├── workers/
│   │   │   │   ├── reports/
│   │   │   │   └── settings/       # Edit Profil Usaha
│   │   │   └── worker/           # View Khusus Pekerja
│   │   │       └── file.vue        # List Prioritas
│   ├── nuxt.config.ts
│   └── package.json
├── API_DOCS.md             # Dokumentasi API
├── PAGE_DOCS.md            # Rencana Halaman Frontend
└── README.md
```

## 4. Langkah Selanjutnya

1.  **Setup Backend**: Inisialisasi FastAPI dengan driver MySQL (`mysql-connector-python` atau `pymysql`).
2.  **Database**: Buat skema database yang mencakup tabel: `Orders`, `Workers`, `ShopProfile`, `WorkerPerformance`.
3.  **API Development**: Implementasi endpoint sesuai `API_DOCS.md`.
4.  **Frontend Development**: Bangun halaman sesuai `PAGE_DOCS.md`.

## 5. Checklist Implementasi (To-Do List)

Silakan centang jika sudah selesai.

### Phase 1: Inisialisasi Project

- [ ] Setup Virtual Environment (Backend) & Install Dependencies (`fastapi`, `uvicorn`, `sqlalchemy`, `mysql-connector-python`, `xgboost`).
- [ ] Setup Database MySQL (Create Schema & Users).
- [ ] Inisialisasi Project Nuxt 4 (Frontend) & Install Tailwind CSS.
- [ ] Konfigurasi `package.json` dan `nuxt.config.ts`.

### Phase 2: Backend Development

#### Core & Database

- [ ] Setup `database.py` (Koneksi MySQL).
- [ ] Buat Model `models.py` (Orders, Workers, ShopProfile, WorkerPerformance).
- [ ] Setup Migration (Alembic) atau `init_db.py`.

#### API Endpoints

- [ ] **Modul Profil**: `GET /profile`, `PUT /profile`.
- [ ] **Modul Pesanan**: CRUD Orders (`POST`, `GET`, `PUT`), Generate Nota Link.
- [ ] **Modul Karyawan**: CRUD Workers, `GET /wages`, `GET /performance`.
- [ ] **Modul Laporan**: `GET /reports/volume`, `GET /reports/trends`.
- [ ] **AI Ranking**: Porting logic `ranking_logic.py`, Endpoint `GET /orders/priority`.

### Phase 3: Frontend Development

#### Layouts & Components

- [ ] Layout Utama (Navbar, Footer).
- [ ] Layout Admin (Sidebar).
- [ ] Komponen UI Dasar (Button, Card, Input Form, Modal).

#### Halaman (Pages)

- [ ] **Public View**:
  - [ ] Landing Page (`/`).
  - [ ] Tracking Page (`/tracking`).
- [ ] **Admin View**:
  - [ ] Dashboard (`/admin/dashboard`).
  - [ ] Manajemen Pesanan (`/admin/orders`).
  - [ ] Manajemen Pekerja (`/admin/workers`).
  - [ ] Laporan (`/admin/reports`).
  - [ ] Settings (`/admin/settings`).
- [ ] **Employee View**:
  - [ ] Task List (`/employee/tasks`).

### Phase 4: Integration & Deploy

- [ ] Integrasi Frontend dengan AI Priority Endpoint.
- [ ] Testing Flow Lengkap (Buat Pesanan -> Alur Produksi -> Selesai).
- [ ] Final Review & Polishing UI.
