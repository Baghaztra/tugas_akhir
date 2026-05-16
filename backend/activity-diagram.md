# Activity Diagram — Konveksi Management System

Aktor: **User** (1 role — merangkap admin + operator produksi)

---

## 1. Kelola Pesanan

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka Pesanan]
    B --> C{Pilih Aksi}

    C -->|Buat| D[Input Data Customer]
    D --> E[Tambah Item]
    E --> F[Pilih Garment]
    F --> G[Input Ukuran]
    G --> H[Upload Sketsa]
    H --> I{Tambah Item?}
    I -->|Ya| E
    I -->|Tidak| J[Atur Harga]
    J --> K[Simpan Pesanan]
    K --> L[Pesanan Tersimpan]
    L --> Z([Selesai])

    C -->|Lihat| M[Lihat Semua Pesanan]
    M --> N{Cari?}
    N -->|Ya| O[Filter Keyword / Status]
    O --> M
    N -->|Tidak| P[Pilih Pesanan]
    P --> Q[Detail Pesanan]
    Q --> R[Item, Status, Bayar, Log]
    R --> Z

    C -->|Ubah| S[Cari & Pilih Pesanan]
    S --> T[Edit Data Customer / Item]
    T --> U[Simpan]
    U --> Z

    C -->|Hapus| V[Cari & Pilih Pesanan]
    V --> W[Konfirmasi Hapus]
    W --> X[Pesanan & Item Terhapus]
    X --> Z
```

---

## 2. Produksi (Kanban Board)

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka Produksi]
    B --> C[Tampilkan Kanban Board]
    C --> D["Lihat Item per Fase Potong | Jahit | Finishing"]
    D --> E["Tiap Fase: Siap | Dikerjakan"]

    E --> F{Pilih Aksi}

    F -->|Assign| G[Pilih Item di Fase Siap]
    G --> H[Daftar Pekerja sesuai Role]
    H --> I[Pilih Pekerja]
    I --> J[Item ke Dikerjakan]
    J --> K[Log Otomatis]
    K --> E

    F -->|Selesai| L[Pilih Item di Dikerjakan]
    L --> M[Konfirmasi Selesai]
    M --> N[Item ke Fase Berikutnya]
    N --> O[Log Otomatis]
    O --> E

    F -->|Riwayat| P[Buka Riwayat]
    P --> Q[Semua Item Selesai]
    Q --> R[Cari Resi / Pelanggan]
    R --> S[Detail Riwayat]
    S --> E
```

---

## 3. Kelola Pekerja

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka Pekerja]
    B --> C{Pilih Aksi}

    C -->|Tambah| D[Input Nama]
    D --> E[Pilih Role]
    E --> F[Simpan]
    F --> G[Pekerja Baru: Idle]
    G --> Z([Selesai])

    C -->|Lihat| H[Semua Pekerja]
    H --> I{Filter Role?}
    I -->|Ya| J[Pilih Role]
    J --> H
    I -->|Tidak| K[Pilih Pekerja]
    K --> L[Detail Pekerja]
    L --> M[Nama, Role, Status, Tgl Masuk]
    M --> N[Hitung Upah]
    N --> O[Pilih Periode]
    O --> P[Jumlah Item x Upah]
    P --> Q[Total Upah]
    Q --> R[Grafik Produktivitas]
    R --> Z

    C -->|Ubah| S[Pilih Pekerja]
    S --> T[Edit Nama / Role]
    T --> U[Simpan]
    U --> Z

    C -->|Hapus| V[Pilih Pekerja]
    V --> W[Konfirmasi Hapus]
    W --> X[Pekerja Terhapus]
    X --> Z
```

---

## 4. Dashboard & Laporan

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka Dashboard]

    B --> C[Ringkasan: Pesanan Aktif, Pendapatan, Selesai Hari Ini]
    C --> D[Grafik Tren 7 Hari]
    D --> E[Notifikasi Deadline: Kritis | Tinggi | Sedang]

    E --> F{Pilih Laporan}

    F -->|Volume| G[Laporan Volume Pesanan]
    G --> H[Pilih Periode]
    H --> I[Grafik Volume]
    I --> F

    F -->|Tren Produk| J[Laporan Tren Produk]
    J --> K[Grafik Garment Terpopuler]
    K --> F

    F -->|Produktivitas| L[Laporan Produktivitas]
    L --> M[Item Selesai per Pekerja + Rata-rata Waktu]
    M --> F

    F -->|Selesai| N([Selesai])
```

---

## 5. Pengaturan

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka Pengaturan]
    B --> C{Pilih Menu}

    C -->|Profil| D[Edit Nama, Alamat, Kontak, Jam, IG]
    D --> E[Upload Logo]
    E --> F[Simpan]
    F --> C

    C -->|Portfolio| G[Daftar Portfolio]
    G --> H{Pilih Aksi}
    H -->|Tambah| I[Input Judul & Kategori]
    I --> J[Upload Gambar]
    J --> K[Input Deskripsi]
    K --> L[Simpan]
    L --> G
    H -->|Hapus| M[Pilih Item]
    M --> N[Konfirmasi Hapus]
    N --> G

    C -->|Garment| O[Daftar Jenis Garment]
    O --> P{Pilih Aksi}
    P -->|Tambah| Q[Input Nama]
    Q --> R[Simpan]
    R --> O
    P -->|Ubah| S[Edit Nama]
    S --> R
    P -->|Hapus| T[Pilih & Konfirmasi]
    T --> O

    C -->|Atribut| U[Daftar Atribut]
    U --> V{Pilih Aksi}
    V -->|Tambah| W[Input Nama]
    W --> X[Simpan]
    X --> U
    V -->|Hapus| Y[Pilih & Konfirmasi]
    Y --> U

    C -->|Kembali| Z([Selesai])
```

---

## 6. Tracking Pesanan (Publik)

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka Tracking]
    B --> C[Input Nomor Resi]
    C --> D{Cari Pesanan}

    D -->|Tidak| E[Error: Resi Tidak Ditemukan]
    E --> C

    D -->|Ya| F[Hasil Tracking]
    F --> G[Info Customer]
    G --> H[Progress: Diterima → Potong → Jahit → Finishing → Selesai]
    H --> I[Status Bayar: Lunas / Belum / DP]
    I --> J[Rincian Item]
    J --> K[Timeline Riwayat Pekerjaan]
    K --> Z([Selesai])
```

### 7. Menu
```mermaid
flowchart TD
    A([Akses Dashboard]) --> C{Pilih Menu}
    
    C -->|Karyawan| D[Kelola Data Pekerja]
    C -->|Pesanan| E[Lihat Pesanan dan update data]
    C -->|Laporan| F[Lihat Laporan Pekerjaan dan Tren Pesanan]
    C -->|Portofolio| G[Kelola Data Portofolio]
    
    D & E & F & G --> H([Selesai])
```

```mermaid
---
config:
  layout: fixed
---
flowchart TB
 subgraph Kerja["Tahap Eksekusi Produksi"]
        E["Jahit"]
        C["Potong"]
        F["Finishing"]
  end
    A(["Input Pesanan"]) --> B["Pecah pesanan berdasarkan item"]
    C --> E
    E --> F
    B -- Urutkan selutruh item yang belum selesai dengan ML --> Kerja
    Kerja --> G(["Selesai"])
```
---

## Catatan

- Semua aktivitas dilakukan oleh **1 aktor tunggal** (User) yang menangani seluruh aspek operasional.
- Diagram dibuat dengan [Mermaid.js](https://mermaid.js.org/) — dapat dirender langsung di GitHub, GitLab, Notion, atau editor Mermaid.
