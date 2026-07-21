# Autentikasi

## Overview

- **Metode**: JWT (JSON Web Token) via HTTP-only cookie
- **Library**: `python-jose` (JWT, HS256), `passlib` + `bcrypt` (password hashing)
- **Token disimpan di**: Cookie `access_token` (httponly, samesite=lax, max_age=86400)
- **Fallback**: Header `Authorization: Bearer <token>`
- **Durasi token**: 1440 menit (24 jam), dikonfigurasi via `JWT_EXPIRE_MINUTES`
- **Sliding session**: Cookie di-refresh setiap request terautentikasi

## Alur Login

1. Frontend mengirim `POST /auth/login` dengan `{name, password}`
2. Backend verifikasi credential, generate JWT dengan `sub` (user ID) + `exp` claim
3. JWT diset sebagai cookie `access_token`
4. Frontend menyimpan user info di localStorage (`auth_user`)
5. Setiap request ke `/admin/*` menyertakan cookie secara otomatis

## Role

| Role | Akses | Default landing |
|------|-------|----------------|
| Owner (`is_owner=true`) | Semua halaman admin, termasuk dashboard, reports, users | `/admin/dashboard` |
| Staff (`is_owner=false`) | Orders, workers, work, garment-types, settings | `/admin/work` |

## Proteksi Route

### Backend

- **Router-level**: `Depends(get_current_user)` pada router dependency (analytics, attributes, dashboard, garment_types, users)
- **Per-endpoint**: `Depends(get_current_user)` pada individual endpoint (orders, workers, customers, profile, portfolio)
- **Owner-only**: `Depends(check_owner)` pada `/users` endpoints — requires `is_owner == True`
- **Public endpoints**: login, logout, forgot-password, reset-password, tracking, portfolio list, profile public, worker create

### Frontend

Global middleware `middleware/auth.global.ts`:
- Skips server-side rendering (`process.server` guard)
- Calls `auth.init()` (reads `localStorage`)
- **Already logged in + on `/login`** → redirect ke `/admin/dashboard` (owner) atau `/admin/work` (staff)
- **Unauthenticated + `/admin/*`** → redirect ke `/login`
- **Non-owner on `/admin/users`** → redirect ke `/admin/work`
- **Non-owner on `/admin/dashboard` atau `/admin/reports`** → redirect ke `/admin/work`

## Forgot Password Flow

1. User submit email di `/forgot-password`
2. Backend generate OTP 6-digit, simpan di `password_reset_tokens` (expires 15 menit)
3. Kirim OTP via SMTP email
4. User input OTP + password baru
5. Backend verifikasi OTP, update password, set cookie

## Environment Variables

```
JWT_SECRET=<random-secret-key>
JWT_EXPIRE_MINUTES=1440
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<app-password>
SMTP_FROM_EMAIL=<email>
```
