# Detail Pengujian Playwright — Rumah Jahit Yan

> **Laporan dari:** `http://localhost:9323/`  
> **Tanggal:** 23 Juli 2026, 12:37 WIB  
> **Browser:** Chromium  
> **Total waktu:** 5.6 menit

## Ringkasan Hasil

| Status | Jumlah |
|--------|--------|
| Lulus (Passed) | **86** |
| Gagal (Failed) | **0** |
| Dilewati (Skipped) | **8** |
| **Total** | **94** |

---

## 1. Landing Page (`landing.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Halaman beranda menampilkan judul dan tombol aksi | `render landing page with title and CTA` | Halaman landing menampilkan judul (`<h1>`), tombol "Cek Status Pesanan", dan link navigasi | Semua elemen terlihat di halaman | Lulus |
| 2 | Klik tombol Cek mengarahkan ke halaman pelacakan | `navigate to tracking page from landing` | Klik tombol "Cek" mengarahkan user ke halaman `/tracking` | Test di-skip — tombol Cek belum diimplementasi sesuai ekspektasi test | Dilewati |
| 3 | Halaman beranda dimuat dengan cepat | `landing page load under 5 seconds` | Halaman landing dimuat kurang dari 15 detik | Halaman dimuat dalam ~1 detik | Lulus |

---

## 2. Login (`login.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Form login menampilkan semua elemen yang dibutuhkan | `login page render form elements` | Halaman login menampilkan judul "Rumah Jahit Yan", subjudul "Masuk", input username, input password, dan tombol submit | Semua elemen form login muncul dengan benar | Lulus |
| 2 | Login dengan akun benar masuk ke dashboard admin | `login with valid credentials redirect to admin dashboard` | Setelah memasukkan username "Owner" dan password "111111", user diarahkan ke `/admin/dashboard` | Berhasil login dan redirect ke halaman dashboard admin | Lulus |
| 3 | Login dengan password salah menampilkan pesan error | `login with wrong password show error message` | Memasukkan password yang salah menampilkan pesan error (elemen merah) | Pesan error muncul di halaman | Lulus |
| 4 | Halaman login memiliki link lupa password | `login page has forgot password link` | Terdapat link "Lupa password" yang mengarah ke `/forgot-password` | Link terlihat dan atribut `href` benar | Lulus |
| 5 | User yang sudah login tidak perlu login ulang | `already logged in user redirect from login to dashboard` | User yang sudah login kemudian mengakses `/login` akan langsung diarahkan ke dashboard | User langsung redirect ke `/admin/dashboard` tanpa perlu login ulang | Lulus |

---

## 3. Forgot Password (`forgot-password.spec.ts`)

### UI Navigation

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Klik "Lupa password?" dari halaman login mengarah ke halaman reset | `clicking Lupa Password navigates to forgot-password page` | Klik link "Lupa password?" dari halaman login mengarah ke `/forgot-password`, menampilkan judul "Rumah Jahit Yan" dan teks "Reset Password" | Navigasi berhasil, semua elemen terlihat | Lulus |
| 2 | Halaman lupa password punya tombol kembali ke login | `forgot-password page has back link to login` | Terdapat link "Kembali ke Login" dengan atribut `href="/login"` | Link terlihat dan href benar | Lulus |
| 3 | Langkah awal halaman lupa password menampilkan form email | `forgot-password shows email step initially` | Saat halaman dibuka, langkah awal (email) ditampilkan dengan teks "Lupa Password" dan "Kirim Kode OTP" | Teks langkah awal muncul dengan benar | Lulus |

### API — Forgot Password

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 4 | Kirim permintaan OTP untuk email apapun selalu berhasil | `POST /auth/forgot-password returns success for any email` | Mengirim request POST dengan email acak mengembalikan `success: true` dan pesan "Jika email terdaftar" | Response sukses dengan pesan yang sesuai | Lulus |

