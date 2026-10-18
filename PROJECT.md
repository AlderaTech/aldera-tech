# Master Project Specification: Aldera Tech Full-Stack Modernization & Architectural Expansion

## Architecture Overview

Aldera Tech is a high-performance digital product and software engineering consultancy platform built on Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma ORM, and Bun. The system is architected into four primary layers:

1. **Public Experience Layer (`app/(public)/*`)**: High-converting, SEO-optimized public landing, services, pricing/calculator, portfolio case studies, and tech blog.
2. **Authentication Layer (`app/(auth)/*`)**: Floating centered split-card authentication interface guarded by NextAuth and Cloudflare Turnstile anti-spam protection.
3. **Client Area (`app/dashboard/*`)**: Streamlined, breadcrumb-free client workspace for project milestones, task tracking, timesheet review, invoice payments, and testimonial submissions.
4. **Administration & CMS (`app/admin/*`)**: Unified operational hub for project management, team workload distribution, pricing SSOT, portfolio/testimonial CMS, and invoice management.
5. **System Core & API Layer (`lib/*`, `app/api/*`)**: Clean RSC boundaries, pure utility functions, Zod schema validations, rate limiting, secure webhook handlers, and timing-safe cron authentication.

### Multi-Stack Staging Architecture & Dual-Bot Topology (VPS `45.66.153.149`)

Aldera Tech implements an isolated multi-stack environment operating side-by-side on VPS `45.66.153.149`:

- **Production Stack (`main`)**:
  - Web Application: `https://aldera.tech` (Proxy to container `aldera-tech:3000`, directory `/opt/docker-stack/applications/aldera-tech`)
  - Database: `aldera_tech` / `solvo_tech` (PostgreSQL)
  - Telegram Relay Bot: `@aldera_tech_bot` (Token: `[REDACTED_TELEGRAM_BOT_TOKEN]`, directory `/opt/docker-stack/applications/aldera-router`, DB `aldera_router`)
  - CI/CD Deployment: Push to `main` builds `:latest` tag and triggers production deploy.

- **Staging Stack (`staging`)**:
  - Web Application: `https://staging.aldera.tech` (Proxy to container `aldera-tech-staging:3000`, directory `/opt/docker-stack/applications/aldera-tech-staging`)
  - Database: `aldera_tech_staging` (PostgreSQL, isolated)
  - Telegram Relay Bot: `@aldera_tech_staging_bot` (Token: `[REDACTED_TELEGRAM_BOT_TOKEN]`, directory `/opt/docker-stack/applications/aldera-router-staging`, DB `aldera_router_staging`)
  - CI/CD Deployment: Push to `staging` builds `:staging` tag and triggers staging deploy.

- **Git Branching Hierarchy**:
  - `main` $\leftarrow$ `staging` $\leftarrow$ `feat/*`, `fix/*`, `refactor/*`, `docs/*`.
  - All development branches MUST branch from `origin/staging` (`git checkout -b feat/... origin/staging`).
  - Pull Requests MUST target `staging` with **Squash and Merge**. Direct commits/PRs to `main` for regular tasks are strictly prohibited. Promotion to `main` happens via verified Release PR.

---

## Feature Inventory

