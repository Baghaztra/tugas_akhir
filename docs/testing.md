# Testing

## Stack

| Tool | Fungsi |
|------|--------|
| Playwright | E2E testing (browser) + API contract testing |
| TypeScript | Bahasa test |

## Struktur Test

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
│   ├── login.spec.ts             # Login flow
│   ├── forgot-password.spec.ts   # Forgot password flow
│   ├── crud-orders.spec.ts       # Order create/edit/delete
│   ├── crud-workers.spec.ts      # Worker create/edit/delete
│   ├── crud-users.spec.ts        # User management (owner)
│   ├── settings.spec.ts          # Settings page
│   ├── reports.spec.ts           # Reports page
│   ├── authorization.spec.ts     # Role-based access
│   └── api/
│       ├── orders.api.spec.ts    # API contract: orders
│       ├── workers.api.spec.ts   # API contract: workers
│       └── dashboard.api.spec.ts # API contract: dashboard & reports
```

## Menjalankan Test

**Prasyarat**: Backend dan frontend harus berjalan.

```bash
cd frontend

# Semua test
npx playwright test --config=e2e/playwright.config.ts

# Dengan browser terlihat
npx playwright test --config=e2e/playwright.config.ts --headed

# Satu file
npx playwright test --config=e2e/playwright.config.ts e2e/tests/orders.spec.ts

# API test saja
npx playwright test --config=e2e/playwright.config.ts e2e/tests/api/

# Debug mode
npx playwright test --config=e2e/playwright.config.ts --debug

# HTML report
npx playwright show-report .playwright-report
```

## Konfigurasi Playwright

| Setting | Value | Keterangan |
|---------|-------|------------|
| `baseURL` | `http://localhost:3000` | Nuxt dev server |
| `workers` | `1` | Sequential (hindari race condition DB) |
| `retries` | `0` (local), `1` (CI) | Retry on failure |
| `trace` | `on-first-retry` | Debug trace saat retry |
| `webServer` | `npm run dev` on port 3000 | Auto-start frontend |

## Auth Helpers

Test menggunakan helper functions untuk login:
- `loginAdminUI()` / `loginStaffUI()` — login via UI
- `loginAdmin()` / `loginStaff()` — login via API (faster)
- `ensureStaffUser()` / `deleteStaffUser()` — manage test staff account
- `apiGet/Post/Put/Delete` — API request helpers

## Prinsip Testing

1. **API tests** buat data sendiri dan cleanup di `afterEach`
2. **UI tests** read-only (verifikasi render dengan data existing)
3. **Isolated** — setiap file test independen
4. **Deterministic** — prefix test data dengan "E2E Test"
5. **No hardcoded waits** — gunakan `waitForLoadState` atau `toBeVisible`
6. **Two roles** — test sebagai owner dan staff untuk verifikasi akses
