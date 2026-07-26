# Deployment — Penjahit Yan

## Arsitektur Produksi

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions                                             │
│  push main → build Docker image → push ke GHCR             │
│  → SCP docker-compose.prod.yml ke VPS → pull → restart     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                  ghcr.io/baghaztra/backend:latest
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  VPS (Ubuntu)                                               │
│                                                             │
│  ~/penjahit-yan/                                            │
│  ├── docker-compose.prod.yml   ← dikirim via SCP            │
│  ├── .env                      ← credentials, dibuat manual │
│  ├── entrypoint.sh             ← custom entrypoint          │
│  └── uploads/                  ← bind mount ke container    │
│      ├── portfolio/                                         │
│      └── sketches/                                          │
│                                                             │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────────┐     │
│  │   MySQL 8.0 │  │  phpMyAdmin   │  │   Backend     │     │
│  │  127.0.0.1  │  │  127.0.0.1    │  │   :8000       │     │
│  │   :3306     │  │  :8080        │  │               │     │
│  └─────────────┘  └───────────────┘  └───────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Vercel (Frontend)                                          │
│  https://yan.bgztra.my.id                                  │
│  NUXT_PUBLIC_API_BASE = https://backendyan.bgztra.my.id    │
└─────────────────────────────────────────────────────────────┘
```

---

## A. Setup VPS (sekali saja)

### 1. Install Docker

```bash
ssh baghaztra@VPS_IP
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo usermod -aG docker baghaztra
```

Logout dan login ulang supaya group生效.

### 2. Login ke GHCR

```bash
# Generate Personal Access Token di GitHub:
# Settings → Developer settings → Personal access tokens → Fine-grained tokens
# Permissions: Packages → Read

echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u baghaztra --password-stdin
```

### 3. Buat `.env`

```bash
mkdir -p ~/penjahit-yan && cd ~/penjahit-yan
nano .env
```

```env
APP_NAME="Backend Rumah Jahit App"
PUBLIC_BASE_URL=https://backendyan.bgztra.my.id
ALLOWED_ORIGINS=https://yan.bgztra.my.id,http://localhost:3000

JWT_SECRET=<generate-dengan-openssl-rand-hex-32>
JWT_EXPIRE_MINUTES=1440

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rumahjahityan@gmail.com
SMTP_PASSWORD=<gmail-app-password>
SMTP_FROM_EMAIL=rumahjahityan@gmail.com

