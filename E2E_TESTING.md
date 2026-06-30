# E2E Testing — Rumah Jahit App

## Stack

| Layer | Tool |
|-------|------|
| Test runner | **Playwright** (`@playwright/test`) |
| Language | TypeScript |
| Browser | Chromium (headless/headed) |
| API testing | Playwright `APIRequestContext` |
| Assertions | Built-in `expect` |
| Reporter | HTML + List |

## Why Playwright

- Single tool for browser E2E + API contract tests
- Auto-wait, network intercept, trace viewer, visual diff
- Multi-browser (Chromium/Firefox/WebKit)
- CI-ready with parallel workers
- No extra dependencies (no WebDriver, no Selenium)

## Project Structure

```
frontend/
├── e2e/
│   ├── playwright.config.ts         # Playwright config
│   ├── tests/                       # Test specs
│   │   ├── landing.spec.ts          # Landing page
│   │   ├── admin-dashboard.spec.ts  # Dashboard UI
│   │   ├── orders.spec.ts           # Order CRUD flows
│   │   ├── workers.spec.ts          # Worker CRUD flows
│   │   ├── tracking.spec.ts         # Public tracking page
│   │   ├── kanban.spec.ts           # Kanban board
│   │   ├── login.spec.ts            # Login functional
│   │   ├── orders-functional.spec.ts    # Tambah/edit pesanan + sketsa
│   │   ├── workers-functional.spec.ts   # CRUD karyawan UI
│   │   ├── reports-functional.spec.ts   # Cek & export laporan
│   │   ├── users-functional.spec.ts     # Kelola user (owner-only)
│   │   ├── settings-functional.spec.ts  # Ubah password & portofolio
│   │   ├── authorization.spec.ts        # Staff access control
│   │   └── api/                     # API contract tests
│   │       ├── orders.api.spec.ts
│   │       ├── workers.api.spec.ts
│   │       └── dashboard.api.spec.ts
│   ├── fixtures/
│   │   └── test-data.ts             # Test data templates
│   └── utils/
│       └── helpers.ts               # API & auth helpers
├── app/
│   ├── middleware/
│   │   └── auth.global.ts           # Route guard (owner/staff)
│   └── ...
├── package.json
└── nuxt.config.ts
backend/
├── app/
│   ├── routers/                     # API endpoints tested
│   └── ...
├── manage.py
└── .env
```

## Installation

```bash
cd frontend
npm install -D @playwright/test
npx playwright install chromium
```

## Test Design

### Test Categories

| Category | What it tests | File |
|----------|--------------|------|
| **Landing** | Page render, navigation, load time | `landing.spec.ts` |
| **Dashboard** | Stat cards, chart, notifications | `admin-dashboard.spec.ts` |
| **Orders** | List render, filter, create via API, navigate to create | `orders.spec.ts` |
| **Workers** | List render, filter, CRUD via API | `workers.spec.ts` |
| **Tracking** | Search form, valid/invalid receipt, sample click | `tracking.spec.ts` |
| **Kanban** | Phase columns, labels, refresh | `kanban.spec.ts` |
| **Login** | Form render, valid/invalid login, redirect, forgot password link | `login.spec.ts` |
| **Tambah Pesanan** | Create order form fill & submit, navigate from list | `orders-functional.spec.ts` |
| **Edit Pesanan** | Payment section, edit form, save/cancel | `orders-functional.spec.ts` |
| **Gambar Sketsa** | Sketch modal, canvas, templates, close | `orders-functional.spec.ts` |
| **CRUD Karyawan** | Add/edit/delete worker via UI & API, search | `workers-functional.spec.ts` |
| **Cek Laporan** | Summary cards, daily table, garment/payment/productivity | `reports-functional.spec.ts` |
| **Export Laporan** | Excel download button, API endpoint | `reports-functional.spec.ts` |
| **Kelola User** | Add/edit/delete user via modal, table & search | `users-functional.spec.ts` |
| **Ubah Password** | Password form, mismatch/short validation | `settings-functional.spec.ts` |
| **Tambah Portofolio** | Portfolio form, upload button, API create, grid | `settings-functional.spec.ts` |
| **Authorization** | Staff blocked from dashboard/reports/users, allowed routes, sidebar | `authorization.spec.ts` |
| **API Orders** | GET/POST/PUT/DELETE order, tracking, admin-work | `api/orders.api.spec.ts` |
| **API Workers** | GET/POST/PUT/DELETE worker, wages, performance | `api/workers.api.spec.ts` |
| **API Dashboard** | Summary, trend, notifications, reports | `api/dashboard.api.spec.ts` |

### Principles

1. **API tests** create own data and clean up after (`afterEach` hooks)
2. **UI tests** use `loginAdminUI()` or `loginStaffUI()` for authentication
3. **Two user roles** — owner (full access) and staff (restricted); tests verify both
4. **Isolated** — each test file independent, no shared state
5. **Deterministic** — test data uses distinct names ("E2E Test ...") for easy identification
6. **Authorization tests** verify route guards and sidebar visibility per role

## Running Tests

### Prerequisites

```bash
# Terminal 1: Start database
cd project
docker-compose up -d mysql

# Terminal 2: Start backend
cd backend
.venv\Scripts\activate
python manage.py migrate
python manage.py seed
uvicorn app.main:app --reload

# Terminal 3: Start frontend (or let Playwright auto-start via webServer)
cd frontend
npm run dev
```