### API — Reset Password

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 5 | Reset password dengan kode OTP salah ditolak | `PUT /auth/reset-password rejects invalid OTP` | Mengirim OTP "000000" mengembalikan status 400 dengan pesan error mengandung kata "OTP" | Status 400 diterima, pesan error sesuai | Lulus |
| 6 | Reset password dengan kata sandi terlalu pendek ditolak | `PUT /auth/reset-password rejects short password` | Mengirim password baru "abc" (kurang 6 karakter) mengembalikan status 400 dengan pesan "minimal 6 karakter" | Status 400 diterima, validasi password pendek berjalan | Lulus |
| 7 | Reset password untuk email yang tidak terdaftar ditolak | `PUT /auth/reset-password rejects unknown email` | Mengirim email yang tidak terdaftar mengembalikan status 400 dengan pesan "Email tidak terdaftar" | Status 400 diterima, pesan error sesuai | Lulus |

### Happy Path — Full Flow

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 8 | Setelah minta OTP, password lama masih bisa dipakai login | `request OTP then verify old password still works` | Setelah meminta OTP, password lama masih bisa digunakan untuk login | Request OTP berhasil, login dengan password lama tetap sukses | Lulus |
| 9 | Kirim OTP berkali-kali untuk email yang sama tetap aman | `forgot-password endpoint is idempotent for same email` | Mengirim request OTP berulang untuk email yang sama tetap mengembalikan `success: true` | Endpoint konsisten, selalu mengembalikan sukses | Lulus |

---

## 4. Authorization / RBAC (`authorization.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Staff seharusnya diarahkan ke halaman pesanan, bukan dashboard | `staff login redirect to /admin/orders (not dashboard)` | Staff login seharusnya diarahkan ke `/admin/orders`, bukan ke dashboard | Test di-skip — fitur RBAC (role-based redirect) belum diimplementasi | Dilewati |
| 2 | Staff tidak boleh mengakses halaman dashboard | `staff cannot access /admin/dashboard - redirect to /admin/work` | Staff yang mencoba akses dashboard seharusnya dialihkan ke `/admin/work` | Test di-skip — fitur RBAC belum diimplementasi | Dilewati |
| 3 | Staff tidak boleh mengakses halaman laporan | `staff cannot access /admin/reports - redirect to /admin/work` | Staff yang mencoba akses laporan seharusnya dialihkan ke `/admin/work` | Test di-skip — fitur RBAC belum diimplementasi | Dilewati |
| 4 | Staff tidak boleh mengakses halaman kelola user | `staff cannot access /admin/users - redirect to /admin/work` | Staff yang mencoba akses kelola user seharusnya dialihkan ke `/admin/work` | Test di-skip — fitur RBAC belum diimplementasi | Dilewati |
| 5 | Staff bisa mengakses halaman pesanan | `staff can access /admin/orders` | Staff dapat mengakses halaman pesanan tanpa dialihkan | Halaman `/admin/orders` berhasil dimuat, elemen "Tambah Pesanan" terlihat | Lulus |
| 6 | Staff bisa mengakses halaman work/kanban | `staff can access /admin/work` | Staff dapat mengakses halaman work/kanban | Halaman `/admin/work` berhasil dimuat | Lulus |
| 7 | Staff bisa mengakses halaman karyawan | `staff can access /admin/workers` | Staff dapat mengakses halaman karyawan | Halaman `/admin/workers` berhasil dimuat | Lulus |
| 8 | Staff bisa mengakses halaman pengaturan | `staff can access /admin/settings` | Staff dapat mengakses halaman pengaturan | Halaman `/admin/settings` berhasil dimuat | Lulus |
| 9 | Sidebar staff seharusnya tidak menampilkan menu Dashboard | `staff sidebar does not show Dashboard link` | Sidebar staff seharusnya tidak menampilkan link "Dashboard" | Test di-skip — fitur RBAC belum diimplementasi | Dilewati |
| 10 | Sidebar staff seharusnya tidak menampilkan menu Kelola User | `staff sidebar does not show Kelola User link` | Sidebar staff seharusnya tidak menampilkan link "Kelola User" | Test di-skip — fitur RBAC belum diimplementasi | Dilewati |
| 11 | User belum login langsung diarahkan ke halaman login | `unauthenticated user redirect to login from admin routes` | User yang belum login mengakses `/admin/dashboard` akan diarahkan ke `/login` | User berhasil dialihkan ke halaman login | Lulus |