MYSQL_ROOT_PASSWORD=<password-kuat>
MYSQL_DATABASE=tugas_akhir_refactor
MYSQL_USER=root
MYSQL_PASSWORD=<password-kuat>
```

Generate JWT_SECRET:
```bash
openssl rand -hex 32
```

> **Penting:** `.env` TIDAK di-push ke git (sudah di `.gitignore`). Simpan backup secara terpisah.

---

## B. Setup Nginx + SSL

### 1. Install Nginx & Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Config Nginx

```bash
sudo nano /etc/nginx/sites-available/backendyan
```

```nginx
server {
    server_name backendyan.bgztra.my.id;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    location /uploads/ {
        alias /home/baghaztra/penjahit-yan/uploads/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/backendyan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Setup SSL

```bash
sudo certbot --nginx -d backendyan.bgztra.my.id
```

### 4. Verifikasi

```bash
curl https://backendyan.bgztra.my.id/
```

---

## C. Setup DNS

| Type | Name | Value |
|------|------|-------|
| A | `backendyan` | `IP_VPS` |
| CNAME | `yan` | `cname.vercel-dns.com` |

---

## D. Setup GitHub Secrets

Di repo GitHub → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | IP VPS |
| `VPS_USER` | `baghaztra` |
| `VPS_SSH_KEY` | Private key SSH |

Generate SSH key jika belum ada:
```bash
ssh-keygen -t ed25519 -C "deploy"
cat ~/.ssh/id_ed25519.pub  # tambahkan ke VPS: ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519      # paste ke GitHub Secret VPS_SSH_KEY
```

---

## E. Setup Frontend di Vercel

1. Buka [vercel.com](https://vercel.com)
2. **New Project** → Import dari GitHub (`Baghaztra/tugas_akhir`)
3. **Root Directory**: `frontend`
4. **Environment Variables** (menu **Project**, bukan Shared):
   - `NUXT_PUBLIC_API_BASE` = `https://backendyan.bgztra.my.id`
5. **Deploy**
6. Custom domain: Settings → Domains → tambah `yan.bgztra.my.id`

---

## F. Update CORS

Setelah domain Vercel diketahui:

```bash
ssh baghaztra@VPS_IP
nano ~/penjahit-yan/.env
```

```env
ALLOWED_ORIGINS=https://yan.bgztra.my.id,https://your-vercel-domain.vercel.app,http://localhost:3000
```

```bash
cd ~/penjahit-yan
docker compose -f docker-compose.prod.yml restart backend
```

---

## G. Import Database

### Via phpMyAdmin (SSH Tunnel)

phpMyAdmin hanya bisa diakses dari localhost. Pakai SSH tunnel:

```powershell
# Di komputer lokal (PowerShell)
ssh -L 8081:127.0.0.1:8080 -i C:\path\to\ssh_key baghaztra@VPS_IP
```

Buka browser: `http://localhost:8081`

- Server: `mysql`
- Username: `root`
- Password: (lihat `MYSQL_ROOT_PASSWORD` di `.env` VPS)
- Database: `tugas_akhir_refactor`
- Import file `.sql` via tab **Import**

### Via Command Line

```bash
# Upload dump ke VPS
scp ta_export.sql baghaztra@VPS_IP:~/penjahit-yan/

# SSH ke VPS, import
ssh baghaztra@VPS_IP
docker exec -i mysql_db mysql -uroot -p<MYSQL_ROOT_PASSWORD> tugas_akhir_refactor < ~/penjahit-yan/ta_export.sql
```

---

## H. Auto-Deploy Flow

```
1. Push ke main (backend/ berubah)
2. GitHub Actions:
   a. Checkout code
   b. Login ke GHCR (pakai GITHUB_TOKEN)
   c. Build Docker image dari backend/Dockerfile
   d. Push ke ghcr.io/baghaztra/backend:latest
   e. SCP docker-compose.prod.yml ke VPS ~/penjahit-yan/
   f. SSH: docker compose pull backend
   g. SSH: docker compose up -d --no-deps backend
   h. Health check: curl http://localhost:8000/
3. Selesai (~1-2 menit)
```

### Rollback

```bash
# Di VPS
docker images ghcr.io/baghaztra/backend
# Edit docker-compose.prod.yml, ganti :latest dengan :<commit-sha>
docker compose -f docker-compose.prod.yml up -d --no-deps backend
```

---

## I. Perintah Berguna (VPS)

```bash
# Log backend
docker compose -f docker-compose.prod.yml logs -f backend

# Restart backend
docker compose -f docker-compose.prod.yml restart backend

# Restart semua
docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d

# Pull image terbaru manual
docker compose -f docker-compose.prod.yml pull backend && docker compose -f docker-compose.prod.yml up -d --no-deps backend

# Backup uploads
cp -r ~/penjahit-yan/uploads ~/penjahit-yan/uploads-backup-$(date +%Y%m%d)

# Backup database
docker exec mysql_db mysqldump -uroot -p<MYSQL_ROOT_PASSWORD> tugas_akhir_refactor > ~/penjahit-yan/backup-$(date +%Y%m%d).sql

# Masuk container
docker compose -f docker-compose.prod.yml exec backend bash

# Masuk MySQL CLI
docker exec -it mysql_db mysql -uroot -p<MYSQL_ROOT_PASSWORD> tugas_akhir_refactor

# Bersihkan image lama
docker image prune -f
```

---

## J. Keamanan

### Yang Sudah Diterapkan

| Item | Status |
|------|--------|
| MySQL port | Bind ke `127.0.0.1` saja (tidak ter-expose ke internet) |
| phpMyAdmin port | Bind ke `127.0.0.1` saja (akses via SSH tunnel) |
| SSL/HTTPS | Aktif via Let's Encrypt (auto-renew) |
| CORS | Hanya allow domain tertentu |
| `.env` di-git | Di-`.gitignore`, tidak ada credentials di repo |
| Docker compose | Credentials pakai env vars `${MYSQL_ROOT_PASSWORD}`, bukan hardcoded |

### Yang Perlu Diperhatikan

1. **Password MySQL** — gunakan password kuat, bukan `root`
2. **JWT_SECRET** — generate dengan `openssl rand -hex 32`, simpan aman
3. **SSH Key** — jangan share, permission `600`
4. **Backup** — lakukan backup database dan uploads secara berkala
5. **Update** — sesekali jalankan `sudo apt update && sudo apt upgrade` di VPS

---

## K. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Backend restart terus | `docker compose -f docker-compose.prod.yml logs backend` — biasanya MySQL belum ready atau password salah |
| CORS error | Cek `ALLOWED_ORIGINS` di `~/penjahit-yan/.env` |
| SSL error | `sudo certbot renew --dry-run` |
| Migration gagal | `docker compose -f docker-compose.prod.yml exec backend alembic upgrade head` |
| phpMyAdmin tidak bisa akses | Pastikan SSH tunnel aktif dan port `8081` |
| Image pull gagal | `docker login ghcr.io` ulang di VPS |
| Deploy tidak trigger | Cek: hanya perubahan di `backend/` yang trigger |
| Upload 403 Forbidden | `sudo chmod -R 755 /home/baghaztra/penjahit-yan/uploads/` |
| Mixed content HTTPS | Pastikan `NUXT_PUBLIC_API_BASE` di Vercel pakai `https://` |
| Trailing slash 307 | Tambah `/` di akhir endpoint frontend (e.g. `${apiBase}/workers/`) |

---

## L. Jalankan Docker Lokal di WSL

### Prerequisites

- WSL 2 dengan Ubuntu
- Docker Desktop di Windows (aktifkan WSL 2 integration) atau Docker install di WSL

### 1. Masuk ke WSL & project

```powershell
wsl
cd /mnt/c/Kuliah/TA/project
```

### 2. Buat `.env` backend

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```env
APP_NAME="Backend Rumah Jahit App"
SQLALCHEMY_DATABASE_URL="mysql+mysqlconnector://user:password@mysql:3306/tugas_akhir_refactor"
PUBLIC_BASE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
JWT_SECRET=local-dev-secret-change-in-production
JWT_EXPIRE_MINUTES=1440
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rumahjahityan@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=rumahjahityan@gmail.com
```

### 3. Build & start

```bash
docker compose up -d
```

Cek:
```bash
docker compose ps
curl http://localhost:8000/
```

phpMyAdmin: `http://localhost:8080`

### 4. Jalankan frontend

```bash
# Terminal lain
cd /mnt/c/Kuliah/TA/project/frontend
npm install
npm run dev
```

### 5. Perintah lokal

```bash
docker compose logs -f backend               # log live
docker compose down                          # stop
docker compose down -v                       # stop + hapus volume
docker compose up -d --build backend         # rebuild setelah ubah code
docker compose exec backend bash             # masuk container
docker compose exec mysql mysql -uroot -proot tugas_akhir_refactor  # MySQL CLI
```

### 6. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `docker: command not found` | Install Docker di WSL atau aktifkan Docker Desktop WSL integration |
| Port 3306 sudah dipakai | `sudo systemctl stop mysql` (WSL) atau `net stop mysql80` (Windows) |
| Port 8000 sudah dipakai | `sudo lsof -i :8000` lalu kill process |
| Container restart terus | `docker compose logs backend` — biasanya MySQL belum ready |
