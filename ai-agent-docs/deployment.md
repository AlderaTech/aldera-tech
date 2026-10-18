# Panduan Deployment & Arsitektur Docker: Aldera Tech

Dokumen ini merupakan panduan resmi arsitektur deployment produksi dan konfigurasi Docker untuk sistem **Aldera Tech**. Dokumen ini wajib dipelajari dan dipatuhi oleh seluruh pengembang serta AI Agent.

---

## 1. Arsitektur Deployment

Aldera Tech dibangun di atas arsitektur container modern dan efisien:

```
┌───────────────────────────────────────────────────────────────┐
│ Host VPS / Cloud Server (Ubuntu / Debian / Alpine)            │
│                                                               │
│   ┌─────────────────────┐                                     │
│   │ Reverse Proxy       │ (Nginx / Caddy / Traefik / SSL)     │
│   │ Ports 80, 443       │                                     │
│   └──────────┬──────────┘                                     │
│              │ Proxy http://127.0.0.1:3000                    │
│   ┌──────────▼────────────────────────────────────────────┐   │
│   │ Container: aldera_tech_app (oven/bun:1-alpine)         │   │
│   │                                                       │   │
│   │   ├── Next.js 16 Standalone (bun server.js :3000)     │   │
│   │   ├── Background crond (BusyBox Cron Runner)          │   │
│   │   └── Storage Mount: /app/public/uploads              │   │
│   └──────────┬────────────────────────────────────────────┘   │
│              │ Internal Network (aldera_tech_network)          │
│   ┌──────────▼────────────────────────────────────────────┐   │
│   │ Container: aldera_tech_db (PostgreSQL 16 Alpine)       │   │
│   │   └── Data Mount: /var/lib/postgresql/data            │   │
│   └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### Karakteristik Utama

1. **Next.js Standalone Build**: Ukuran image akhir sangat ramping (~180–220 MB) karena hanya menyertakan modul yang benar-benar dibutuhkan saat runtime.
2. **Built-in Automated Cron Runner**: Daemon cron Alpine (`crond`) berjalan otomatis di latar belakang container untuk memicu endpoint cron terjadwal tanpa mengharuskan instalasi crontab di host OS.
3. **Persistensi Data**:
   - Volume `uploads_data` dipetakan ke `/app/public/uploads` agar berkas lampiran, PDF invoice, dan avatar tidak hilang saat container diperbarui.
   - Volume `postgres_data` dipetakan ke `/var/lib/postgresql/data` untuk keutuhan data database.
4. **Keamanan & Privilege Dropping**: Container dijalankan menggunakan user unprivileged `nextjs` (UID 1001) via `su-exec`.

---

## 2. Struktur Folder `docker/`

Seluruh artefak yang berhubungan dengan containerisasi dan deployment dikelompokkan dalam direktori `docker/`:

```
docker/
├── Dockerfile            # Multi-stage production Dockerfile (deps -> builder -> runner)
├── docker-compose.yml    # Stack multi-container (App + PostgreSQL + Persistent Volumes)
├── entrypoint.sh         # Script inisialisasi: jalankan crond, migrasi, dan su-exec
├── crontab               # Definisi jadwal cron job internal
└── .dockerignore         # Filter berkas yang diabaikan saat docker build
```

### Rincian Fungsi Berkas

| Berkas                      | Fungsi Utama                                                                                                                                                                                 |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker/Dockerfile`         | Blueprint image container Next.js multi-stage build dengan Alpine Linux.                                                                                                                     |
| `docker/docker-compose.yml` | Konfigurasi orkestrasi service aplikasi dan database PostgreSQL lokal.                                                                                                                       |
| `docker/entrypoint.sh`      | Shell script yang dieksekusi saat container start. Mengatur permission, memulai `crond`, menjalankan `prisma db push` (opsional jika `AUTO_MIGRATE=true`), dan mengeksekusi `bun server.js`. |
| `docker/crontab`            | Berkas referensi jadwal berkala pemanggilan cron internal.                                                                                                                                   |
| `docker/.dockerignore`      | Mengabaikan `node_modules`, `.next`, `.git`, dan file sementara dari context build.                                                                                                          |

---

## 3. Cara Menjalankan Aplikasi

### Opsi A: Menggunakan Docker Compose (Sangat Direkomendasikan)

Docker Compose adalah cara tercepat untuk menjalankan Aldera Tech beserta database PostgreSQL dalam satu perintah.