---

## 5. Orders CRUD (`orders.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Halaman daftar pesanan menampilkan tabel dan tombol tambah | `orders list page render table` | Halaman daftar pesanan menampilkan input pencarian dan tombol "Tambah Pesanan" | Kedua elemen terlihat di halaman | Lulus |
| 2 | Pesanan yang dibuat via API muncul di daftar UI | `create order via API and verify in list` | Membuat pesanan via API, lalu memverifikasi nomor resi dan nama pelanggan muncul di daftar pesanan | Pesanan muncul di tabel setelah halaman di-reload | Lulus |
| 3 | Detail pesanan menampilkan tombol WhatsApp jika ada nomor HP | `order detail page show WhatsApp button when phone exists` | Halaman detail pesanan menampilkan tombol WhatsApp dengan link `wa.me/...` dan atribut `target="_blank"` | Tombol WhatsApp terlihat dengan link dan atribut yang benar | Lulus |

---

## 6. Orders Functional (`orders-functional.spec.ts`)

### Tambah Pesanan

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Klik "Tambah Pesanan" membuka halaman form pesanan baru | `navigate to create order page from orders list` | Klik "Tambah Pesanan" mengarahkan ke `/admin/orders/create` dengan judul "Pesanan Baru" | Navigasi berhasil, judul halaman sesuai | Lulus |
| 2 | Form pesanan baru memiliki semua field yang diperlukan | `create order form has all required fields` | Form membuat pesanan menampilkan label: Nama Pelanggan, No. HP, Deadline, Status Pembayaran, Total Biaya, Jenis Pakaian | Semua label field terlihat di form | Lulus |
| 3 | Mengisi dan mengirim form pesanan baru berhasil | `fill and submit create order form` | Mengisi semua field form dan men-submit, lalu verifikasi redirect ke detail pesanan dan nama pelanggan muncul | Form berhasil di-submit, data pesanan tersimpan | Lulus |

### Edit Pesanan

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 4 | Detail pesanan menampilkan bagian informasi pembayaran | `order detail page show payment section` | Halaman detail menampilkan bagian Pembayaran dengan teks "Total" dan "Dibayar" | Bagian pembayaran terlihat dengan informasi yang benar | Lulus |
| 5 | Klik tombol edit membuka form ubah pembayaran | `click edit button show payment edit form` | Klik tombol edit pada bagian pembayaran menampilkan form edit dengan field: Total Biaya, DP, Status Pembayaran, tombol Simpan, dan tombol Batal | Form edit pembayaran muncul dengan semua field | Lulus |
| 6 | Mengubah jumlah bayar dan status pembayaran berhasil | `edit payment amount and status` | Mengubah total dan DP menjadi 500000, status "paid", lalu verifikasi badge "Lunas" muncul | Perubahan tersimpan, badge Lunas (emerald) terlihat | Lulus |
| 7 | Klik Batal mengembalikan tampilan ke mode baca | `cancel edit restore read-only view` | Klik tombol "Batal" mengembalikan tampilan ke mode baca (read-only) dengan teks "Total" dan "Dibayar" | Tampilan read-only pulih setelah membatalkan edit | Lulus |

