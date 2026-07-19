# Halaman (Pages)

## Public Pages

| Route | File | Layout | Deskripsi |
|-------|------|--------|-----------|
| `/` | `pages/index.vue` | default | Landing page: hero, profil usaha, portofolio, kontak |
| `/login` | `pages/login.vue` | - | Halaman login admin |
| `/forgot-password` | `pages/forgot-password.vue` | - | Reset password via OTP (60s resend cooldown) |
| `/tracking` | `pages/tracking/index.vue` | default | Form cek pesanan by nomor resi |
| `/tracking/[orderId]` | `pages/tracking/[orderId].vue` | default | Detail status pesanan (receipt, progress bar, log timeline) |

## Admin Pages (Protected)

| Route | File | Layout | Akses | Deskripsi |
|-------|------|--------|-------|-----------|
| `/admin/dashboard` | `pages/admin/dashboard.vue` | admin | Owner | Dashboard: stat cards, tren chart, notifikasi, garment/payment doughnut, recent orders, worker productivity |
| `/admin/work` | `pages/admin/work/index.vue` | admin | All | Papan kerja Kanban (Potong → Jahit → Finishing), assign worker, complete/undo |
| `/admin/work/history` | `pages/admin/work/history.vue` | admin | All | Riwayat pekerjaan selesai |
| `/admin/orders` | `pages/admin/orders/index.vue` | admin | All | Daftar pesanan (search, filter payment), WhatsApp link, quick lunas |
| `/admin/orders/create` | `pages/admin/orders/create.vue` | admin | All | Form buat pesanan baru (customer search, auto-fill measurements, sketch canvas) |
| `/admin/orders/[id]` | `pages/admin/orders/[id].vue` | admin | All | Detail/edit pesanan (items, log timeline, payment sidebar) |
| `/admin/customers` | `pages/admin/customers/index.vue` | admin | All | Manajemen pelanggan (CRUD, search, pagination) |
| `/admin/customers/create` | `pages/admin/customers/create.vue` | admin | All | Form tambah pelanggan |
| `/admin/customers/[id]` | `pages/admin/customers/[id].vue` | admin | All | Detail pelanggan (measurements, order history, payment summary) |
| `/admin/workers` | `pages/admin/workers/index.vue` | admin | All | Daftar karyawan (search, role filter) |
| `/admin/workers/[id]` | `pages/admin/workers/[id].vue` | admin | All | Detail karyawan (productivity chart, stats, task history) |
| `/admin/garment-types` | `pages/admin/garment-types/index.vue` | admin | All | Kelola jenis pakaian (CRUD, soft delete) |
| `/admin/reports` | `pages/admin/reports.vue` | admin | Owner | Laporan mingguan (summary, daily breakdown, garment chart, payment chart, Excel export) |
| `/admin/settings` | `pages/admin/settings.vue` | admin | All | Pengaturan profil usaha, ganti password, kelola portofolio |
| `/admin/users` | `pages/admin/users/index.vue` | admin | Owner | Kelola user (CRUD, owner-only, cannot delete self) |

## Employee Pages

| Route | File | Layout | Deskripsi |
|-------|------|--------|-----------|
| `/task-list` | `pages/task-list/index.vue` | employee | Daftar tugas karyawan (prioritas ML) |

## Layouts

| Layout | File | Digunakan oleh |
|--------|------|----------------|
| `default` | `layouts/default.vue` | Halaman public (navbar + footer) |
| `admin` | `layouts/admin.vue` | Halaman admin (sidebar + topbar + mobile bottom nav) |
| `employee` | `layouts/employee.vue` | Halaman karyawan (topbar + tab nav) |

## Akses Role

- **Public**: `/`, `/login`, `/forgot-password`, `/tracking/**`
- **Staff + Owner**: semua `/admin/*` kecuali yang di bawah
- **Owner only**: `/admin/dashboard`, `/admin/reports`, `/admin/users`
- **Staff default landing**: `/admin/work`
- **Owner default landing**: `/admin/dashboard`
- **Non-owner yang akses `/admin/dashboard`/`/admin/reports`/`/admin/users`**: redirect ke `/admin/work`
