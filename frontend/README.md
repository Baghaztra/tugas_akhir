# Frontend — Sistem Manajemen Produksi

Frontend aplikasi manajemen produksi konveksi, dibangun dengan **Nuxt 4 + Vue 3 + Tailwind CSS**.

## Teknologi

| Package              | Fungsi                        |
| -------------------- | ----------------------------- |
| Nuxt 4               | Framework Vue.js (SSR/SPA)    |
| Vue 3                | Reactive UI framework         |
| Tailwind CSS         | Utility-first CSS             |
| Pinia                | State management              |
| Nuxt Icon            | Icon component (Heroicons)    |
| Fabric.js            | Canvas sketch/drawing         |
| Chart.js + vue-chart.js | Chart & grafik             |
| Playwright           | E2E & API testing             |

## Prasyarat

- Node.js 18+ (direkomendasikan 20+)
- Backend berjalan di `http://localhost:8000`

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

File `.env` di root `frontend/`:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Frontend berjalan di `http://localhost:3000`

### Scripts Lain

| Perintah           | Fungsi                    |
| ------------------ | ------------------------- |
| `npm run build`    | Build untuk production    |
| `npm run preview`  | Preview hasil build       |
| `npm run generate` | Generate static site      |

## Struktur Project

```
frontend/
├── app/
│   ├── app.vue                  # Root component
│   ├── pages/                   # File-based routing
│   │   ├── index.vue            # Landing page (public)
│   │   ├── login.vue            # Login admin
│   │   ├── forgot-password.vue  # Reset password via OTP
│   │   ├── tracking/            # Cek pesanan (public)
│   │   │   ├── index.vue        # Form input nomor resi
│   │   │   └── [orderId].vue    # Detail status pesanan
│   │   └── admin/               # Admin panel (protected)
│   │       ├── dashboard.vue    # Dashboard utama
│   │       ├── work/            # Papan kerja Kanban
│   │       │   ├── index.vue    # Kanban board
│   │       │   └── history.vue  # Riwayat pekerjaan
│   │       ├── orders/          # Manajemen pesanan
│   │       │   ├── index.vue    # Daftar pesanan
│   │       │   ├── create.vue   # Buat pesanan baru
│   │       │   └── [id].vue     # Detail/edit pesanan
│   │       ├── workers/         # Manajemen karyawan
│   │       │   ├── index.vue    # Daftar karyawan
│   │       │   └── [id].vue     # Detail karyawan
│   │       ├── garment-types/   # Kelola jenis pakaian
│   │       ├── users/           # Kelola user
│   │       ├── reports.vue      # Laporan & analitik
│   │       └── settings.vue     # Pengaturan profil & password
│   ├── layouts/
│   │   ├── default.vue          # Public (navbar + footer)
│   │   └── admin.vue            # Admin (sidebar + topbar)
│   ├── components/
│   │   ├── ui/                  # UI primitives
│   │   │   ├── AppButton.vue
│   │   │   ├── AppCard.vue
│   │   │   ├── AppModal.vue
│   │   │   ├── AppBadge.vue
│   │   │   ├── AppStatCard.vue
│   │   │   ├── AppSkeleton.vue
│   │   │   ├── AppEmptyState.vue
│   │   │   └── AppConfirmModal.vue
│   │   ├── charts/              # Chart components
│   │   │   ├── BarChart.vue
│   │   │   └── DoughnutChart.vue
│   │   ├── PageHeader.vue
│   │   ├── ProductCard.vue
│   │   ├── ProductModal.vue
│   │   ├── SketchModal.vue
│   │   └── HistoryMeasurementModal.vue
│   ├── composables/             # Data fetching composables
│   │   ├── useOrders.ts
│   │   ├── useEmployees.ts
│   │   ├── useDashboard.ts
│   │   ├── useGarmentTypes.ts
│   │   ├── useAttributes.ts
│   │   ├── usePublic.ts
│   │   ├── useUsers.ts
│   │   ├── useTasks.ts
│   │   └── useSketchCanvas.ts
│   ├── stores/
│   │   └── auth.ts              # Auth state (Pinia)
│   └── middleware/
│       └── auth.global.ts       # Route protection
├── shared/
│   └── types/                   # Shared TypeScript types
│       ├── index.ts
│       ├── order.ts
│       ├── worker.ts
│       ├── user.ts
│       ├── profile.ts
│       ├── portfolio.ts
│       ├── garment-type.ts
│       └── attribute.ts
├── e2e/                         # Playwright E2E tests
├── plugins/
│   └── chartjs.client.ts        # Chart.js client plugin
├── public/                      # Static assets
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Konfigurasi

### Hybrid Rendering (`nuxt.config.ts`)

| Route              | Strategi            | Alasan                        |
| ------------------ | ------------------- | ----------------------------- |
| `/`                | Prerender (statis)  | SEO optimal                   |
| `/login`           | SPA (client-side)   | Halaman internal              |
| `/admin/**`        | SPA (client-side)   | Halaman internal              |
| `/tracking/**`     | SPA (client-side)   | Halaman internal              |

### Custom Colors (`tailwind.config.ts`)

- `primary` — Teal/hijau (brand color)
- `secondary` — Cream/beauty

### Route Protection (`middleware/auth.global.ts`)

- `/admin/*` dilindungi, redirect ke `/login` jika belum autentikasi
- Sudah login + akses `/login` → redirect ke `/admin/dashboard`

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

# Debug mode
npx playwright test --config=e2e/playwright.config.ts --debug

# HTML report
npx playwright show-report .playwright-report
```

Lihat [E2E_TESTING.md](../E2E_TESTING.md) untuk dokumentasi lengkap testing.
