# Dokumentasi Halaman Frontend

Dokumen ini menjelaskan struktur halaman yang akan dibangun dalam aplikasi Nuxt 4 (Tailwind CSS).

## A. Halaman Publik (Modul Profil Usaha & Pelanggan)

### 1. Landing Page / Profil Usaha
**Route**: `/`

- **Fitur**:
  - **Hero Section**: Nama usaha, slogan, dan foto utama.
  - **Tentang Kami**: Alamat lengkap, kontak (WA/Email), jam operasional.
  - **Portofolio**: Galeri foto hasil jahitan terbaik.
  - **Cek Status Pesanan**: Input field untuk memasukkan Nomor Resi/Order ID.
- **API**: `GET /profile/public`, `GET /portfolio`.

### 2. Tracking Pesanan (Modul Tracking)
**Route**: `/tracking` (atau `/tracking/:orderId`)

- **Fitur**:
  - **Nota Digital**: Menampilkan rincian pesanan (Nama, Jenis Pakaian, Ukuran, Biaya).
  - **Progress Bar**: Status real-time (Diterima -> Potong -> Jahit -> Finishing -> Selesai).
  - **Estimasi Selesai**: Tanggal perkiraan selesai (berdasarkan deadline/beban kerja).
  - **Status Pembayaran**: Lunas / Belum Lunas.
- **API**: `GET /orders/tracking/{orderId}`.

---

## B. Halaman Admin (Modul Manajemen)

### 3. Dashboard Admin
**Route**: `/admin/dashboard`

- **Fitur**:
  - **Ringkasan**: Total pesanan aktif, pendapatan minggu ini, karyawan aktif.
  - **Grafik Tren**: Grafik garis pesanan masuk vs selesai mingguan.
  - **Notifikasi**: Pesanan yang mendekati deadline (Urgency tinggi).

### 4. Manajemen Pesanan (Orders)
**Route**: `/admin/orders`

- **Fitur**:
  - **List Pesanan**: Tabel dengan filter status, pencarian nama/resi.
  - **Tambah Pesanan**: Form input detail pelanggan, ukuran, dan deadline.
  - **Detail Pesanan**: Edit status, cetak nota fisik, lihat log pengerjaan.

### 5. Manajemen Karyawan (Employees)
**Route**: `/admin/employees`

- **Fitur**:
  - **Daftar Karyawan**: Nama, Role (Potong/Jahit/Finishing), Status (Idle/Working).
  - **Detail Karyawan**:
    - Riwayat pekerjaan selesai.
    - **Analitik Performa**: Grafik produktivitas harian/mingguan.
    - **Kalkulasi Upah**: Hitung upah mingguan otomatis (Misal: Rp X per pc).
- **API**: `GET /employees`, `GET /employees/{id}/performance`, `GET /employees/{id}/wages`.

### 6. Laporan & Analitik (Reports)
**Route**: `/admin/reports`

- **Fitur**:
  - **Volume Pesanan**: Grafik batang per bulan.
  - **Tren Mode**: Pie chart jenis pakaian terpopuler.
  - **Beban Kerja**: Heatmap kesibukan karyawan.
  - **Export Laporan**: Tombol download PDF/Excel (Laporan Mingguan Otomatis).

### 7. Pengaturan Profil (Settings)
**Route**: `/admin/settings`

- **Fitur**:
  - Edit informasi usaha (Jam buka, Alamat, Kontak).
  - Upload foto portofolio.

---

## C. Halaman Khusus Karyawan

### 8. Papan Kerja (Employee View)
**Route**: `/employee/tasks`

- **Fitur**:
  - **Daftar Prioritas**: List pekerjaan yang *harus* dikerjakan sekarang (Diurutkan oleh ML).
  - **Tombol Aksi**: "Ambil Tugas" dan "Selesai".
  - **Riwayat Saya**: Daftar pekerjaan yang sudah diselesaikan hari ini.
