# Changelog — Autentikasi & Otorisasi

## Ringkasan

Implementasi sistem login/logout dengan JWT di HTTP-only cookie. Backend hanya punya 3 endpoint auth baru, frontend ada halaman login + change password + route guard.

---

## Backend

### Dependensi Baru
- `passlib[bcrypt]` — hashing password
- `python-jose[cryptography]` — JWT encode/decode

### File Baru

| File | Deskripsi |
|------|-----------|
| `app/models/user.py` | Model `User` (id, email, password_hash, name, is_owner, created_at, updated_at) |
| `app/auth.py` | Helper: `get_password_hash`, `verify_password`, `create_access_token`, `get_current_user`. `get_current_user` baca token dari cookie `access_token` dulu, fallback ke header `Authorization: Bearer` |
| `app/routers/auth.py` | 3 endpoint auth |

### Endpoint Auth

| Method | Path | Auth | Fungsi |
|--------|------|------|--------|
| POST | `/auth/login` | ❌ Publik | Validasi email+password → set cookie JWT (httpOnly, samesite=lax, max-age=86400) → return `{user: {id, email, name}}` |
| POST | `/auth/logout` | ❌ Publik | Hapus cookie `access_token` |
| PUT | `/auth/password` | ✅ Token | Body `{current_password, new_password}` → update hash |

### Proteksi Endpoint Existing

**Publik (tanpa token):**
- `GET /` — health check
- `POST /auth/login` — login
- `GET /profile/public` — profil bisnis publik
- `GET /portfolio/` — portofolio publik
- `GET /orders/tracking/{receipt}` — tracking publik
- `/uploads/*` — file statis

**Protected (pake `Depends(get_current_user)`):**
- Semua endpoint di: `workers/`, `garment-types/`, `attributes/`, `dashboard/`, `reports/`
- Orders: semua kecuali `/tracking/{receipt}`
- Profile: `PUT /profile/`
- Portfolio: `POST /portfolio/`, `PUT /portfolio/{id}`, `POST /portfolio/{id}/image`, `DELETE /portfolio/{id}`

### File Diubah

| File | Perubahan |
|------|-----------|
| `app/main.py` | + import `init_auth` + panggil di startup, + import & register `auth.router` |
| `app/models/__init__.py` | + import `User` |
| `app/routers/workers.py` | + `dependencies=[Depends(get_current_user)]` di router |
| `app/routers/garment_types.py` | + `dependencies=[Depends(get_current_user)]` di router |
| `app/routers/attributes.py` | + `dependencies=[Depends(get_current_user)]` di router |
| `app/routers/dashboard.py` | + `dependencies=[Depends(get_current_user)]` di router |
| `app/routers/analytics.py` | + `dependencies=[Depends(get_current_user)]` di router |
| `app/routers/orders.py` | + `Depends(get_current_user)` di 7 endpoint (kecuali tracking) |
| `app/routers/profile.py` | + `Depends(get_current_user)` di `PUT /profile/` |
| `app/routers/portfolio.py` | + `Depends(get_current_user)` di 4 endpoint CRUD |
| `seeds/seeder.py` | + seed owner user `owner@rumahjahit.id` / `admin123` |
| `.env` | + `JWT_SECRET`, `JWT_EXPIRE_MINUTES` |
| `requirements.txt` | + `passlib[bcrypt]`, `python-jose[cryptography]` |

### Migration

- `20260516_8b2143cecc5f_add_users_table.py` — create table `users`

---

## Frontend

### Dependensi Baru
- `@pinia/nuxt` — state management Pinia untuk Nuxt

### File Baru

| File | Deskripsi |
|------|-----------|
| `app/stores/auth.ts` | Pinia store `useAuthStore` — state `user`, action `login(email, password)`, `logout()`, `init()` |
| `app/pages/login.vue` | Halaman login dengan form email+password, gradient background, auto-redirect ke `/admin/dashboard` |
| `app/middleware/auth.global.ts` | Global route guard: redirect `/admin/*` ke `/login` jika belum auth, redirect `/login` ke `/admin/dashboard` jika sudah auth |

### File Diubah

| File | Perubahan |
|------|-----------|
| `nuxt.config.ts` | + route rule `'/login': { ssr: false }`, + modul `@pinia/nuxt` |
| `app/layouts/admin.vue` | Ganti "Admin" statis → nama user dari store, tambah dropdown (Pengaturan, Keluar), cek auth di setup + redirect ke `/login` |
| `app/pages/admin/settings.vue` | Tambah kartu "Ubah Password" (form: password saat ini, baru, konfirmasi, validasi client-side, call `PUT /auth/password`) |

---

## Alur Auth

```
[User]               [Frontend]                    [Backend]
  │                       │                            │
  │  Buka /admin/*        │                            │
  │ ──────────────────>   │  Global middleware:         │
  │                       │  cek auth store             │
  │                       │  (belum login)              │
  │  Redirect /login      │                            │
  │ <─────────────────    │                            │
  │                       │                            │
  │  Isi email+password   │                            │
  │ ──────────────────>   │  POST /auth/login          │
  │                       │ ──────────────────────────>│  Validasi
  │                       │                            │  Generate JWT
  │                       │ <────── 200 + Set-Cookie ──│  Set httpOnly cookie
  │                       │  Simpan user ke             │
  │                       │  Pinia + localStorage       │
  │  Redirect /admin/*    │                            │
  │ <─────────────────    │                            │
  │                       │                            │
  │  Akses data           │                            │
  │ ──────────────────>   │  GET /orders/ dll          │
  │                       │ ──────────────────────────>│  Cookie otomatis
  │                       │                            │  terkirim
  │                       │                            │  JWT valid? → data
  │                       │                            │  JWT invalid? → 401
  │                       │                            │
  │  Ganti password       │                            │
  │ ──────────────────>   │  PUT /auth/password        │
  │                       │ ──────────────────────────>│  Validasi + update
  │                       │ <────── 200 ──────────────│
```

---

## Testing

Semua 9 skenario test lulus:

```
1. LOGIN: user=Owner
2. WORKERS (Bearer): 72 workers
3. WORKERS (Cookie): 72 workers
4. PORTFOLIO (public): 18 items
5. Unauthorized blocked: 401
6. LOGOUT
7. PASSWORD CHANGED
8. LOGIN WITH NEW PASSWORD
9. PASSWORD REVERTED
```

---

## Login Default (Seeder)

- **Email**: `owner@rumahjahit.id`
- **Password**: `admin123`

INFO:     127.0.0.1:52982 - "POST /auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:51701 - "GET /dashboard/summary HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:54448 - "GET /dashboard/trend HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:51701 - "GET /dashboard/notifications HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:54448 - "GET /orders/ HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:53715 - "GET /dashboard/summary HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:63433 - "GET /dashboard/trend HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:52578 - "GET /dashboard/notifications HTTP/1.1" 401 Unauthorized