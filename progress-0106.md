# Progress Fitur: Lupa Password (OTP via Email/SMTP)

> Generated: 2026-06-02

---

## Ringkasan

Menambahkan fitur **Forgot/Reset Password** menggunakan OTP 6 digit yang dikirim
via email. Setelah OTP diverifikasi, user bisa mengisi password baru dan langsung
login (auto-login).

## Alur

```
[Lupa Password] -> [Input Email] -> [OTP dikirim via SMTP]
  -> [Input OTP + Password Baru] -> [Auto Login ke Dashboard]
```

## Perubahan

### Backend

#### Model Baru: `backend/app/models/password_reset_token.py`

| Field | Type | Keterangan |
|-------|------|-----------|
| `id` | Integer, PK | Auto increment |
| `user_id` | Integer, FK -> users.id | Relasi ke user |
| `otp_code` | String(6) | Kode OTP 6 digit |
| `expires_at` | DateTime(timezone) | Expiry 10 menit |
| `used` | Boolean, default false | Single-use |
| `created_at` | DateTime, server_default now | Waktu dibuat |

#### File Baru: `backend/app/email.py`

Utility untuk kirim email via SMTP (`smtplib` bawaan Python, **tanpa dependency baru**).

- Config dari `.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`
- Fungsi: `send_otp_email(to_email, otp_code, user_name)`
- Template HTML sederhana dengan styling inline

#### Endpoint Baru di `backend/app/routers/auth.py`

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `POST` | `/auth/forgot-password` | Tidak | Generate OTP 6 digit, simpan di DB, kirim email |
| `PUT` | `/auth/reset-password` | Tidak | Verif OTP, update password, set cookie (auto-login) |

**Detail endpoint:**

- `POST /auth/forgot-password`:
  - Input: `{ email: string }`
  - Cari user (tidak reveal apakah email terdaftar)
  - Invalidasi OTP lama untuk user tsb (soft-delete `used = true`)
  - Generate OTP 6 digit, expiry 10 menit
  - Kirim via SMTP (gagal kirim tidak ditampilkan ke user)
  - Response selalu: `{ success: true, message: "Jika email terdaftar, kode OTP telah dikirim" }`

- `PUT /auth/reset-password`:
  - Input: `{ email, otp, new_password }`
  - Validasi: password >= 6 karakter, email terdaftar, OTP valid & belum expired & belum used
  - Update password hash, tandai OTP sebagai used
  - Generate JWT baru, set cookie (auto-login)
  - Response: `{ success: true, user: { id, email, name } }`

#### File Diubah: `backend/app/models/__init__.py`

Ekspor model `PasswordResetToken`.

#### File Diubah: `backend/.env`

Tambah konfigurasi SMTP:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
```

#### Migration Baru: `backend/migrations/versions/20260602_9a1b2c3d4e5f_add_password_reset_tokens_table.py`

Tabel `password_reset_tokens` dengan kolom: `id`, `user_id`, `otp_code`, `expires_at`, `used`, `created_at`.

### Frontend

#### File Baru: `frontend/app/pages/forgot-password.vue`

Halaman 2-step:

| Step | Konten |
|------|--------|
| **1. Email** | Form input email → submit → OTP dikirim |
| **2. Reset** | Form OTP (6 digit) + Password Baru + Konfirmasi → submit → auto-login |

- Layout mengikuti halaman `login.vue` (gradient background, card putih)
- Navigasi: link "Kembali ke Login" di footer
- SSR: false (diatur di nuxt.config.ts)

#### File Diubah: `frontend/app/stores/auth.ts`

Tambah method:
- `requestPasswordReset(email)` — POST ke `/auth/forgot-password`
- `resetPasswordWithOtp(email, otp, newPassword)` — PUT ke `/auth/reset-password`, simpan user state, set localStorage

#### File Diubah: `frontend/app/pages/login.vue`

Tambah link **"Lupa password?"** di bawah tombol login → `/forgot-password`.

#### File Diubah: `frontend/nuxt.config.ts`

Tambah `/forgot-password` ke route rules dengan `ssr: false`.

### Testing (E2E)

#### File Baru: `frontend/e2e/tests/forgot-password.spec.ts`

Test categories:

| Kategori | Test |
|----------|------|
| **UI Navigation** | Login page punya link, klik navigasi ke forgot-password, back link, step awal email |
| **API Forgot Password** | Unknown email return success, known email return success |
| **API Reset Password** | Invalid OTP (400), short password (400), unknown email (400) |
| **Happy Path** | Request OTP lalu login still works (OTP not consumed) |

**Status Playwright:** Sudah terinstall (v1.59.1, chromium). Test siap dijalankan.

## Security

- OTP **6 digit**, expiry **10 menit**
- **Single-use**: OTP tidak bisa dipakai 2x
- **Tidak reveal** apakah email terdaftar (response selalu sama)
- **Invalidasi OTP lama** saat request baru (mencegah multiple valid OTP)
- **Auto-login** hanya setelah OTP + password baru valid

## Cara Menjalankan

```bash
# 1. Start database
docker-compose up -d mysql

# 2. Migration
cd backend
.venv\Scripts\activate
python manage.py migrate

# 3. Isi SMTP config di backend/.env (contoh Gmail App Password)
#    SMTP_USER=your-email@gmail.com
#    SMTP_PASSWORD=xxxx xxxx xxxx xxxx

# 4. Jalankan backend
uvicorn app.main:app --reload

# 5. Jalankan frontend + test
cd frontend
npm run dev                           # terminal 2
npx playwright test e2e/tests/forgot-password.spec.ts  # terminal 3
```
