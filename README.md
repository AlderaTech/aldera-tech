# Aldera Tech

Freelance tech partner platform, marketing website + project management + blog + invoice system built with Next.js 16, React 19, Tailwind CSS 4, Prisma 7, and NextAuth v5.

## Quick Start

```bash
# 1. Install dependencies (already done if running for first time after clone)
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env, minimum required:
#   - DATABASE_URL (PostgreSQL connection string)
#   - AUTH_SECRET (generate with: openssl rand -base64 32)

# 3. Set up database
npx prisma db push        # push schema to DB
npm run db:seed           # seed demo data

# 4. Run dev server
npm run dev
```

Open http://localhost:3000.

## Default Credentials (after seed)

| Role   | Email                   | Password |
| ------ | ----------------------- | -------- |
| Admin  | admin@aldera.tech       | password |
| Admin  | gading@gmail.com        | password |
| Client | gading-client@gmail.com | password |

Override the admin credentials by setting `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env` before running `db:seed`.

## Available Scripts

```
npm run dev         # start dev server
npm run build       # production build (Turbopack)
npm run start       # run production build
npm run lint        # run ESLint
npm run format      # run Prettier + Tailwind class sorter
npm run db:push     # sync schema to DB
npm run db:seed     # seed demo data
npm run db:studio   # open Prisma Studio
npm run db:migrate  # create a migration
```

## Architecture

```
app/
├── (public)/             # landing pages, home, about, services, portfolio,
│                         # pricing, testimonials, faq, blog, contact
├── (auth)/               # login, register
├── dashboard/            # client dashboard, overview, projects, invoices
├── admin/                # admin dashboard, overview, projects, blog,
│                         # users, invoices, files
├── api/
│   ├── auth/             # NextAuth handlers
│   ├── upload/           # file upload endpoint
│   ├── invoices/[id]/pdf # invoice PDF download
│   └── cron/             # invoice-reminder endpoint
├── sitemap.ts            # dynamic sitemap
├── robots.ts
├── manifest.ts
└── globals.css           # Tailwind 4 design tokens + custom breakpoints

components/
├── ui/                   # shadcn-style primitives
├── shared/               # navbar, footer, theme-toggle, etc.
├── dashboard/            # sidebar, dashboard-header, file-uploader
├── landing/              # landing page sections
├── editor/               # TipTap rich editor
└── seo/                  # JSON-LD schema helpers

lib/
├── actions/              # server actions (auth, blog, project, invoice, admin, contact)
├── pdf/                  # @react-pdf/renderer templates
├── validations/          # Zod schemas
├── auth.ts               # utilities (unused, main auth is at /auth.ts root)
├── prisma.ts             # Prisma singleton with pg adapter
├── email.ts              # nodemailer helper
├── services-data.ts      # services list (shared across landing pages)
├── status-meta.ts        # status → badge variant map
└── utils.ts              # cn, formatCurrency, formatDate, slugify, etc.

auth.ts                   # NextAuth v5 config (root-level)
middleware.ts             # route protection (standard Next.js middleware)
prisma.config.ts          # Prisma 7 config (datasource.url lives here)
```

## Features

### Public

- Home hero + animated sections, features, testimonials carousel, CTA
- About with story, values, tech stack
- Services grid (6 services)
- Pricing (3 tiers) with FAQ accordion
- Portfolio + detailed Case Studies
- Testimonials grid
- FAQ with 4 categories + FAQPage JSON-LD
- Blog listing with pagination + category filter + search
- Blog detail with TipTap HTML + Article JSON-LD + reading time
- Contact form (server-action-based)

### Admin Dashboard

- Overview with animated counters, activity feed, quick actions
- Project CRUD with milestones, activity log, files, invoices per project
- Blog CRUD with TipTap rich editor + image upload + publish toggle
- User management (invite with temp password, change role, toggle active)
- File manager with drag-drop upload
- Invoice creation with dynamic line items, auto-numbering, PDF generation, email send, reminder

### User (Client) Dashboard

