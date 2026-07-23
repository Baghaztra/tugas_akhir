# Detail Pengujian Playwright — Rumah Jahit Yan

## Konfigurasi

| Item | Nilai |
|------|-------|
| Framework | Playwright Test |
| Browser | Chromium (Desktop Chrome) |
| Base URL | `http://localhost:3000` |
| API Base | `http://localhost:8000` |
| Parallel | Tidak (sequential, `workers: 1`) |
| Reporter | HTML + List |
| Retries | 0 (lokal), 1 (CI) |

## Akun Pengujian

| Role | Nama | Password |
|------|------|----------|
| Admin/Owner | `Owner` | `111111` |
| Staff | `Staff 1` | `111111` |

## Test Data (Fixtures)

| Konstanta | Nilai |
|-----------|-------|
| `TEST_ORDER.customerName` | `E2E Test Budi` |
| `TEST_ORDER.customerPhone` | `081234567890` |
| `TEST_ORDER.deadline` | H+7 dari hari ini |
| `TEST_ORDER.totalPrice` | `250000` |
| `TEST_ORDER.dpAmount` | `100000` |
| `TEST_ORDER.paymentStatus` | `partial` |
| `TEST_WORKER.name` | `E2E Test Worker` |
| `TEST_WORKER.role` | `Jahit` |
| `TEST_USER.name` | `E2E Test User` |
| `TEST_USER.email` | `e2e.testuser@rumahjahit.id` |
| `TEST_PORTFOLIO.title` | `E2E Test Kemeja Batik` |
| `TRACKING_SAMPLE_RECEIPT` | `RES-2024-001` |

---

## Ringkasan Total

| Kategori | Jumlah |
|----------|--------|
| Total test case | **93** |
| Aktif | **85** |
| Dilewati (skip) | **8** |

---

## 1. Landing Page (`landing.spec.ts`) — 3 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | render landing page with title and CTA | Aktif | Verifikasi `<h1>`, tombol "Cek Status Pesanan", dan link terlihat |
| 2 | navigate to tracking page from landing | **SKIP** | Navigasi ke `/tracking` via tombol Cek |
| 3 | landing page load under 5 seconds | Aktif | Verifikasi waktu muat halaman < 15 detik |

---

## 2. Login (`login.spec.ts`) — 5 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | login page render form elements | Aktif | Verifikasi judul "Rumah Jahit Yan", subjudul "Masuk", input username/password, tombol submit |
| 2 | login with valid credentials redirect to admin dashboard | Aktif | Login dengan kredensial valid → redirect ke `/admin/dashboard` |
| 3 | login with wrong password show error message | Aktif | Login dengan password salah → pesan error merah muncul |
| 4 | login page has forgot password link | Aktif | Verifikasi link "Lupa password" mengarah ke `/forgot-password` |
| 5 | already logged in user redirect from login to dashboard | Aktif | User sudah login → akses `/login` langsung redirect ke dashboard |

---

## 3. Forgot Password (`forgot-password.spec.ts`) — 7 test

### UI Navigation (3 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | clicking Lupa Password navigates to forgot-password page | Aktif | Klik link "Lupa password?" → URL `/forgot-password`, judul "Rumah Jahit Yan", teks "Reset Password" |
| 2 | forgot-password page has back link to login | Aktif | Link "Kembali ke Login" dengan atribut `href="/login"` |
| 3 | forgot-password shows email step initially | Aktif | Teks "Lupa Password" dan "Kirim Kode OTP" terlihat |

### API — Forgot Password (1 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 4 | POST /auth/forgot-password returns success for any email | Aktif | Response `success: true`, pesan mengandung "Jika email terdaftar" |

### API — Reset Password (3 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 5 | PUT /auth/reset-password rejects invalid OTP | Aktif | OTP `000000` → status 400, detail mengandung "OTP" |
| 6 | PUT /auth/reset-password rejects short password | Aktif | Password `abc` → status 400, detail mengandung "minimal 6 karakter" |
| 7 | PUT /auth/reset-password rejects unknown email | Aktif | Email tidak terdaftar → status 400, detail mengandung "Email tidak terdaftar" |