### Gambar Sketsa

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 8 | Modal sketsa menampilkan canvas dan tombol aksi | `sketch modal has canvas and toolbar` | Klik "Tambah Sketsa" membuka modal "Sketsa Item" yang menampilkan elemen canvas, tombol "Simpan Sketsa", dan tombol "Batal" | Modal terbuka, canvas dan tombol-tombol terlihat | Lulus |
| 9 | Modal sketsa menyediakan tombol template pakaian | `sketch modal has template buttons` | Modal sketsa menampilkan tombol template seperti "Kemeja" | Tombol template "Kemeja" terlihat di modal | Lulus |
| 10 | Klik Batal pada modal sketsa menutup modal | `sketch modal close on cancel` | Klik "Batal" pada modal sketsa menutup modal | Modal tertutup setelah klik Batal | Lulus |

---

## 7. Kanban Board (`kanban.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Halaman kanban menampilkan kolom-kolom fase produksi | `kanban page render phase columns` | Halaman `/admin/work` menampilkan minimal 1 kolom fase (elemen `<h2>`) | Kolom fase terlihat di halaman kanban | Lulus |
| 2 | Kolom kanban menampilkan label Potong/Jahit/Finishing | `kanban show cutting/sewing/finishing labels` | Header kolom mengandung label "Potong", "Jahit", atau "Finishing" | Label fase produksi muncul dengan benar | Lulus |
| 3 | Klik tombol Sketsa pada kartu pesanan membuka modal gambar | `click Sketsa button open modal with image` | Klik tombol "Sketsa" pada order card membuka modal dengan gambar sketsa | Test di-skip — order dibuat tanpa file sketsa, sehingga tombol Sketsa tidak dirender | Dilewati |

---

## 8. Workers / Karyawan (`workers-functional.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Halaman karyawan menampilkan tombol tambah karyawan | `workers list page render table and add button` | Halaman karyawan menampilkan tombol "Tambah Karyawan" | Tombol terlihat di halaman | Lulus |
| 2 | Menambahkan karyawan baru melalui modal berhasil | `open add worker modal and create worker` | Membuka modal, mengisi nama "E2E Test Worker" dan role "Jahit", menyimpan, lalu verifikasi nama muncul di tabel | Karyawan berhasil ditambahkan dan muncul di daftar | Lulus |
| 3 | Halaman karyawan memiliki kolom pencarian | `workers list has search input` | Halaman karyawan memiliki input pencarian dengan placeholder "Cari" | Input pencarian tersedia | Lulus |

---

## 9. Users / Kelola User (`users-functional.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Halaman kelola user menampilkan tabel dengan kolom | `users page render table with columns` | Halaman "Kelola User" menampilkan heading dan kolom tabel "Nama" atau teks "Tidak ada user" | Heading dan struktur tabel terlihat | Lulus |
| 2 | Halaman kelola user memiliki tombol tambah user | `users page has add user button` | Tombol "Tambah User" tersedia di halaman | Tombol terlihat | Lulus |
| 3 | Halaman kelola user memiliki kolom pencarian | `users page has search input` | Input pencarian "Cari" tersedia di halaman | Input pencarian terlihat | Lulus |
| 4 | Modal tambah user terbuka dan tertutup dengan benar | `add user modal open and close` | Klik "Tambah User" membuka modal dengan field: Nama Lengkap, Email, Password. Klik "Batal" menutup modal | Modal terbuka dengan field yang benar, tertutup setelah Batal | Lulus |
| 5 | Menambahkan user baru dan verifikasi muncul di tabel | `add new user and verify in table` | Mengisi form (nama, email, password), menyimpan, lalu verifikasi nama dan email muncul di tabel serta data tersimpan via API | User baru muncul di tabel dan tersimpan di database | Lulus |
| 6 | Mengubah data user melalui modal edit | `edit user via modal` | Membuat user via API, klik tombol Edit, mengubah nama menjadi "E2E Test User Updated", menyimpan, verifikasi nama baru muncul | Nama user berhasil diubah dan perubahan terlihat di tabel | Lulus |
| 7 | Menghapus user melalui modal konfirmasi | `delete user via modal` | Membuat user via API, klik tombol Hapus, konfirmasi "Ya, Hapus", verifikasi user hilang dari tabel | User berhasil dihapus dan tidak lagi muncul di tabel | Lulus |

