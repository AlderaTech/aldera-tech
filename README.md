# Solvo Tech

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

| Role   | Email                | Password   |
|--------|----------------------|------------|
| Admin  | admin@solvo.tech     | password   |
| Client | gading@gmail.com     | password   |
| Client | siti@example.com     | password   |

Override the admin credentials by setting `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env` before running `db:seed`.

## Available Scripts

```
npm run dev         # start dev server
npm run build       # production build (Turbopack)
npm run start       # run production build
npm run lint        # run ESLint
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
proxy.ts                  # route protection (Next.js 16 middleware replacement)
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

## SMTP Setup

For invoice emails and reminders, configure SMTP in `.env`:

```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASSWORD="your-app-password"  # Gmail App Password
SMTP_FROM="Solvo Tech <no-reply@solvo.tech>"
```

If SMTP env vars are missing, emails are logged to console (jsonTransport mode), handy for development.

## Cron Setup (Invoice Reminders)

On your VPS, set up a daily cron to hit the reminder endpoint:

```bash
crontab -e
# Add:
0 9 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/invoice-reminder
```

The endpoint will:
- Mark SENT invoices past their due date as OVERDUE
- Send reminder emails for invoices due within 3 days or already overdue
- Skip invoices that had a reminder sent in the last 72 hours

## Deployment (VPS)

1. **Server prep**, Node.js 20+ installed, PostgreSQL accessible
2. **Clone + install**:
   ```bash
   git clone <repo>
   cd solvo-tech
   npm ci
   ```
3. **Environment**, create `.env.production` with your production values
4. **Database**, run `npx prisma db push` once
5. **Build**, `npm run build`
6. **Process manager**, use PM2 or systemd:
   ```bash
   npm install -g pm2
   pm2 start npm --name "solvo-tech" -- start
   pm2 save
   ```
7. **Reverse proxy**, nginx pointing to `localhost:3000`, with HTTPS via Let's Encrypt
8. **Cron**, set up the invoice reminder cron as above

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Proxy-based route protection)
- **UI**: Tailwind CSS 4 + custom shadcn-style primitives + Radix UI + Lucide icons
- **Animation**: Framer Motion
- **Auth**: NextAuth v5 (JWT + credentials + bcryptjs)
- **Database**: PostgreSQL + Prisma 7 (with `@prisma/adapter-pg` driver)
- **Editor**: TipTap with StarterKit + Image + Link + Placeholder
- **PDF**: @react-pdf/renderer
- **Email**: nodemailer
- **Validation**: Zod
- **Forms**: react-hook-form (where needed) + native FormData + Server Actions
- **Dark mode**: next-themes with dark/light/system
- **Responsive**: Custom breakpoints xxs (320px) through xxxxl (2560px)

## Notes on Next.js 16 Breaking Changes

This project uses Next.js 16, which introduces several breaking changes from v15:
1. **`middleware.ts` → `proxy.ts`**: our route protection lives in `/proxy.ts`
2. **Async Request APIs**: `params` and `searchParams` are awaited
3. **Turbopack default**: no more `--turbopack` flag
4. **No `next lint`**: use `eslint` directly