| #   | Feature Key               | Description                                                                                | Milestone | Source                     |
| --- | ------------------------- | ------------------------------------------------------------------------------------------ | --------- | -------------------------- |
| 1   | `R1-NEXT16-UPGRADE`       | Upgrade `next` to 16.4.0, `react`/`react-dom` to 19.3.0, update core packages              | M1        | ORIGINAL_REQUEST §R1       |
| 2   | `R1-BUN-LOCKFILE`         | Standardize on Bun (`bun.lock`), delete `package-lock.json`, purge `node-cron`             | M1        | ORIGINAL_REQUEST §R1       |
| 3   | `R1-DOCKER-CI`            | Convert `docker/Dockerfile` and `.github/workflows/build-and-deploy.yml` to Bun            | M1        | ORIGINAL_REQUEST §R1       |
| 4   | `R5.1-MIDDLEWARE-STD`     | Replace `proxy.ts` with standard `middleware.ts` guarding admin, dashboard, API            | M1        | ORIGINAL_REQUEST §R5.1     |
| 5   | `R5.5-CRON-SECURITY`      | Timing-safe `CRON_SECRET` validation (`lib/cron.ts`) on all `app/api/cron/*` routes        | M1        | ORIGINAL_REQUEST §R5.5     |
| 6   | `R2-BRAND-PALETTE`        | Establish `#0F263A` (Deep Navy) and `#00B1E1` (Electric Cyan) in design tokens             | M2        | ORIGINAL_REQUEST §R2       |
| 7   | `R2-LANDING-OVERHAUL`     | Transform landing page (`referensi-landing-oage.jpeg` aesthetic, bold serif, cards)        | M2        | ORIGINAL_REQUEST §R2       |
| 8   | `R2-AUTH-REDESIGN`        | Floating split-card auth (`referensi-auth-page.jpeg`, cloud engineering visual)            | M2        | ORIGINAL_REQUEST §R2       |
| 9   | `R2-DASHBOARD-CLEAN`      | Eliminate breadcrumbs across all `/dashboard/*` and `/admin/*` pages                       | M2        | ORIGINAL_REQUEST §R2       |
| 10  | `R2-NO-EMOJI-NO-AI`       | Purge all emojis (replace with Lucide) and eliminate generic AI robot gimmicks             | M2        | ORIGINAL_REQUEST §R2       |
| 11  | `R2-ASSET-MIGRATION`      | Purge `public/generated/solvo-tech/`, generate optimized WebP in `public/images/`          | M2        | ORIGINAL_REQUEST §R2, R5.4 |
| 12  | `R2-DESIGN-DOCS`          | Sync design system guidelines into `ai-agent-docs/brand-context.md`                        | M2        | ORIGINAL_REQUEST §R2       |
| 13  | `R6.1-PRICING-SSOT`       | Delete `pricing-settings-tab.tsx`; centralize pricing to `/admin/calculator`               | M3        | ORIGINAL_REQUEST §R6.1     |
| 14  | `R6.2-USERS-TEAM-MERGE`   | Merge `/admin/team` workload cards into `/admin/users` tabs; delete `/admin/team`          | M3        | ORIGINAL_REQUEST §R6.2     |
| 15  | `R6.3-STOPWATCH-REMOVAL`  | Delete `timer-bar.tsx` & `use-time-tracker.ts`; preserve pure manual timesheet logging     | M3        | ORIGINAL_REQUEST §R6.3     |
| 16  | `R6.4-PUBLIC-CALCULATOR`  | Move calculator wizard to public `/pricing` (or `/calculator`), remove from sidebar        | M3        | ORIGINAL_REQUEST §R6.4     |
| 17  | `R7.1-PAYMENT-GATEWAY`    | Payment gateway sandbox (Midtrans/Xendit), webhook & invoice proof upload                  | M4        | ORIGINAL_REQUEST §R7.1     |
| 18  | `R7.2-ADMIN-CMS`          | Admin CRUD CMS for Portfolio (`/admin/portfolio`) and Testimonials (`/admin/testimonials`) | M4        | ORIGINAL_REQUEST §R7.2     |
| 19  | `R7.3-TESTIMONIAL-PROMPT` | Automated rating & review prompt on `/dashboard/projects/[id]` upon `COMPLETED`            | M4        | ORIGINAL_REQUEST §R7.3     |
| 20  | `R7.4-ANTI-SPAM-WA`       | Rate-limiting (`lib/rate-limit.ts`), Turnstile, and WhatsApp notifications                 | M4        | ORIGINAL_REQUEST §R7.4     |
| 21  | `R3-SEO-OVERHAUL`         | Dynamic OG image (`opengraph-image.tsx`), sitemap, robots, 5 JSON-LD schemas               | M5        | ORIGINAL_REQUEST §R3       |
| 22  | `R4-PROD-SEEDING`         | Revamp `prisma/seed.ts` with tech articles, case studies, valid WebP assets                | M5        | ORIGINAL_REQUEST §R4       |
| 23  | `R5.3-BLOG-VIEW-DEDUP`    | Cookie/IP server-side rate-limited blog view counter deduplication                         | M5        | ORIGINAL_REQUEST §R5.3     |
| 24  | `R7.5-UNIT-TESTING`       | Pure calculation helpers & `bun test` suites for calculator, invoice, permissions          | M6        | ORIGINAL_REQUEST §R7.5     |
| 25  | `AC-FINAL-ACCEPTANCE`     | Full typecheck, linter, Prettier format check, test suite execution, Git audit             | M6        | ORIGINAL_REQUEST §AC       |

---

## Milestones Summary

