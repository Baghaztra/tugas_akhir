# Deployment

## Build Frontend (Production)

```bash
cd frontend
npm run build
npm run preview  # Preview hasil build
```

## Backend Production

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Environment Variables Production

Pastikan mengatur:
- `JWT_SECRET` → random string yang kuat (bukan yang di .env development)
- `SQLALCHEMY_DATABASE_URL` → koneksi database production
- `ALLOWED_ORIGINS` → domain frontend production
- `PUBLIC_BASE_URL` → URL backend production
- `SMTP_*` → konfigurasi email production

## Docker Compose (Development only)

`docker-compose.yml` hanya untuk development (MySQL + phpMyAdmin). Untuk production, gunakan managed MySQL service atau containerize ulang dengan production config.
