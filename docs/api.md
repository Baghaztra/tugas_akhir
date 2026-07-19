# API Endpoints

Base URL: `http://localhost:8000`

Total: 57 endpoints (8 public, 49 auth required).

## Auth (`/auth`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/auth/login` | No | Login, set cookie `access_token` |
| POST | `/auth/logout` | No | Hapus cookie |
| PUT | `/auth/password` | Yes | Ganti password (requires current password) |
| POST | `/auth/forgot-password` | No | Kirim OTP ke email |
| PUT | `/auth/reset-password` | No | Reset password dengan OTP |

## Orders (`/orders`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/orders/` | Yes | Buat order baru (multipart: JSON `data` field + `sketch_files`) |
| GET | `/orders/` | Yes | List semua order (query: `search`, `skip`, `limit`) |
| GET | `/orders/history` | Yes | Riwayat pelanggan (query: `search`, min 1 char) |
| GET | `/orders/tracking/{receipt}` | No | Tracking pesanan by nomor resi (public) |
| GET | `/orders/admin-work` | Yes | Data Kanban board (grouped by phase: cutting/sewing/finishing, split ready/in_progress) |
| PUT | `/orders/items/{item_id}/status` | Yes | Update status item (advance ke fase berikutnya) |
| PUT | `/orders/items/{item_id}/undo` | Yes | Undo status item terakhir |
| GET | `/orders/{order_id}` | Yes | Detail order |
| PUT | `/orders/{order_id}` | Yes | Update order |
| DELETE | `/orders/{order_id}` | Yes | Hapus order |

## Workers (`/workers`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/workers/` | No | Tambah karyawan |
| GET | `/workers/` | Yes | List semua karyawan (query: `skip`, `limit`) |
| GET | `/workers/{id}` | Yes | Detail karyawan |
| PUT | `/workers/{id}` | Yes | Update karyawan |
| DELETE | `/workers/{id}` | Yes | Hapus karyawan |
| GET | `/workers/{id}/performance` | Yes | Statistik performa (query: `days`, default 7, range 1-90) |
| GET | `/workers/{id}/tasks` | Yes | Daftar tugas karyawan (query: `limit`, default 20, range 1-100) |

## Customers (`/customers`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/customers/` | Yes | Tambah pelanggan |
| GET | `/customers/` | Yes | List pelanggan (query: `search`, `skip`, `limit`) |
| GET | `/customers/search` | Yes | Autocomplete search (query: `query` min 1 char, `limit` default 10 range 1-50) |
| GET | `/customers/{id}` | Yes | Detail pelanggan |
| GET | `/customers/{id}/detail` | Yes | Detail pelanggan dengan order history |
| PUT | `/customers/{id}` | Yes | Update pelanggan |
| DELETE | `/customers/{id}` | Yes | Hapus pelanggan |

## Profile (`/profile`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/profile/public` | No | Ambil profil bisnis (public) |
| PUT | `/profile/` | Yes | Update profil bisnis |

## Portfolio (`/portfolio`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/portfolio/` | No | List portofolio (public, query: `skip`, `limit`) |
| POST | `/portfolio/` | Yes | Tambah portofolio (multipart: title, category, description, image) |
| PUT | `/portfolio/{id}` | Yes | Update metadata portofolio |
| POST | `/portfolio/{id}/image` | Yes | Ganti gambar portofolio |
| DELETE | `/portfolio/{id}` | Yes | Hapus portofolio + file gambar |

## Dashboard (`/dashboard`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/dashboard/summary` | Yes | Ringkasan: active orders, weekly revenue, today done, active employees, overdue, payment breakdown |
| GET | `/dashboard/trend` | Yes | Tren 7 hari: pesanan masuk vs selesai per hari |
| GET | `/dashboard/notifications` | Yes | Pesanan mendekati deadline (<=3 hari) dengan item belum selesai |

## Reports (`/reports`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/reports/volume` | Yes | Volume pesanan (query: `period` weekly\|monthly, `start_date`, `end_date`) |
| GET | `/reports/product-trends` | Yes | Tren jenis pakaian (query: `start_date`, `end_date`) |
| GET | `/reports/productivity` | Yes | Produktivitas karyawan (query: `start_date`, `end_date`) |
| GET | `/reports/weekly-recap` | Yes | Rekap mingguan: summary, daily, by garment, by payment (query: `week_start`) |
| GET | `/reports/weekly-recap/export` | Yes | Export rekap mingguan ke Excel .xlsx (query: `week_start`) |

## Garment Types (`/garment-types`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/garment-types/` | Yes | Tambah jenis pakaian |
| GET | `/garment-types/` | Yes | List semua jenis (query: `skip`, `limit`) |
| GET | `/garment-types/{id}` | Yes | Detail jenis |
| PUT | `/garment-types/{id}` | Yes | Update jenis |
| DELETE | `/garment-types/{id}` | Yes | Hapus jenis (soft delete) |

## Attributes (`/attributes`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/attributes/` | Yes | Tambah attribute |
| GET | `/attributes/` | Yes | List semua attribute (query: `skip`, `limit`) |
| DELETE | `/attributes/{id}` | Yes | Hapus attribute |

## Users (`/users`)

Owner-only endpoints (requires `is_owner == True`).

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/users/` | Yes (owner) | List semua user (query: `skip`, `limit`) |
| GET | `/users/{id}` | Yes (owner) | Detail user |
| POST | `/users/` | Yes (owner) | Buat user baru |
| PUT | `/users/{id}` | Yes (owner) | Update user (cannot remove own owner status) |
| DELETE | `/users/{id}` | Yes (owner) | Hapus user (cannot delete self) |

## Health Check

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/` | No | Returns `{"message": "API is running..."}` |
