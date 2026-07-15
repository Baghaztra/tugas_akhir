# Project Audit — Sistem Manajemen Produksi Penjahit Yan

**Tanggal:** 12 Juni 2026  
**Update Terakhir:** 20 Juni 2026  
**Status:** ~95% rampung

---

## Ringkasan Status

| Severitas | Total | ✅ Fixed | ❌ Open |
|-----------|-------|----------|---------|
| 🔴 HIGH | 7 | 6 | 1 |
| 🟡 MEDIUM | 7 | 6 | 1 |
| 🟢 LOW | 10 | 5 | 5 |
| **Total** | **24** | **17** | **7** |

---

## 🔴 HIGH — Critical

### H1. Endpoint `/orders/priority` tidak ada ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `frontend/app/composables/useTasks.ts` | Sudah refactor ke `/orders/admin-work` |
| `backend/app/routers/orders.py:116` | Endpoint `/admin-work` sudah ada |

**Fix:** Frontend `useTasks.ts` di-refactor dari `useEmployeeTasks()` → `useAdminWork()` yang memanggil `/orders/admin-work`. Halaman `task-list/index.vue` dihapus, diganti flow admin-work.

---

### H2. CORS Misconfiguration ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `backend/app/main.py:26` | Sudah pakai `.split(",")` |

**Fix:** `allow_origins=os.getenv("ALLOWED_ORIGINS", "").split(",")`

---

### H3. SMTP Credentials di .env ❌ OPEN

| Lokasi | Detail |
|--------|--------|
| `backend/.env:13-14` | `SMTP_USER=rumahjahityan@gmail.com` + App Password nyata |

**Risiko:** Jika `.env` ter-commit (force push, gitignore gagal), kredensial bocor.  
**Action:** Rotate credentials setelah project selesai.

---

### H4. Pydantic v2 — `.dict()` harus diganti `.model_dump()` ✅ FIXED

| File | Status |
|------|--------|
| `backend/app/crud/order.py:156` | `.model_dump()` |
| `backend/app/crud/worker.py:19, 30` | `.model_dump()` |
| `backend/app/crud/garment_type.py:39, 50` | `.model_dump()` |
| `backend/app/crud/attributes.py:15` | `.model_dump()` |

---

### H5. `takeTask()` kirim query params, backend expect body ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `frontend/app/composables/useTasks.ts` | Sekarang pakai `$fetch` dengan `body:` (JSON) |

**Fix:** `assignWorker()` dan `completeTask()` mengirim JSON body, bukan query params.

---

### H6. Employee task page non-functional ✅ FIXED

Halaman `task-list/index.vue` dihapus. Flow employee tasks diganti melalui admin-work Kanban.

---

### H7. Auth global di workers router ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `backend/app/routers/workers.py` | Global dependency dihapus |

**Fix:** `dependencies=[Depends(get_current_user)]` dihapus dari router. Auth ditambahkan per-endpoint (kecuali `POST /workers/` untuk mengatasi bootstrap problem).

---

## 🟡 MEDIUM

### M1. Broken glob di `.gitignore` ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `backend/.gitignore:9` | `__pycache__/` (sudah benar) |

---

### M2. Hardcoded employee ID ⚠️ PARTIAL

| Lokasi | Detail |
|--------|--------|
| `frontend/app/pages/task-list/index.vue` | Sudah dihapus bersama H6 |

**Catatan:** Halaman `task-list/index.vue` dihapus, tapi auth system masih pakai `User` (admin), belum ada `Worker` auth terpisah.

---

### M3. Tracking page akses field `order.log` yang tidak ada ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `frontend/app/pages/tracking/[orderId].vue` | Iterasi `items[].logs` per item |

**Fix:** Log timeline sekarang render per-item (`v-for="item in order.items"` → `v-for="log in item.logs"`).

---

### M4. `GarmentTypeUpdate` require `name` (harusnya optional) ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `backend/app/schemas/garment_type.py:20` | `name: Optional[str] = None` |

**Fix:** `GarmentTypeUpdate` tidak lagi inherit `GarmentTypeBase`, field `name` jadi optional.

