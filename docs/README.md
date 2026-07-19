# Dokumentasi Teknis — Penjahit Yan

Aplikasi manajemen produksi untuk usaha konveksi/jahit. Nuxt 4 + FastAPI + MySQL.

## File Index

| File | Isi | Kapan dibaca |
|------|-----|-------------|
| [architecture.md](architecture.md) | Arsitektur sistem, tech stack | Perlu gambaran umum sistem |
| [setup.md](setup.md) | Cara menjalankan, env config | Mulai development |
| [coding-conventions.md](coding-conventions.md) | Code style, pola penulisan | Menulis/mereview kode |
| [pages.md](pages.md) | Daftar halaman, routing, akses | Kerja di frontend |
| [api.md](api.md) | Semua endpoint REST | Kerja di backend / integrasi |
| [database.md](database.md) | ERD, tabel, status flow, migration | Ubah schema / query DB |
| [auth.md](auth.md) | Autentikasi JWT, role, middleware | Ubah auth / akses kontrol |
| [ml.md](ml.md) | XGBoost ranking, fitur, inference | Kerja di fitur prioritas |
| [testing.md](testing.md) | Playwright E2E & API testing | Menjalankan / menulis test |
| [deployment.md](deployment.md) | Build & deploy production | Deploy ke server |
| [troubleshooting.md](troubleshooting.md) | Masalah umum & solusi | Debugging |

## Ringkasan Cepat

- **Frontend**: Nuxt 4 (Vue 3) + Tailwind CSS + Pinia — port 3000
- **Backend**: FastAPI + SQLAlchemy + Alembic — port 8000
- **Database**: MySQL 8.0 — port 3306
- **AI**: XGBoost XGBRanker untuk rekomendasi prioritas pesanan
- **Testing**: Playwright (E2E + API contract)
- **Infra**: Docker Compose (MySQL + phpMyAdmin)