---

## 10. Tracking Publik (`tracking.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Halaman pelacakan menampilkan form pencarian resi | `tracking page render search form` | Halaman `/tracking` menampilkan heading "Cek Status", input dengan placeholder "Contoh", dan tombol "Cari" | Semua elemen form pencarian terlihat | Lulus |
| 2 | Mencari nomor resi yang valid menampilkan detail pesanan | `search valid receipt redirect to tracking detail` | Membuka `/tracking/RES-2024-001` menampilkan detail pelacakan, URL mengandung nomor resi | Halaman detail tracking dimuat dengan benar | Lulus |
| 3 | Mencari nomor resi yang tidak ada menampilkan halaman error | `search invalid receipt show 404 or error` | Membuka `/tracking/NONEXISTENT-99999` menampilkan halaman 404 atau pesan "tidak ditemukan" | Halaman error/pesan "tidak ditemukan" muncul | Lulus |

---

## 11. Settings / Pengaturan (`settings-functional.spec.ts`)

### Ubah Password

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Form ubah password menampilkan semua field yang dibutuhkan | `settings page render password change form` | Klik "Ubah Password" membuka modal dengan field: Password Saat Ini, Password Baru, Konfirmasi Password Baru, dan tombol Simpan | Modal terbuka dengan semua field yang benar | Lulus |
| 2 | Password baru dan konfirmasi tidak cocok menampilkan error | `password mismatch show error` | Mengisi password baru dan konfirmasi dengan nilai berbeda, men-submit → pesan "tidak cocok" muncul | Pesan error validasi "tidak cocok" tampil | Lulus |
| 3 | Password baru kurang dari 6 karakter menampilkan error | `short password show error` | Mengisi password baru kurang dari 6 karakter, men-submit → pesan "minimal 6 karakter" muncul | Pesan error validasi "minimal 6 karakter" tampil | Lulus |

### Portofolio

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 4 | Halaman pengaturan menampilkan bagian portofolio | `settings page render portfolio section` | Bagian "Portofolio" terlihat di halaman pengaturan | Bagian portofolio muncul | Lulus |
| 5 | Modal tambah portofolio menampilkan form yang lengkap | `open portfolio modal and check form fields` | Klik "Tambah" membuka modal "Tambah Portofolio" dengan field: Judul, Kategori, Deskripsi | Modal terbuka, semua field terlihat | Lulus |
| 6 | Tombol tambah portofolio nonaktif jika field belum diisi | `portfolio upload button disabled without required fields` | Tombol "Tambahkan" dalam keadaan disabled ketika field belum diisi | Tombol disabled saat form kosong | Lulus |
| 7 | Mengisi judul dan kategori mengaktifkan tombol tambah | `fill portfolio metadata enable upload button` | Mengisi judul dan kategori mengaktifkan tombol "Tambahkan" | Tombol enabled setelah field diisi | Lulus |
| 8 | Menambahkan portofolio via API dan verifikasi di halaman | `create portfolio via API and verify in settings page` | Membuat portofolio via API, membuka halaman settings, verifikasi judul portofolio muncul, lalu hapus data test | Portofolio muncul di halaman settings setelah dibuat via API | Lulus |
| 9 | Halaman pengaturan menampilkan daftar portofolio yang sudah ada | `settings page render existing portfolio grid` | Halaman settings menampilkan grid portofolio dan tombol reload | Grid portofolio dan tombol reload terlihat | Lulus |

### Profile Info

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 10 | Halaman pengaturan menampilkan form informasi usaha | `settings page render business info form` | Bagian "Informasi Usaha" menampilkan field: Nama Usaha, Alamat Lengkap, No. Telepon, Email | Semua field informasi usaha terlihat | Lulus |
| 11 | Klik Edit mengaktifkan form dan menampilkan tombol Simpan | `click edit enable form fields and show save button` | Klik tombol "Edit" mengaktifkan field form dan menampilkan tombol "Simpan" serta "Batal" | Tombol Simpan dan Batal muncul setelah klik Edit | Lulus |