1. **Siapkan Environment Variables**:
   Salin berkas `.env.example` menjadi `.env` di root direktori proyek:

   ```bash
   cp .env.example .env
   ```

   Pastikan variabel penting telah diisi:
   - `AUTH_SECRET` (generate dengan `openssl rand -base64 32`)
   - `CRON_SECRET` (string acak aman untuk mengamankan cron)
   - `WHATSAPP_API_KEY` (token Fonnte API untuk notifikasi WhatsApp)

2. **Jalankan Stack Container**:

   ```bash
   # Menggunakan npm/bun script
   bun run docker:up

   # Atau menggunakan perintah Docker langsung
   docker compose -f docker/docker-compose.yml up -d --build
   ```

3. **Periksa Status & Log**:

   ```bash
   docker compose -f docker/docker-compose.yml ps
   docker compose -f docker/docker-compose.yml logs -f app
   ```

4. **Hentikan Stack**:
   ```bash
   bun run docker:down
   # atau
   docker compose -f docker/docker-compose.yml down
   ```

---

### Opsi B: Build & Run Mandiri (Single Container)

Jika database PostgreSQL di-host secara terpisah (misal AWS RDS, Supabase, Neon, atau database VPS yang sudah ada):

1. **Build Docker Image**:

   ```bash
   # Menggunakan npm/bun script
   bun run docker:build

   # Atau menggunakan perintah Docker langsung
   docker build -f docker/Dockerfile -t aldera-tech:latest .
   ```

2. **Jalankan Container**:
   ```bash
   docker run -d \
     --name aldera-tech \
     --restart unless-stopped \
     -p 3000:3000 \
     --env-file .env \
     -v aldera_tech_uploads:/app/public/uploads \
     aldera-tech:latest
   ```

---

## 4. Mekanisme Otomatisasi Cron di Docker

Aldera Tech memiliki 3 cron endpoint aktif:

| Endpoint                      | Frekuensi                      | Deskripsi                                                   |
| :---------------------------- | :----------------------------- | :---------------------------------------------------------- |
| `/api/cron/invoice-reminder`  | Harian (09:00 WIB / 02:00 UTC) | Kirim pengingat invoice jatuh tempo via WhatsApp Fonnte.    |
| `/api/cron/issue-recurring`   | Harian (00:01 WIB / 17:01 UTC) | Terbitkan invoice rutin baru sesuai jadwal template.        |
| `/api/cron/publish-scheduled` | Per 15 Menit                   | Publikasikan artikel blog yang tanggal rilisnya telah tiba. |

### Bagaimana Cron Bekerja dalam Container:

1. Saat container menyala, `docker/entrypoint.sh` memeriksa apakah `ENABLE_CRON=true` dan `CRON_SECRET` tersedia.
2. Script membuat wrapper `/app/run-cron.sh` yang membawa variabel otorisasi `Bearer $CRON_SECRET`.
3. Daemon BusyBox `crond -b -l 8` dijalankan di background.
4. Setiap jadwal tiba, `curl` internal memicu rute `http://127.0.0.1:3000/api/cron/...`.
5. Jika Anda ingin menonaktifkan cron internal (misal ingin menggunakan cron eksternal atau cron-job.org), set environment variable `ENABLE_CRON=false`.

---

## 5. Konfigurasi Reverse Proxy Produksi

Di server produksi (VPS), jalankan reverse proxy di depan container Aldera Tech untuk menangani SSL Let's Encrypt dan kompresi:

### Contoh Nginx Configuration (`/etc/nginx/sites-available/aldera.conf`)

