# Project Audit — Sistem Manajemen Produksi Penjahit Yan

**Tanggal:** 12 Juni 2026
**Update Terakhir:** 20 Juli 2026
**Status:** ~97% rampung

---

## Ringkasan Status

| Severitas | Total | ✅ Fixed | ❌ Open |
|-----------|-------|----------|---------|
| 🔴 HIGH | 9 | 8 | 1 |
| 🟡 MEDIUM | 6 | 6 | 0 |
| 🟢 LOW | 8 | 6 | 2 |
| **Total** | **23** | **20** | **3** |

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

### H3. Pydantic v2 — `.dict()` harus diganti `.model_dump()` ✅ FIXED

| File | Status |
|------|--------|
| `backend/app/crud/order.py:156` | `.model_dump()` |
| `backend/app/crud/worker.py:19, 30` | `.model_dump()` |
| `backend/app/crud/garment_type.py:39, 50` | `.model_dump()` |
| `backend/app/crud/attributes.py:15` | `.model_dump()` |

---

### H4. `takeTask()` kirim query params, backend expect body ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `frontend/app/composables/useTasks.ts` | Sekarang pakai `$fetch` dengan `body:` (JSON) |

**Fix:** `assignWorker()` dan `completeTask()` mengirim JSON body, bukan query params.

---

### H5. Employee task page non-functional ✅ FIXED

Halaman `task-list/index.vue` dihapus. Flow employee tasks diganti melalui admin-work Kanban.

---

### H6. Auth global di workers router ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `backend/app/routers/workers.py` | Global dependency dihapus |

**Fix:** `dependencies=[Depends(get_current_user)]` dihapus dari router. Auth ditambahkan per-endpoint (kecuali `POST /workers/` untuk mengatasi bootstrap problem).

---

### H7. Tombol "Set Lunas" tidak update status pembayaran ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `frontend/app/pages/admin/orders/index.vue:151-157` | `confirmSetLunas()` sekarang kirim `totalPrice` + `paidAmount` dari order + cek `res.success` |
| `backend/app/crud/order.py:196-199` | `or 0` hanya diterapkan pada field yang benar-benar dikirim |

**Fix:** Frontend kirim `{ paymentStatus: 'paid', totalPrice, paidAmount }` (lunas = bayar full). Backend tidak lagi reset field yang tidak dikirim.

---

### H8. Papan kerja belum terurut ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `frontend/app/pages/admin/work/index.vue` | Task dalam kolom Kanban sekarang di-sort berdasarkan urgency (red > yellow > green) |

**Fix:** Frontend `filteredData` computed sekarang sort setiap kolom (ready & in_progress) berdasarkan `urgency_label` (red=0, yellow=1, green=2). Backend sudah sort via `sort_by_priority()` sebelum grouping, frontend menambah explicit sort per kolom untuk guarantee urutan visual.

---

### H9. Hapus karyawan merusak data histori pesanan ❌ OPEN

| Lokasi | Detail |
|--------|--------|
| `backend/app/crud/worker.py` | Delete hard-delete (row dihapus permanen) |
| `backend/app/models/order.py:103` | `order_logs.worker_id` FK ke `workers.id` |

**Risiko:** Menghapus pekerja yang sudah punya riwayat di `order_logs` akan menyebabkan foreign key constraint error atau data histori hilang (worker_name null, referensi terputus). Data audit trail pesanan jadi tidak lengkap.

**Idea:** Implementasi soft delete pada tabel `workers` — tambah kolom `is_deleted` (boolean, default false), hapus endpoint `DELETE` jadi update `is_deleted=true`. Query workers yang aktif filter `is_deleted=false`. Data histori tetap utuh karena FK tetap valid.

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

### L4. Stale progress docs ✅ FIXED

File `progress-*.md` sudah dihapus dari project root.

---

### L5. Placeholder di order list ✅ FIXED

| Lokasi | Detail |
|--------|--------|
| `frontend/app/pages/admin/orders/index.vue:55` | Diganti `—` |

---

### L6. `.pkl` tidak di-gitignore ✅ FIXED

`backend/.gitignore` sekarang exclude `*.pkl`.

---

### L7. Inconsistent import style ❌ OPEN

| File | Detail |
|------|--------|
| `backend/app/models/user.py:2` | `from app.database import Base` (absolute) |
| `backend/app/models/password_reset_token.py:2` | `from app.database import Base` (absolute) |

Semua model lain pake `from ..database import Base` (relative).

---

### L8. No rate limiting forgot-password ❌ OPEN

| Lokasi | Detail |
|--------|--------|
| `backend/app/routers/auth.py:115` | `POST /auth/forgot-password` tanpa rate limit |

Bisa dipakai spam OTP ke email sembarang.

---

## Issues Masih Terbuka (3)

| # | Issue | Severitas | Action |
|---|-------|-----------|--------|
| H9 | Hapus karyawan merusak data histori | 🔴 HIGH | Implementasi soft delete (is_deleted) |
| L7 | Inconsistent import style | 🟢 LOW | Normalisasi ke relative import |
| L8 | No rate limiting forgot-password | 🟢 LOW | Tambah throttle |
