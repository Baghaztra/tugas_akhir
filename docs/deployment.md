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
│  └── .env                      ← dibuat manual              │
│                                                             │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────────┐     │
│  │   MySQL 8.0 │  │  phpMyAdmin   │  │   Backend     │     │
│  │   :3306     │  │  :8080 (local)│  │   :8000       │     │
│  └─────────────┘  └───────────────┘  └───────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Vercel (Frontend)                                          │
│  https://yan.bgztra.my.id                                  │
│  NUXT_PUBLIC_API_BASE = https://backend-yan.bgztra.my.id   │
└─────────────────────────────────────────────────────────────┘
```

---

## A. Setup VPS (sekali saja)

### 1. Install Docker

```bash
ssh root@VPS_IP
curl -fsSL https://get.docker.com | sh
systemctl enable docker
```

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
SQLALCHEMY_DATABASE_URL="mysql+mysqlconnector://user:password@mysql:3306/tugas_akhir_refactor"
PUBLIC_BASE_URL=https://backend-yan.bgztra.my.id
ALLOWED_ORIGINS=https://yan.bgztra.my.id,http://localhost:3000

JWT_SECRET=<generate-dengan-openssl-rand-hex-32>
JWT_EXPIRE_MINUTES=1440

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rumahjahityan@gmail.com
SMTP_PASSWORD=<gmail-app-password>
SMTP_FROM_EMAIL=rumahjahityan@gmail.com
```

Generate JWT_SECRET:
```bash
openssl rand -hex 32
```

---

## B. Setup Nginx + SSL

### 1. Install Nginx & Certbot

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### 2. Config Nginx

```bash
nano /etc/nginx/sites-available/backend-yan
```

```nginx
server {
    server_name backend-yan.bgztra.my.id;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/backend-yan /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 3. Setup SSL

```bash
certbot --nginx -d backend-yan.bgztra.my.id
```

### 4. Verifikasi

```bash
curl https://backend-yan.bgztra.my.id/
```

---

## C. Setup DNS

| Type | Name | Value |
|------|------|-------|
| A | `backend-yan` | `IP_VPS` |
| CNAME | `yan` | `cname.vercel-dns.com` |

---

## D. Setup GitHub Secrets

Di repo GitHub → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | IP VPS |
| `VPS_USER` | `root` |
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
4. **Environment Variables**:
   - `NUXT_PUBLIC_API_BASE` = `https://backend-yan.bgztra.my.id`
5. **Deploy**
6. Custom domain: Settings → Domains → tambah `yan.bgztra.my.id`

---

## F. Update CORS

Setelah domain Vercel diketahui:

```bash
ssh root@VPS_IP
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

## G. Import Database via phpMyAdmin

phpMyAdmin hanya bisa diakses dari localhost. Pakai SSH tunnel:

```bash
# Di komputer lokal
ssh -L 8080:localhost:8080 root@VPS_IP
```

Buka browser: `http://localhost:8080`

- Login: `root` / `root`
- Database: `tugas_akhir_refactor`
- Import file `.sql` via tab **Import**

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
docker cp backend:/app/uploads ./backup-uploads/

# Masuk container
docker compose -f docker-compose.prod.yml exec backend bash

# Bersihkan image lama
docker image prune -f
```

---

## J. Jalankan Docker Lokal di WSL

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

---

## Troubleshooting Produksi

| Masalah | Solusi |
|---------|--------|
| Backend tidak start | `docker compose -f docker-compose.prod.yml logs backend` |
| CORS error | Cek `ALLOWED_ORIGINS` di `~/penjahit-yan/.env` |
| SSL error | `certbot renew --dry-run` |
| Migration gagal | `docker compose -f docker-compose.prod.yml exec backend alembic upgrade head` |
| phpMyAdmin tidak bisa akses | Pastikan SSH tunnel aktif |
| Image pull gagal | `docker login ghcr.io` ulang di VPS |
| Deploy tidak trigger | Cek: hanya perubahan di `backend/` yang trigger |
