# Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `SQLALCHEMY_DATABASE_URL not set` | `.env` tidak ada atau salah | Buat/sesuaikan file `.env` di `backend/` |
| `Connection refused` ke MySQL | MySQL tidak berjalan | `docker-compose up -d` atau jalankan MySQL manual |
| CORS error dari frontend | `ALLOWED_ORIGINS` tidak sesuai | Tambahkan origin frontend di `.env` backend |
| `Module not found` di backend | Virtual env tidak aktif | Aktifkan `.venv\Scripts\activate` |
| Playwright `ERR_CONNECTION_REFUSED` | Server tidak berjalan | Pastikan backend (8000) dan frontend (3000) running |
| Migration error | Model baru belum di-import | Tambahkan import di `app/models/__init__.py` |
| XGBoost model not loaded | File `.pkl` tidak ada | Pastikan `backend/xgboost/xgboost_ranker_v7.pkl` exists |
| Cookie tidak terkirim | CORS credentials issue | Pastikan `allow_credentials=True` di backend CORS config |
| `alembic.util.exc.CommandError` | Migration history tidak sinkron | `python manage.py migrate:reset` lalu `python manage.py migrate` |
| Port sudah dipakai | Proses lama masih jalan | Kill proses di port tersebut atau ganti port |