- Overview with active projects, pending invoices, total paid
- Project list with progress bars
- Project detail: animated progress, timeline, activity feed, files (download), invoices (PDF)
- Invoice list with PDF download
- Read-only for client data (admin can view any)

## WhatsApp Setup (Fonnte API)

Semua notifikasi transaksi (pengiriman invoice, pengingat jatuh tempo, tautan penawaran proposal, dan tautan reset password) dikirimkan melalui WhatsApp menggunakan **Fonnte API**. Konfigurasikan pada `.env`:

```bash
WHATSAPP_API_URL="https://api.fonnte.com/send"
WHATSAPP_API_KEY="your-fonnte-token-here"
```

Jika `WHATSAPP_API_KEY` belum diisi (misalnya pada local development), pengiriman pesan disimulasikan secara otomatis dan dicetak ke konsol terminal tanpa menyebabkan kegagalan sistem.

## Cron Setup

Aplikasi memiliki 3 background cron endpoints:

- `/api/cron/invoice-reminder` (Harian 09:00 WIB — kirim pengingat jatuh tempo via WhatsApp)
- `/api/cron/issue-recurring` (Harian 00:01 WIB — penerbitan tagihan berkala)
- `/api/cron/publish-scheduled` (Per 15 Menit — penerbitan blog terjadwal)

> **Catatan Docker:** Jika menjalankan menggunakan Docker (`docker/Dockerfile` atau `docker-compose.yml`), daemon cron internal (BusyBox `crond`) sudah otomatis aktif di latar belakang container.

Jika menjalankan mandiri di host VPS tanpa Docker, pasang crontab:

```bash
crontab -e
# Tambahkan:
0 2 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/invoice-reminder
1 17 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/issue-recurring
*/15 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/publish-scheduled
```

## Deployment

Panduan deployment produksi lengkap, arsitektur container, dan konfigurasi Nginx/Caddy tersedia di [**`ai-agent-docs/deployment.md`**](ai-agent-docs/deployment.md).

### Menjalankan dengan Docker Compose (Direkomendasikan)

```bash
# 1. Siapkan environment file
cp .env.example .env

# 2. Jalankan stack aplikasi & PostgreSQL
bun run docker:up
# atau: docker compose -f docker/docker-compose.yml up -d

# 3. Pantau log
docker compose -f docker/docker-compose.yml logs -f app
```

### Menjalankan Mandiri (Bare Metal VPS)

1. **Server prep**: Node.js 20+, PostgreSQL 16
2. **Install**: `bun install` (atau `npm ci`)
3. **Database**: `bun run db:push`
4. **Build & Start**: `bun run build && bun run start` (atau kelola via PM2)
5. **Reverse proxy**: Nginx / Caddy pointing to `127.0.0.1:3000` dengan SSL Let's Encrypt

## Tech Stack

- **Framework**: Next.js (App Router, Standalone build)
- **UI**: Tailwind CSS + custom shadcn-style primitives + Radix UI + Lucide icons
- **Animation**: Framer Motion
- **Auth**: NextAuth v5 (Multi-Role Support: ADMIN, DEVELOPER, CLIENT)
- **Database**: PostgreSQL + Prisma (dengan `@prisma/adapter-pg` driver)
- **Editor**: TipTap with StarterKit + Image + Link + Placeholder
- **PDF**: @react-pdf/renderer
- **Messaging / Outbound**: WhatsApp API (Fonnte)
- **Container**: Docker Multi-stage + Docker Compose (di folder `docker/`)
- **Validation**: Zod
- **Forms**: react-hook-form (where needed) + native FormData + Server Actions
- **Dark mode**: next-themes with dark/light/system
- **Responsive**: Custom breakpoints xxs (320px) through xxxxl (2560px)

## Notes on Next.js 16 Breaking Changes

This project uses Next.js 16, which introduces several breaking changes from v15:

1. **`middleware.ts`**: standard route protection lives in `/middleware.ts` guarding `/admin/:path*`, `/dashboard/:path*`, and `/api/admin/:path*`
2. **Async Request APIs**: `params` and `searchParams` are awaited
3. **Turbopack default**: no more `--turbopack` flag
4. **No `next lint`**: use `eslint` directly