### Run all tests

```bash
cd frontend
npx playwright test --config=e2e/playwright.config.ts
```

### Run with visible browser

```bash
npx playwright test --config=e2e/playwright.config.ts --headed
```

### Run specific test file

```bash
npx playwright test --config=e2e/playwright.config.ts e2e/tests/orders.spec.ts
```

### Run API tests only

```bash
npx playwright test --config=e2e/playwright.config.ts e2e/tests/api/
```

### Run functional tests only

```bash
npx playwright test --config=e2e/playwright.config.ts e2e/tests/login.spec.ts e2e/tests/orders-functional.spec.ts e2e/tests/workers-functional.spec.ts e2e/tests/reports-functional.spec.ts e2e/tests/users-functional.spec.ts e2e/tests/settings-functional.spec.ts e2e/tests/authorization.spec.ts
```

### Run authorization tests only

```bash
npx playwright test --config=e2e/playwright.config.ts e2e/tests/authorization.spec.ts
```

### View HTML report

```bash
npx playwright show-report .playwright-report
```

### Debug mode

```bash
npx playwright test --config=e2e/playwright.config.ts --debug
```

## Configuration

Key settings in `playwright.config.ts`:

| Setting | Value | Purpose |
|---------|-------|---------|
| `baseURL` | `http://localhost:3000` | Nuxt dev server |
| `workers` | `1` | Sequential (avoid DB race) |
| `retries` | `0` (local), `1` (CI) | Flaky test handling |
| `trace` | `on-first-retry` | Debug failed tests |
| `webServer` | `npm run dev` on port 3000 | Auto-start frontend |

## Adding New Tests

1. Create spec file in `e2e/tests/` or `e2e/tests/api/`
2. Import `{ test, expect }` from `@playwright/test`
3. Use `test.describe` to group related tests
4. Use `test.afterEach` for cleanup (delete created data)
5. For UI tests, use `loginAdminUI(page)` or `loginStaffUI(page)` for auth
6. For API tests, use `loginAdmin(request)` or helpers from `helpers.ts`
7. Add test data to `fixtures/test-data.ts` if reusable

### Example — UI test with auth

```ts
import { test, expect } from '@playwright/test'
import { loginAdminUI, apiDelete } from '../utils/helpers'

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test('page renders correctly', async ({ page }) => {
    await page.goto('/admin/my-page')
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

### Example — Authorization test

```ts
import { test, expect } from '@playwright/test'
import { loginStaffUI, ensureStaffUser, deleteStaffUser } from '../utils/helpers'

test.describe('Staff Access Control', () => {
  test.beforeAll(async ({ request }) => {
    await ensureStaffUser(request)
  })

  test.afterAll(async ({ request }) => {
    await deleteStaffUser(request)
  })

  test('staff cannot access dashboard', async ({ page }) => {
    await loginStaffUI(page)
    await page.goto('/admin/dashboard')
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/admin/dashboard')
  })
})
```

### Auth Helpers Reference

| Function | Description |
|----------|-------------|
| `loginAdmin(request)` | Login as owner via API (sets cookie) |
| `loginAdminUI(page)` | Login as owner via browser form |
| `loginStaff(request)` | Login as staff via API (sets cookie) |
| `loginStaffUI(page)` | Login as staff via browser form |
| `ensureStaffUser(request)` | Create staff user if not exists (in `beforeAll`) |
| `deleteStaffUser(request)` | Delete staff user (in `afterAll`) |
| `apiGet/Post/Put/Delete` | API request wrappers with assertions |

## CI Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: tugas_akhir
        ports:
          - 3306:3306
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: cd backend && python manage.py migrate
      - run: cd backend && python manage.py seed &
      - run: cd backend && uvicorn app.main:app --host 0.0.0.0 &
      - run: cd frontend && npm ci
      - run: cd frontend && npx playwright install --with-deps chromium
      - run: cd frontend && npx playwright test --config=e2e/playwright.config.ts
```

## Best Practices

- **Always authenticate** — use `loginAdminUI()` or `loginStaffUI()` in `beforeEach` for UI tests
- **API tests create + clean up** — ensures repeatability
- **Use `afterEach`** not `afterAll` — cleanup even if test fails
- **Use `beforeAll`/`afterAll`** for shared resources (e.g., staff user in authorization tests)
- **Distinct test data** — prefix with "E2E Test" to identify in DB
- **Sequential workers** — DB is shared; parallel writes cause conflicts
- **No hardcoded waits** — use `waitForLoadState('networkidle')` or `toBeVisible()`
- **Screenshot on failure** — configured in playwright.config.ts
- **Commit `playwright-report` to `.gitignore`** — add `.playwright-report/` and `test-results/`
- **Verify redirects** — use `page.waitForURL()` and `expect(page.url())` for auth tests

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `net::ERR_CONNECTION_REFUSED` | Backend/frontend not running | Start servers or check `webServer` config |
| Tests fail on `networkidle` | Long-polling or websocket | Use `waitForTimeout(1000)` instead |
| `locator.waitFor()` timeout | Element not in DOM | Check selector, wait for data load |
| API `422` on create | Invalid test data | Match schema in `OrderCreateFormData` |
| `4201` can't find `tsconfig` | Running from wrong dir | Use `--config=e2e/playwright.config.ts` |