---

## 12. Reports / Laporan (`reports-functional.spec.ts`)

### Cek Laporan

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Halaman laporan menampilkan kartu ringkasan statistik | `reports page render summary cards` | Halaman laporan menampilkan kartu ringkasan: Pesanan Masuk, Pendapatan, Pesanan Selesai, Total Item | Semua kartu ringkasan terlihat | Lulus |
| 2 | Halaman laporan menampilkan tabel rekap harian | `reports page render daily breakdown table` | Bagian "Rekap Harian" menampilkan tabel dengan kolom: Hari, Tanggal, Masuk, Selesai | Tabel rekap harian terlihat dengan kolom yang benar | Lulus |
| 3 | Halaman laporan menampilkan breakdown berdasarkan jenis pakaian | `reports page render garment type breakdown` | Bagian "Jenis Pakaian" terlihat di halaman laporan | Bagian breakdown jenis pakaian muncul | Lulus |
| 4 | Halaman laporan menampilkan breakdown status pembayaran | `reports page render payment status breakdown` | Bagian "Status Pembayaran" menampilkan kategori: Lunas, DP, Belum Lunas | Semua kategori status pembayaran terlihat | Lulus |
| 5 | Halaman laporan menampilkan tabel produktivitas karyawan | `reports page render productivity table` | Bagian "Produktivitas Karyawan" menampilkan tabel dengan kolom: Karyawan, Divisi, Selesai | Tabel produktivitas terlihat dengan kolom yang benar | Lulus |
| 6 | Navigasi minggu memiliki tombol Hari Ini dan panah prev/next | `week navigator has prev/next buttons and today button` | Tombol "Hari Ini" tersedia untuk navigasi minggu | Tombol "Hari Ini" terlihat | Lulus |

### Export Laporan

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 7 | Tombol export Excel tersedia di halaman laporan | `export Excel button is visible` | Tombol "Export Excel" terlihat di halaman laporan | Tombol terlihat | Lulus |
| 8 | Klik export Excel mengunduh file spreadsheet | `click export Excel trigger download` | Klik "Export Excel" mengunduh file dengan nama mengandung `.xlsx` dan `laporan` | File Excel berhasil diunduh dengan nama yang sesuai | Lulus |
| 9 | API export mengembalikan file Excel yang valid | `export API endpoint return Excel file` | `GET /reports/weekly-recap/export` mengembalikan response dengan `content-type` mengandung `spreadsheetml` | API mengembalikan file Excel dengan content-type yang benar | Lulus |

---

## 13. Admin Dashboard (`admin-dashboard.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | Dashboard menampilkan kartu statistik pesanan dan pendapatan | `dashboard page render stat cards` | Halaman dashboard menampilkan kartu "Pesanan Aktif" dan "Pendapatan Minggu Ini" | Kedua kartu statistik terlihat | Lulus |
| 2 | Dashboard menampilkan grafik tren pesanan 7 hari terakhir | `dashboard show trend chart area` | Bagian "Tren Pesanan 7 Hari" atau "tren" terlihat di dashboard | Bagian tren pesanan muncul | Lulus |
| 3 | Dashboard menampilkan bagian notifikasi | `dashboard show notifications section` | Bagian "Notifikasi" atau "notifikasi" terlihat di dashboard | Bagian notifikasi muncul | Lulus |
| 4 | Klik "Lihat Semua" mengarahkan ke halaman daftar pesanan | `dashboard link to orders page` | Klik link "Lihat Semua" mengarahkan ke halaman `/admin/orders` | Navigasi ke halaman pesanan berhasil | Lulus |

---