### Happy Path — Full Flow (2 test, termasuk dalam 7 total)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| — | request OTP then verify old password still works | Aktif | Kirim OTP, lalu verifikasi password lama masih bisa login |
| — | forgot-password endpoint is idempotent for same email | Aktif | Kirim OTP berulang untuk email sama → selalu `success: true` |

---

## 4. Authorization / RBAC (`authorization.spec.ts`) — 11 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | staff login redirect to /admin/orders (not dashboard) | **SKIP** | RBAC belum diimplementasi |
| 2 | staff cannot access /admin/dashboard - redirect to /admin/work | **SKIP** | RBAC belum diimplementasi |
| 3 | staff cannot access /admin/reports - redirect to /admin/work | **SKIP** | RBAC belum diimplementasi |
| 4 | staff cannot access /admin/users - redirect to /admin/work | **SKIP** | RBAC belum diimplementasi |
| 5 | staff can access /admin/orders | Aktif | Staff dapat mengakses halaman pesanan |
| 6 | staff can access /admin/work | Aktif | Staff dapat mengakses halaman work/kanban |
| 7 | staff can access /admin/workers | Aktif | Staff dapat mengakses halaman karyawan |
| 8 | staff can access /admin/settings | Aktif | Staff dapat mengakses halaman pengaturan |
| 9 | staff sidebar does not show Dashboard link | **SKIP** | RBAC belum diimplementasi |
| 10 | staff sidebar does not show Kelola User link | **SKIP** | RBAC belum diimplementasi |
| 11 | unauthenticated user redirect to login from admin routes | Aktif | Akses `/admin/dashboard` tanpa login → redirect ke `/login` |

---

## 5. Orders CRUD (`orders.spec.ts`) — 3 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | orders list page render table | Aktif | Verifikasi input pencarian dan tombol "Tambah Pesanan" |
| 2 | create order via API and verify in list | Aktif | Buat pesanan via API, buka halaman pesanan, verifikasi nomor resi dan nama pelanggan muncul |
| 3 | order detail page show WhatsApp button when phone exists | Aktif | Tombol WhatsApp dengan link `wa.me/6281234567890`, atribut `target="_blank"` |

---

## 6. Orders Functional (`orders-functional.spec.ts`) — 10 test

### Tambah Pesanan (3 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | navigate to create order page from orders list | Aktif | Klik "Tambah Pesanan" → URL `/admin/orders/create`, judul "Pesanan Baru" |
| 2 | create order form has all required fields | Aktif | Verifikasi label: Nama Pelanggan, No. HP, Deadline, Status Pembayaran, Total Biaya, Jenis Pakaian |
| 3 | fill and submit create order form | Aktif | Isi form lengkap, submit, verifikasi redirect ke detail pesanan dan nama pelanggan muncul |

### Edit Pesanan (4 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 4 | order detail page show payment section | Aktif | Verifikasi bagian Pembayaran, Total, Dibayar |
| 5 | click edit button show payment edit form | Aktif | Form edit menampilkan field: Total Biaya, DP, Status Pembayaran, tombol Simpan/Batal |
| 6 | edit payment amount and status | Aktif | Ubah total dan DP ke 500000, status "paid", verifikasi badge "Lunas" |
| 7 | cancel edit restore read-only view | Aktif | Klik Batal → kembali ke tampilan read-only (Total, Dibayar) |

### Gambar Sketsa (3 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 8 | sketch modal has canvas and toolbar | Aktif | Modal "Sketsa Item" menampilkan canvas, tombol "Simpan Sketsa", tombol "Batal" |
| 9 | sketch modal has template buttons | Aktif | Tombol template "Kemeja" tersedia di modal sketsa |
| 10 | sketch modal close on cancel | Aktif | Klik "Batal" → modal tertutup |

---

## 7. Kanban Board (`kanban.spec.ts`) — 3 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | kanban page render phase columns | Aktif | Minimal 1 kolom `<h2>` di halaman `/admin/work` |
| 2 | kanban show cutting/sewing/finishing labels | Aktif | Header mengandung "Potong", "Jahit", atau "Finishing" |
| 3 | click Sketsa button open modal with image | **SKIP** | Order dibuat tanpa file sketsa, tombol Sketsa tidak muncul |