---

### M5. Dependency `pycle` tidak dipakai ✅ FIXED

Dihapus dari `requirements.txt` dan `requirements_2.txt`.

---

### M6. `xgb.DMatrix(X)` mungkin gagal di XGBoost 3.x ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `backend/app/ranking_logic.py` | Try sklearn-style `predict(X)` dulu, fallback `predict(xgb.DMatrix(X))` |

---

### M7. Branching migration tree ❌ OPEN

| File | Parent |
|------|--------|
| `20260429_848d4f698e2d_add_table_garment_type.py` | `3941786eb9c3` |
| `20260429_ec37e9a4f2e0_add_garment_type.py` | `3941786eb9c3` |

Dua migration dari parent sama — branching. `alembic upgrade head` mungkin cuma apply satu branch.  
**Action:** Merge atau squash migration tree.

---

## 🟢 LOW

### L1. Typo "soring" ✅ FIXED

`ranking_logic.py` → `"Model sorting successfully"`

---

### L2. Typo "Meninggu" ✅ FIXED

`admin/work/index.vue` → `"Menunggu Dikerjakan"`

---

### L3. `print()` statt `logging` ✅ FIXED

| File | Status |
|------|--------|
| `backend/app/ranking_logic.py` | `logging.getLogger(__name__)` |
| `backend/app/email.py` | `logging.getLogger(__name__)` |

---

### L4. Stale progress docs ❌ OPEN

| File |
|------|
| `progress-0103.md` |
| `progress-0104.md` |
| `progress-0105.md` |
| `progress-0106.md` |
| `progress-0107.md` |

**Action:** Hapus atau arsipkan file-file ini.

---

### L5. Hardcoded `localhost` di E2E tests ❌ OPEN

| File | Baris |
|------|-------|
| `frontend/e2e/playwright.config.ts` | 14 |
| `frontend/e2e/utils/helpers.ts` | 3 |
| Multiple `.spec.ts` files | — |

**Action:** Pindah ke env variable.

---

### L6. Placeholder di order list ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `frontend/app/pages/admin/orders/index.vue:55` | Diganti `—` |

---

### L7. `alembic.ini` `sqlalchemy.url` kosong ❌ OPEN

| Lokasi | Detail |
|--------|--------|
| `backend/alembic.ini:40` | `sqlalchemy.url=` — blank (di-override env.py, tapi misleading) |

**Action:** Isi dengan placeholder atau comment.

---

### L8. `.pkl` tidak di-gitignore ✅ FIXED

`backend/.gitignore` sekarang exclude `*.pkl`.

---

### L9. Inconsistent import style ❌ OPEN

| File | Detail |
|------|--------|
| `backend/app/models/user.py:2` | `from app.database import Base` (absolute) |
| `backend/app/models/password_reset_token.py:2` | `from app.database import Base` (absolute) |

Semua model lain pake `from ..database import Base` (relative).

---

### L10. No rate limiting forgot-password ❌ OPEN

| Lokasi | Detail |
|--------|--------|
| `backend/app/routers/auth.py` | `POST /auth/forgot-password` tanpa rate limit |

Bisa dipakai spam OTP ke email sembarang.

---

## Issues Masih Terbuka (7)

| # | Issue | Severitas | Action |
|---|-------|-----------|--------|
| H3 | SMTP credentials di .env | 🔴 HIGH | Rotate credentials |
| M7 | Branching migration tree | 🟡 MEDIUM | Squash migrations |
| L4 | Stale progress docs | 🟢 LOW | Hapus file |
| L5 | Hardcoded localhost E2E | 🟢 LOW | Pakai env var |
| L7 | alembic.ini url kosong | 🟢 LOW | Isi placeholder |
| L9 | Inconsistent import | 🟢 LOW | Normalisasi ke relative |
| L10 | No rate limiting | 🟢 LOW | Tambah throttle |

bug di laporan, terkait pembayaran lunas/belum
nomor, tabel pelanggan, edit order

tabel pelanggan, tampilkan hutang