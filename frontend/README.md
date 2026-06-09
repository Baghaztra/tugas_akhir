# Frontend — Sistem Manajemen Produksi

Frontend aplikasi manajemen produksi konveksi, dibangun dengan Nuxt 4 + Vue 3 + Tailwind CSS.

## Teknologi

| Package | Fungsi |
|---------|--------|
| Nuxt 4 | Framework Vue.js (SSR/SPA hybrid) |
| Vue 3 | Reactive UI framework |
| Tailwind CSS | Utility-first CSS |
| Pinia | State management |
| Nuxt Icon | Icon component (Heroicons) |
| Fabric.js | Canvas sketch/drawing |
| Playwright | E2E & API testing |

## Struktur Project

```
frontend/
├── app/
│   ├── app.vue              # Root component
│   ├── pages/               # File-based routing
│   │   ├── index.vue        # Landing page (public)
│   │   ├── login.vue        # Login admin
│   │   ├── forgot-password.vue
│   │   ├── tracking/        # Cek pesanan (public)
│   │   ├── admin/           # Admin panel (protected)
│   │   │   ├── dashboard.vue
│   │   │   ├── work/        # Kanban board
│   │   │   ├── orders/      # Manajemen pesanan
│   │   │   ├── workers/     # Manajemen karyawan
│   │   │   ├── garment-types/
│   │   │   ├── reports.vue
│   │   │   └── settings.vue
│   │   └── task-list/       # Halaman karyawan
│   ├── layouts/
│   │   ├── default.vue      # Public (navbar + footer)
│   │   ├── admin.vue        # Admin (sidebar + topbar)
│   │   └── employee.vue     # Employee (topbar + tabs)
│   ├── components/
│   │   ├── ui/              # UI primitives (AppButton, AppCard, etc.)
│   │   ├── PageHeader.vue
│   │   ├── ProductCard.vue
│   │   ├── ProductModal.vue
│   │   ├── SketchModal.vue
│   │   └── HistoryMeasurementModal.vue
│   ├── composables/         # Data fetching composables
│   │   ├── useOrders.ts
│   │   ├── useEmployees.ts
│   │   ├── useDashboard.ts
│   │   ├── useGarmentTypes.ts
│   │   ├── useAttributes.ts
│   │   ├── usePublic.ts
│   │   ├── useTasks.ts
│   │   └── useSketchCanvas.ts
│   ├── stores/
│   │   └── auth.ts          # Auth state (Pinia)
│   └── middleware/
│       └── auth.global.ts   # Route protection
├── e2e/                     # Playwright E2E tests
│   ├── playwright.config.ts
│   ├── tests/
│   ├── fixtures/
│   └── utils/
├── shared/                  # Shared types/utils
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Prasyarat

- Node.js 18+ (direkomendasikan 20+)
- Backend berjalan di `http://localhost:8000`

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root `frontend/`:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Frontend berjalan di `http://localhost:3000`

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview hasil build |
| `npm run generate` | Generate static site |

## Halaman

### Public

| Route | Deskripsi |
|-------|-----------|
| `/` | Landing page: hero, profil usaha, portofolio |
| `/login` | Login admin |
| `/forgot-password` | Reset password via OTP |
| `/tracking` | Form cek pesanan by nomor resi |
| `/tracking/[orderId]` | Detail status pesanan |

### Admin (Protected)

| Route | Deskripsi |
|-------|-----------|
| `/admin/dashboard` | Dashboard: stat cards, tren chart, notifikasi |
| `/admin/work` | Papan kerja Kanban (Potong → Jahit → Finishing) |
| `/admin/work/history` | Riwayat pekerjaan |
| `/admin/orders` | Daftar pesanan (search, filter) |
| `/admin/orders/create` | Buat pesanan baru |
| `/admin/orders/[id]` | Detail/edit pesanan |
| `/admin/workers` | Daftar karyawan |
| `/admin/workers/[id]` | Detail karyawan (upah, performa) |
| `/admin/garment-types` | Kelola jenis pakaian |
| `/admin/reports` | Laporan & analitik |
| `/admin/settings` | Pengaturan profil usaha & ganti password |

### Employee

| Route | Deskripsi |
|-------|-----------|
| `/task-list` | Daftar tugas karyawan (prioritas ML) |

## Testing (E2E)

### Install Playwright

```bash
npm install -D @playwright/test
npx playwright install chromium
```

### Jalankan Test

```bash
# Semua test
npx playwright test --config=e2e/playwright.config.ts

# Dengan browser terlihat
npx playwright test --config=e2e/playwright.config.ts --headed

# File tertentu
npx playwright test --config=e2e/playwright.config.ts e2e/tests/orders.spec.ts

# API test saja
npx playwright test --config=e2e/playwright.config.ts e2e/tests/api/

# Debug mode
npx playwright test --config=e2e/playwright.config.ts --debug

# HTML report
npx playwright show-report .playwright-report
```

Lihat [E2E_TESTING.md](../E2E_TESTING.md) untuk dokumentasi lengkap testing.

## Konfigurasi

### Hybrid Rendering (nuxt.config.ts)

- `/` → Prerender (statis, SEO optimal)
- `/login`, `/admin/*`, `/task-list/*`, `/tracking/*` → SPA (client-side)

### Custom Colors (tailwind.config.ts)

- `primary`: Teal/hijau (brand color)
- `secondary`: Cream/beauty

### Route Protection (middleware/auth.global.ts)

- `/admin/*` dilindungi, redirect ke `/login` jika belum autentikasi
- Sudah login + akses `/login` → redirect ke `/admin/dashboard`