```nginx
server {
    listen 80;
    server_name aldera.tech www.aldera.tech;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aldera.tech www.aldera.tech;

    ssl_certificate /etc/letsencrypt/live/aldera.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aldera.tech/privkey.pem;

    client_max_body_size 25M; # Mendukung upload file/proposal hingga 20MB

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache untuk asset statis Next.js
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### Contoh Caddy Configuration (`Caddyfile`)

```caddy
aldera.tech {
    encode gzip zstd
    request_body {
        max_size 25MB
    }
    reverse_proxy 127.0.0.1:3000
}
```

---

## 6. Protokol & SOP Sinkronisasi Deployment (Wajib untuk AI Agent & Pengembang)

Setiap kali melakukan pengembangan atau perubahan fitur pada codebase, pengembang dan AI Agent **WAJIB** mengevaluasi dampaknya terhadap konfigurasi deployment:

### Aturan Sinkronisasi:

1. **Penambahan Fitur Cron Baru**:
   - Jika Anda menambahkan route baru di `app/api/cron/<nama-fitur>/route.ts`, Anda **WAJIB**:
     - Mendaftarkan jadwal baru di `docker/crontab`.
     - Memperbarui skrip pendaftaran cron di `docker/entrypoint.sh`.
     - Menambahkan rincian endpoint dan frekuensi cron pada tabel Bagian 4 dokumen ini (`ai-agent-docs/deployment.md`).
2. **Penambahan Dependensi Sistem / Binary OS**:
   - Jika ada library baru yang membutuhkan binary level OS (misalnya `ffmpeg`, `libvips`, `ghostscript`), **WAJIB** menambahkannya ke baris `RUN apk add --no-cache ...` di `docker/Dockerfile`.
3. **Perubahan Storage & Mount Volume**:
   - Jika ada folder baru yang memerlukan persistensi data (misal `/app/storage`), **WAJIB** menambahkannya ke instruksi `VOLUME` di `docker/Dockerfile` dan daftar `volumes` di `docker/docker-compose.yml`.
4. **Penambahan Environment Variables**:
   - Jika ada env var baru yang esensial untuk runtime, **WAJIB** mencatatnya pada [`.env.example`](../.env.example) dan menyertakannya di blok `environment` pada `docker/docker-compose.yml`.
5. **Perubahan Port Aplikasi**:
   - Jika port default diubah dari 3000, sesuaikan variabel `PORT`, `EXPOSE`, dan `HEALTHCHECK` pada `docker/Dockerfile` serta `docker/docker-compose.yml`.

---

## 7. Arsitektur Multi-Stack Staging & Produksi di VPS (`45.66.153.149`)

Aldera Tech menerapkan isolasi lingkungan multi-stack pada server VPS produksi tunggal (`45.66.153.149`) yang memisahkan lingkungan **Staging** dan **Production** secara menyeluruh (jaringan container, filesystem, volume, bot Telegram, dan database).

### 7.1 Ringkasan Lingkungan & Pemetaan Port/Direktori

| Komponen | Staging (`staging`) | Production (`main`) |
|---|---|---|
| **Web App Domain** | `https://staging.aldera.tech` | `https://aldera.tech` |
| **Web App Directory** | `/opt/docker-stack/applications/aldera-tech-staging` | `/opt/docker-stack/applications/aldera-tech` |
| **Web App Database** | `aldera_tech_staging` (PostgreSQL) | `solvo_tech` / `aldera_tech` (PostgreSQL) |
| **Web App Docker Tag** | `ghcr.io/alderatech/aldera-tech:staging` | `ghcr.io/alderatech/aldera-tech:latest` |
| **Telegram Bot** | `@aldera_tech_staging_bot` | `@aldera_tech_bot` |
| **Telegram Bot Token** | `[REDACTED_TELEGRAM_BOT_TOKEN]` | `[REDACTED_TELEGRAM_BOT_TOKEN]` |
| **Router Stack Directory** | `/opt/docker-stack/applications/aldera-router-staging` | `/opt/docker-stack/applications/aldera-router` |
| **Router Relay Database** | `aldera_router_staging` (PostgreSQL) | `aldera_router` (PostgreSQL) |
| **Router Docker Tag** | `:staging` (`router-telegram-bot:staging`, etc.) | `:latest` |
| **CI/CD Auto-Deploy** | Push ke branch `staging` | Push ke branch `main` |

### 7.2 Alur Otomatisasi CI/CD GitHub Actions
1. **Push ke `staging`**:
   - Memvalidasi linter dan typecheck Next.js.
   - Mem-build image dengan tag `:staging` dan tag `sha-<hash>` ke GitHub Container Registry (`ghcr.io`).
   - Memicu SSH deploy action ke VPS: masuk ke direktori `/opt/docker-stack/applications/aldera-tech-staging` dan menjalankan `./update.sh`.
2. **Push ke `main`**:
   - Mem-build image dengan tag `:latest` dan tag semver `v*`.
   - Memicu SSH deploy action ke VPS: masuk ke direktori `/opt/docker-stack/applications/aldera-tech` dan menjalankan `./update.sh`.

### 7.3 Topologi Jaringan & Isolasi
- Seluruh container staging router berjalan pada jaringan internal terisolasi `aldera_router_staging_internal`.
- Nginx Proxy Manager terhubung ke jaringan `nginx_proxy_manager_network` untuk merutekan request masuk ke container masing-masing:
  - `aldera.tech` $\rightarrow$ `http://aldera-tech:3000`
  - `staging.aldera.tech` $\rightarrow$ `http://aldera-tech-staging:3000`
- Service staging router proxy tidak menggunakan alias generik `billing-proxy` pada bridge proxy untuk mencegah tabrakan rute (collision).
- Database staging `aldera_tech_staging` dan `aldera_router_staging` terisolasi penuh dari database produksi untuk mencegah kontaminasi data transaksi finansial dan pengguna.