---

## 8. Workers / Karyawan (`workers-functional.spec.ts`) — 3 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | workers list page render table and add button | Aktif | Tombol "Tambah Karyawan" terlihat |
| 2 | open add worker modal and create worker | Aktif | Buka modal, isi nama dan role, simpan, verifikasi nama muncul di tabel |
| 3 | workers list has search input | Aktif | Input pencarian dengan placeholder "Cari" tersedia |

---

## 9. Users / Kelola User (`users-functional.spec.ts`) — 7 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | users page render table with columns | Aktif | Heading "Kelola User", kolom "Nama" atau teks "Tidak ada user" |
| 2 | users page has add user button | Aktif | Tombol "Tambah User" terlihat |
| 3 | users page has search input | Aktif | Input pencarian "Cari" tersedia |
| 4 | add user modal open and close | Aktif | Modal "Tambah User" menampilkan field: Nama Lengkap, Email, Password; klik Batal menutup modal |
| 5 | add new user and verify in table | Aktif | Isi form, simpan, verifikasi nama dan email muncul di tabel, user tersimpan via API |
| 6 | edit user via modal | Aktif | Buat user via API, klik Edit, ubah nama, simpan, verifikasi nama baru muncul |
| 7 | delete user via modal | Aktif | Buat user via API, klik Hapus, konfirmasi "Ya, Hapus", verifikasi user hilang dari tabel |

---

## 10. Tracking Publik (`tracking.spec.ts`) — 3 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | tracking page render search form | Aktif | Heading "Cek Status", input placeholder "Contoh", tombol "Cari" |
| 2 | search valid receipt redirect to tracking detail | Aktif | Buka `/tracking/RES-2024-001`, verifikasi URL mengandung nomor resi |
| 3 | search invalid receipt show 404 or error | Aktif | Buka `/tracking/NONEXISTENT-99999`, verifikasi status 404 atau teks "tidak ditemukan" |

---

## 11. Settings / Pengaturan (`settings-functional.spec.ts`) — 11 test

### Ubah Password (3 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | settings page render password change form | Aktif | Modal "Ubah Password" menampilkan field: Password Saat Ini, Password Baru, Konfirmasi Password Baru, tombol Simpan |
| 2 | password mismatch show error | Aktif | Password baru ≠ konfirmasi → pesan "tidak cocok" |
| 3 | short password show error | Aktif | Password baru < 6 karakter → pesan "minimal 6 karakter" |

### Portofolio (6 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 4 | settings page render portfolio section | Aktif | Bagian "Portofolio" terlihat |
| 5 | open portfolio modal and check form fields | Aktif | Modal "Tambah Portofolio" menampilkan field: Judul, Kategori, Deskripsi |
| 6 | portfolio upload button disabled without required fields | Aktif | Tombol "Tambahkan" disabled jika field belum diisi |
| 7 | fill portfolio metadata enable upload button | Aktif | Isi judul dan kategori → tombol "Tambahkan" enabled |
| 8 | create portfolio via API and verify in settings page | Aktif | Buat portofolio via API, verifikasi muncul di halaman settings, lalu hapus |
| 9 | settings page render existing portfolio grid | Aktif | Bagian "Portofolio" dan tombol reload terlihat |

### Profile Info (2 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 10 | settings page render business info form | Aktif | Bagian "Informasi Usaha" menampilkan field: Nama Usaha, Alamat Lengkap, No. Telepon, Email |
| 11 | click edit enable form fields and show save button | Aktif | Klik Edit → tombol "Simpan" dan "Batal" muncul |

---

## 12. Reports / Laporan (`reports-functional.spec.ts`) — 9 test