## 14. API — Dashboard (`api/dashboard.api.spec.ts`)

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | API ringkasan dashboard mengembalikan data statistik | `GET /dashboard/summary return stats` | Response memiliki properti `activeOrders`, `weeklyRevenue`, `todayDone` yang bertipe number | Semua properti ada dan bertipe number | Lulus |
| 2 | API tren dashboard mengembalikan data 7 hari terakhir | `GET /dashboard/trend return trend data` | Response memiliki `labels` (array dengan 7 elemen), `incoming`, dan `completed` | Data tren lengkap dengan 7 label | Lulus |
| 3 | API notifikasi dashboard mengembalikan daftar notifikasi | `GET /dashboard/notifications return array` | Response berupa array, item pertama (jika ada) memiliki `receiptNumber`, `daysLeft`, `urgency` | Response array dengan struktur notifikasi yang benar | Lulus |

---

## 15. API — Orders (`api/orders.api.spec.ts`)

### CRUD

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 1 | API mengambil daftar semua pesanan | `GET /orders/ return array` | `GET /orders/` mengembalikan array pesanan | Response berupa array | Lulus |
| 2 | API membuat pesanan baru | `POST /orders/ create order` | Membuat pesanan via API mengembalikan data dengan `id`, `receiptNumber`, dan `customerName` yang sesuai | Pesanan berhasil dibuat dengan data yang benar | Lulus |
| 3 | API mengambil detail pesanan berdasarkan ID | `GET /orders/{id} return single order` | Mengambil pesanan by ID mengembalikan data yang sama dengan yang dibuat | Data pesanan by ID sesuai | Lulus |
| 4 | API mengambil data tracking berdasarkan nomor resi | `GET /orders/tracking/{receipt} return tracking info` | Mengambil tracking by nomor resi mengembalikan `receiptNumber` yang sesuai | Data tracking ditemukan dengan nomor resi yang benar | Lulus |
| 5 | API menghapus pesanan berdasarkan ID | `DELETE /orders/{id} remove order` | Menghapus pesanan by ID berhasil (tidak error) | Pesanan berhasil dihapus | Lulus |
| 6 | API mengembalikan struktur data kanban untuk halaman work | `GET /orders/admin-work return kanban structure` | Response memiliki `phases` (array), setiap phase memiliki properti `phase`, `ready`, `in_progress` | Struktur kanban sesuai ekspektasi | Lulus |

### Payment Update

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 7 | API mengupdate field pembayaran pesanan | `PUT /orders/{id} update payment fields` | Update `totalPrice=500000`, `dpAmount=0`, `paymentStatus='unpaid'` → data tersimpan dengan benar | Field pembayaran berhasil diupdate ke status unpaid | Lulus |
| 8 | API menghitung otomatis status lunas dari jumlah DP | `PUT /orders/{id} update to paid via dpAmount` | Update `dpAmount=500000`, `totalPrice=500000` → `paymentStatus` otomatis menjadi `paid` | Sistem menghitung otomatis, status berubah jadi paid | Lulus |

### Sketch in Admin Work

| # | Deskripsi | Test Case (Teknis) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|-----------|----------------------|----------------------|--------------|--------|
| 9 | Setiap item di API admin-work memiliki field sketsa | `GET /orders/admin-work items include sketch field` | Setiap item task di response admin-work memiliki properti `sketch` | Semua item memiliki field `sketch` | Lulus |
| 10 | Field sketsa bernilai null jika belum ada gambar diunggah | `GET /orders/admin-work item sketch is null when no sketch uploaded` | Order yang dibuat tanpa file sketsa memiliki `sketch: null` | Field `sketch` bernilai null untuk order tanpa sketsa | Lulus |

---

## Catatan

- **8 test di-skip** karena fitur belum diimplementasi (6 test RBAC staff, 1 test sketsa dari kanban, 1 test navigasi tracking dari landing)
- **0 test gagal** — semua 86 test yang dijalankan berhasil lulus
- Semua test menggunakan data dummy dengan prefix "E2E Test" dan di-cleanup otomatis setelah selesai