| #      | Name                                          | Scope & Focus                                                                                                                  | Dependencies | Status |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------ | ------ |
| **M1** | Core Modernization & Infrastructure           | Next.js 16.4.0, React 19.3.0, Bun lockfile, Dockerfile, CI/CD, `middleware.ts`, `lib/cron.ts`                                  | None         | DONE   |
| **M2** | Brand System, Visual Redesign & Assets        | Brand palette (`#0F263A`, `#00B1E1`), Landing overhaul, Split-card auth, Breadcrumb removal, No-Emoji/AI purge, WebP migration | M1           | DONE   |
| **M3** | Architectural Streamlining & Removals         | Pricing SSOT, Admin Users & Team merge, Stopwatch removal, Public calculator relocation                                        | M1           | DONE   |
| **M4** | High-Value Features & Security                | Payment gateway webhook, Receipt upload, Portfolio & Testimonials CMS, Review prompt, Anti-Spam/Turnstile                      | M1, M3       | DONE   |
| **M5** | SEO Overhaul, Seeding & Counter Deduplication | Dynamic OG image, JSON-LD schemas, sitemap/robots, Blog view dedup, Production `prisma/seed.ts`                                | M1, M2       | DONE   |
| **M6** | Automated Testing & Final Verification Gate   | Pure utility extraction, `bun test` suites, typecheck, lint, format, git clean status                                          | M1–M5        | DONE   |

---

## Interface Contracts

### 1. Cron Security Interface (`lib/cron.ts`)

```ts
export function verifyCronSecret(request: Request): {
  authorized: boolean;
  error?: string;
};
```

- Compares `Authorization: Bearer <token>` using `crypto.timingSafeEqual` against `process.env.CRON_SECRET`.
- Reused across all cron endpoints in `app/api/cron/*`.

### 2. Route Protection (`middleware.ts`)

- Guards `/admin/:path*`, `/dashboard/:path*`, `/api/admin/:path*`, and redirects authenticated users from `/login` / `/register`.
- Returns JSON 401/403 for `/api/admin/:path*` requests instead of HTML redirect.

### 3. Pure Calculation Utilities (`lib/calculator-utils.ts`, `lib/invoice-utils.ts`)

```ts
export function calculateOrderTotal(params: OrderCalculationParams): number;
export function calculateInvoiceTotals(
  items: Array<{ quantity: number; price: number }>,
  taxRate: number
): {
  subtotal: number;
  taxAmount: number;
  total: number;
};
```

### 4. Rate Limiting & Turnstile Contracts (`lib/rate-limit.ts`, `lib/turnstile.ts`)

```ts
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): { allowed: boolean; retryAfter?: number };
export async function verifyTurnstileToken(
  token: string
): Promise<{ success: boolean; error?: string }>;
```

---

## Code Layout & Boundaries

- `package.json`, `bun.lock`: Owned by Milestone 1.
- `docker/Dockerfile`, `docker/entrypoint.sh`, `.github/workflows/build-and-deploy.yml`: Owned by Milestone 1.
- `proxy.ts` (deleted) -> `middleware.ts`: Owned by Milestone 1.
- `app/globals.css`, `ai-agent-docs/brand-context.md`: Owned by Milestone 2.
- `app/(public)/_components/home/*`, `app/(public)/page.tsx`: Owned by Milestone 2.
- `app/(auth)/*`: Owned by Milestone 2.
- `components/dashboard/dashboard-header.tsx`: Owned by Milestone 2.
- `public/generated/solvo-tech/` (deleted), `public/images/*`: Owned by Milestone 2.
- `app/admin/settings/*`, `app/admin/calculator/*`: Owned by Milestone 3.
- `app/admin/team/` (deleted), `app/admin/users/*`: Owned by Milestone 3.
- `components/dashboard/time-tracking/*`: Owned by Milestone 3.
- `app/dashboard/calculator/*`, `app/(public)/pricing/*`: Owned by Milestone 3.
- `prisma/schema.prisma` (payment fields): Owned by Milestone 4.
- `app/api/webhooks/payment/route.ts`: Owned by Milestone 4.
- `app/admin/portfolio/*`, `app/admin/testimonials/*`: Owned by Milestone 4.
- `app/dashboard/projects/[id]/*` (testimonial prompt): Owned by Milestone 4.
- `lib/rate-limit.ts`, `lib/turnstile.ts`, `components/shared/turnstile.tsx`: Owned by Milestone 4.
- `app/opengraph-image.tsx`, `components/seo/json-ld.tsx`, `app/sitemap.ts`, `app/robots.ts`: Owned by Milestone 5.
- `prisma/seed.ts`: Owned by Milestone 5.
- `lib/calculator-utils.ts`, `lib/invoice-utils.ts`: Owned by Milestone 6.
- `lib/actions/calculator.test.ts`, `lib/actions/invoice.test.ts`, `lib/permissions.test.ts`: Owned by Milestone 6.