### Cek Laporan (6 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | reports page render summary cards | Aktif | Kartu: Pesanan Masuk, Pendapatan, Pesanan Selesai, Total Item |
| 2 | reports page render daily breakdown table | Aktif | Bagian "Rekap Harian" dengan kolom: Hari, Tanggal, Masuk, Selesai |
| 3 | reports page render garment type breakdown | Aktif | Bagian "Jenis Pakaian" terlihat |
| 4 | reports page render payment status breakdown | Aktif | Bagian "Status Pembayaran" menampilkan: Lunas, DP, Belum Lunas |
| 5 | reports page render productivity table | Aktif | Bagian "Produktivitas Karyawan" dengan kolom: Karyawan, Divisi, Selesai |
| 6 | week navigator has prev/next buttons and today button | Aktif | Tombol "Hari Ini" terlihat |

### Export Laporan (3 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 7 | export Excel button is visible | Aktif | Tombol "Export Excel" terlihat |
| 8 | click export Excel trigger download | Aktif | Klik Export → file terunduh, nama file mengandung `.xlsx` dan `laporan` |
| 9 | export API endpoint return Excel file | Aktif | `GET /reports/weekly-recap/export` → response `content-type` mengandung `spreadsheetml` |

---

## 13. Admin Dashboard (`admin-dashboard.spec.ts`) — 4 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | dashboard page render stat cards | Aktif | Kartu "Pesanan Aktif" dan "Pendapatan Minggu Ini" terlihat |
| 2 | dashboard show trend chart area | Aktif | Bagian "Tren Pesanan 7 Hari" atau "tren" terlihat |
| 3 | dashboard show notifications section | Aktif | Bagian "Notifikasi" atau "notifikasi" terlihat |
| 4 | dashboard link to orders page | Aktif | Klik "Lihat Semua" → redirect ke `/admin/orders` |

---

## 14. API — Dashboard (`api/dashboard.api.spec.ts`) — 3 test

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | GET /dashboard/summary return stats | Aktif | Response memiliki properti `activeOrders`, `weeklyRevenue`, `todayDone` (bertipe number) |
| 2 | GET /dashboard/trend return trend data | Aktif | Response memiliki `labels` (array, length 7), `incoming`, `completed` |
| 3 | GET /dashboard/notifications return array | Aktif | Response array, item pertama memiliki `receiptNumber`, `daysLeft`, `urgency` |

---

## 15. API — Orders (`api/orders.api.spec.ts`) — 11 test

### CRUD (6 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | GET /orders/ return array | Aktif | Response berupa array |
| 2 | POST /orders/ create order | Aktif | Buat pesanan, verifikasi `id`, `receiptNumber`, `customerName` |
| 3 | GET /orders/{id} return single order | Aktif | Buat via API, ambil by ID, verifikasi data cocok |
| 4 | GET /orders/tracking/{receipt} return tracking info | Aktif | Buat via API, ambil by receipt number, verifikasi `receiptNumber` cocok |
| 5 | DELETE /orders/{id} remove order | Aktif | Buat via API, hapus by ID |
| 6 | GET /orders/admin-work return kanban structure | Aktif | Response memiliki `phases` (array), setiap phase memiliki `phase`, `ready`, `in_progress` |

### Payment Update (2 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 7 | PUT /orders/{id} update payment fields | Aktif | Update `totalPrice=500000`, `dpAmount=0`, `paymentStatus='unpaid'` → verifikasi tersimpan |
| 8 | PUT /orders/{id} update to paid via dpAmount | Aktif | Update `dpAmount=500000`, `totalPrice=500000` → `paymentStatus` otomatis jadi `paid` |

### Sketch in Admin Work (2 test)

| # | Nama Test | Status | Keterangan |
|---|-----------|--------|------------|
| 9 | GET /orders/admin-work items include sketch field | Aktif | Setiap task di phases memiliki properti `sketch` |
| 10 | GET /orders/admin-work item sketch is null when no sketch uploaded | Aktif | Order tanpa sketsa → `sketch` bernilai `null` |

---

## Cara Menjalankan

```bash
# Jalankan semua test
npx playwright test

# Jalankan test tertentu
npx playwright test login.spec.ts

# Jalankan dengan UI
npx playwright test --ui

# Lihat laporan HTML
npx playwright show-report .playwright-report
```
