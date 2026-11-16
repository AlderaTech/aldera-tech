# Verifikasi perbaikan menyeluruh

## Branch dan lingkungan

- Branch: `fix/project-wide-audit-findings`, dari `origin/staging`.
- Pengujian memakai database aplikasi/router sementara, akun sintetis, serta provider mock.
- Tidak ada pembayaran, pengiriman OTP/pesan, perubahan akun atau publikasi produksi.

## Hasil pemeriksaan

| Pemeriksaan                   | Hasil                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| Suite Bun terisolasi          | **1.014 pass, 0 fail**, 290 berkas; 75.979 assertion                                             |
| Guard/rollback staging Python | **5 pass**                                                                                       |
| Dependency audit              | Tidak ada advisori pada hasil `bun audit --json`                                                 |
| Frozen install Linux          | Berhasil di image `oven/bun:1.4.4-alpine`, tanpa postinstall dan tanpa file environment aplikasi |
| Lint                          | Lulus tanpa error/warning                                                                        |
| Next typegen dan TypeScript   | Lulus                                                                                            |
| Formatter                     | Seluruh repo diformat; pemeriksaan akhir wajib tetap lulus                                       |
| Visual browser fixture        | 32 kombinasi halaman/viewport terukur, tanpa overflow; desktop, 752 px tablet, dan 390 px HP     |

## Batas verifikasi browser

- FAQ, Testimoni, Login, Reset Password dan OTP memakai sans-serif, header jelas, serta aset yang tersedia.
- Dashboard memakai agregasi nyata. Seluruh delapan tab Relay pengguna dan lima tab Admin dapat dirender dari URL.
- Track tab pengguna mobile setinggi sekitar 44 px, bukan empat baris. Panel Admin memakai track horizontal yang sama.
- Proxy fixture tidak menyelesaikan hidrasi client secara andal. Karena itu auto-scroll tab aktif, klik interaktif, animasi counter, fokus keyboard menyeluruh dan seluruh dialog tidak dinyatakan lulus E2E browser. Kontrak serta handler terkait diuji melalui unit/render tests.
- Pembayaran sandbox, completion AI berbayar, delivery kanal pesan dan beban produksi belum diuji. Verifikasi tersebut wajib di VPS staging sebelum Release PR ke main.

## Perubahan utama

Lihat [kontrak perbaikan](project-wide-audit.md), [integritas backend](backend-integrity.md), [infrastruktur test](../TEST_INFRA.md), dan [deployment](deployment.md). Tidak ada route bisnis, tarif, model ID, nominal atau kredensial produksi yang diganti.

## Manifest file

Daftar berikut mencakup kode, test, dokumentasi, lockfile, migrasi dan penghapusan aset/komponen autentikasi yang tidak lagi digunakan.

| Status  | File                                                                       |
| ------- | -------------------------------------------------------------------------- |
| diubah  | `.github/workflows/build-and-deploy.yml`                                   |
| diubah  | `README.md`                                                                |
| diubah  | `TEST_INFRA.md`                                                            |
| diubah  | `TEST_READY.md`                                                            |
| diubah  | `ai-agent-docs/backend-integrity.md`                                       |
| diubah  | `ai-agent-docs/deployment.md`                                              |
| diubah  | `ai-agent-docs/project-wide-audit.md`                                      |
| diubah  | `ai-agent-docs/staging-verification.md`                                    |
| diubah  | `ai-agent-docs/ui-testing.md`                                              |
| dihapus | `app/(auth)/_components/auth-card.tsx`                                     |
| diubah  | `app/(auth)/_components/auth-shell.tsx`                                    |
| dihapus | `app/(auth)/_components/auth-side-panel.tsx`                               |
| dihapus | `app/(auth)/_constants/auth-panel-copy.ts`                                 |
| diubah  | `app/(auth)/reset-password/_components/reset-form-content.tsx`             |
| diubah  | `app/(public)/_components/home/portfolio-preview.tsx`                      |
| diubah  | `app/(public)/_components/public-shell.tsx`                                |
| diubah  | `app/(public)/blog/[slug]/_data/blog-detail.ts`                            |
| diubah  | `app/(public)/blog/_components/blog-hero.tsx`                              |
| diubah  | `app/(public)/blog/_data/blog-list.ts`                                     |
| diubah  | `app/(public)/blog/page.tsx`                                               |
| diubah  | `app/(public)/contact/_components/contact-hero.tsx`                        |
| diubah  | `app/(public)/faq/_components/faq-hero.tsx`                                |
| diubah  | `app/(public)/portfolio/_components/portfolio-image.tsx`                   |
| diubah  | `app/(public)/portfolio/_data/portfolio.ts`                                |
| diubah  | `app/(public)/testimonials/_components/testimonials-hero.tsx`              |
| diubah  | `app/admin/_components/overview/admin-overview-page.test.tsx`              |
| diubah  | `app/admin/_components/overview/overview-charts.tsx`                       |
| diubah  | `app/admin/_components/overview/overview-stat-grid.test.tsx`               |
| diubah  | `app/admin/_components/overview/top-clients-card.tsx`                      |
| diubah  | `app/admin/_test-utils/page-mocks.ts`                                      |
| diubah  | `app/admin/_utils/overview-config.ts`                                      |
| diubah  | `app/admin/ai-relay/_components/invoice-reconciliation.test.tsx`           |
| diubah  | `app/admin/ai-relay/_utils/ledger-check-label.ts`                          |
| diubah  | `app/admin/ai-relay/client-view.test.tsx`                                  |
| diubah  | `app/admin/ai-relay/client-view.tsx`                                       |
| diubah  | `app/admin/ai-relay/page.test.tsx`                                         |
| diubah  | `app/admin/ai-relay/page.tsx`                                              |
| diubah  | `app/admin/analytics/page.test.tsx`                                        |
| diubah  | `app/admin/analytics/page.tsx`                                             |
| diubah  | `app/admin/audit/page.tsx`                                                 |
| diubah  | `app/admin/blog/page.tsx`                                                  |
| diubah  | `app/admin/files/page.test.tsx`                                            |
| diubah  | `app/admin/files/page.tsx`                                                 |
| diubah  | `app/admin/invoices/page.tsx`                                              |
| diubah  | `app/admin/orders/page.test.tsx`                                           |
| diubah  | `app/admin/orders/page.tsx`                                                |
| diubah  | `app/admin/portfolio/_components/portfolio-table.tsx`                      |
| diubah  | `app/admin/projects/page.tsx`                                              |
| diubah  | `app/admin/proposals/page.tsx`                                             |
| diubah  | `app/admin/testimonials/_components/testimonial-table.tsx`                 |
| diubah  | `app/admin/timesheet/page.tsx`                                             |
| diubah  | `app/admin/users/_data/get-users-and-workload.ts`                          |
| diubah  | `app/admin/users/page.tsx`                                                 |
| diubah  | `app/api/cron/reconcile-integrations/route.ts`                             |
| diubah  | `app/dashboard/_components/onboarding-checklist.test.tsx`                  |
| diubah  | `app/dashboard/_components/overview-charts.module.css`                     |
| diubah  | `app/dashboard/_components/overview-charts.test.tsx`                       |
| diubah  | `app/dashboard/_components/overview-charts.tsx`                            |
| diubah  | `app/dashboard/ai-relay/_components/relay-header.test.tsx`                 |
| diubah  | `app/dashboard/ai-relay/_components/relay-tabs.tsx`                        |
| dihapus | `app/dashboard/ai-relay/_utils/relay-tab-scroll.test.ts`                   |
| dihapus | `app/dashboard/ai-relay/_utils/relay-tab-scroll.ts`                        |
| diubah  | `app/dashboard/invoices/_components/invoices-content.tsx`                  |
| diubah  | `app/dashboard/orders/_components/orders-content.tsx`                      |
| diubah  | `app/dashboard/page.test.tsx`                                              |
| diubah  | `app/dashboard/page.tsx`                                                   |
| diubah  | `app/dashboard/profile/_components/profile-content.tsx`                    |
| diubah  | `app/dashboard/profile/page.test.tsx`                                      |
| diubah  | `app/dashboard/projects/_components/projects-content.tsx`                  |
| diubah  | `auth.test.ts`                                                             |
| diubah  | `auth.ts`                                                                  |
| diubah  | `bun.lock`                                                                 |
| diubah  | `components/ai-relay/account-binding-card.tsx`                             |
| diubah  | `components/dashboard/command-palette.tsx`                                 |
| diubah  | `components/dashboard/workspace-segmented-tabs.module.css`                 |
| diubah  | `components/dashboard/workspace-segmented-tabs.test.tsx`                   |
| diubah  | `components/dashboard/workspace-segmented-tabs.tsx`                        |
| diubah  | `components/shared/data-pagination.test.tsx`                               |
| diubah  | `components/shared/data-pagination.tsx`                                    |
| diubah  | `components/shared/navbar.tsx`                                             |
| diubah  | `docker/Dockerfile`                                                        |
| diubah  | `docker/crontab`                                                           |
| diubah  | `docker/entrypoint.test.ts`                                                |
| diubah  | `docker/inspect-staging.test.ts`                                           |
| diubah  | `lib/actions/binding.test.ts`                                              |
| diubah  | `lib/actions/binding.ts`                                                   |
| diubah  | `lib/actions/payment-actions.test.ts`                                      |
| diubah  | `lib/actions/payment.ts`                                                   |
| diubah  | `lib/actions/proposal.ts`                                                  |
| diubah  | `lib/actions/time.ts`                                                      |
| diubah  | `lib/dashboard-nav.ts`                                                     |
| diubah  | `lib/prisma.ts`                                                            |
| diubah  | `lib/public-fallbacks.ts`                                                  |
| diubah  | `lib/public-settings.ts`                                                   |
| diubah  | `lib/router-db.ts`                                                         |
| diubah  | `lib/safe-db.ts`                                                           |
| diubah  | `lib/test-prisma.ts`                                                       |
| diubah  | `lib/validations/invoice.ts`                                               |
| diubah  | `lib/validations/proposal.ts`                                              |
| diubah  | `lib/validations/validations.test.ts`                                      |
| diubah  | `package.json`                                                             |
| diubah  | `prisma/schema.prisma`                                                     |
| dihapus | `public/images/auth/auth-engineering-backdrop.webp`                        |
| diubah  | `test.sh`                                                                  |
| baru    | `app/(auth)/_components/auth-shell.module.css`                             |
| baru    | `app/(auth)/_components/auth-shell.test.tsx`                               |
| baru    | `app/(auth)/forgot-password/page.test.tsx`                                 |
| baru    | `app/(auth)/login/page.test.tsx`                                           |
| baru    | `app/(auth)/register/page.test.tsx`                                        |
| baru    | `app/(auth)/reset-password/_components/reset-form-content.test.tsx`        |
| baru    | `app/(auth)/reset-password/page.test.tsx`                                  |
| baru    | `app/(auth)/verify-otp/page.test.tsx`                                      |
| baru    | `app/(public)/_components/home/portfolio-preview.test.tsx`                 |
| baru    | `app/(public)/_components/public-shell.test.tsx`                           |
| baru    | `app/(public)/_components/studio-page-hero.module.css`                     |
| baru    | `app/(public)/_components/studio-page-hero.test.tsx`                       |
| baru    | `app/(public)/_components/studio-page-hero.tsx`                            |
| baru    | `app/(public)/about/page.test.tsx`                                         |
| baru    | `app/(public)/blog/[slug]/page.test.tsx`                                   |
| baru    | `app/(public)/blog/_components/blog-hero.test.tsx`                         |
| baru    | `app/(public)/blog/page.test.tsx`                                          |
| baru    | `app/(public)/calculator/page.test.tsx`                                    |
| baru    | `app/(public)/contact/_components/contact-hero.test.tsx`                   |
| baru    | `app/(public)/contact/page.test.tsx`                                       |
| baru    | `app/(public)/error.test.tsx`                                              |
| baru    | `app/(public)/error.tsx`                                                   |
| baru    | `app/(public)/faq/_components/faq-hero.test.tsx`                           |
| baru    | `app/(public)/faq/page.test.tsx`                                           |
| baru    | `app/(public)/page.test.tsx`                                               |
| baru    | `app/(public)/portfolio/[slug]/page.test.tsx`                              |
| baru    | `app/(public)/portfolio/_components/portfolio-image.test.tsx`              |
| baru    | `app/(public)/portfolio/page.test.tsx`                                     |
| baru    | `app/(public)/pricing/page.test.tsx`                                       |
| baru    | `app/(public)/services/page.test.tsx`                                      |
| baru    | `app/(public)/testimonials/_components/testimonials-hero.test.tsx`         |
| baru    | `app/(public)/testimonials/page.test.tsx`                                  |
| baru    | `app/_test-utils//image-quality.tsx`                                       |
| baru    | `app/_test-utils//page-contract.ts`                                        |
| baru    | `app/admin/ai-relay/_components/admin-relay-approve-topup-dialog.test.tsx` |
| baru    | `app/admin/ai-relay/_components/admin-relay-approve-topup-dialog.tsx`      |
| baru    | `app/admin/ai-relay/_components/admin-relay-audit-tab.test.tsx`            |
| baru    | `app/admin/ai-relay/_components/admin-relay-audit-tab.tsx`                 |
| baru    | `app/admin/ai-relay/_components/admin-relay-create-model-dialog.test.tsx`  |
| baru    | `app/admin/ai-relay/_components/admin-relay-create-model-dialog.tsx`       |
| baru    | `app/admin/ai-relay/_components/admin-relay-edit-model-dialog.test.tsx`    |
| baru    | `app/admin/ai-relay/_components/admin-relay-edit-model-dialog.tsx`         |
| baru    | `app/admin/ai-relay/_components/admin-relay-overview-tab.test.tsx`         |
| baru    | `app/admin/ai-relay/_components/admin-relay-overview-tab.tsx`              |
| baru    | `app/admin/ai-relay/_components/admin-relay-payment-proof-dialog.test.tsx` |
| baru    | `app/admin/ai-relay/_components/admin-relay-payment-proof-dialog.tsx`      |
| baru    | `app/admin/ai-relay/_components/admin-relay-pricing-tab.test.tsx`          |
| baru    | `app/admin/ai-relay/_components/admin-relay-pricing-tab.tsx`               |
| baru    | `app/admin/ai-relay/_components/admin-relay-reject-topup-dialog.test.tsx`  |
| baru    | `app/admin/ai-relay/_components/admin-relay-reject-topup-dialog.tsx`       |
| baru    | `app/admin/ai-relay/_components/admin-relay-sync-tab.test.tsx`             |
| baru    | `app/admin/ai-relay/_components/admin-relay-sync-tab.tsx`                  |
| baru    | `app/admin/ai-relay/_components/admin-relay-topup-tab.test.tsx`            |
| baru    | `app/admin/ai-relay/_components/admin-relay-topup-tab.tsx`                 |
| baru    | `app/admin/ai-relay/_hooks//use-admin-ai-relay.ts`                         |
| baru    | `app/admin/ai-relay/_test-utils//relay-fixture.tsx`                        |
| baru    | `app/admin/ai-relay/_utils/ledger-audit-summary.test.ts`                   |
| baru    | `app/admin/ai-relay/_utils/ledger-audit-summary.ts`                        |
| baru    | `app/admin/analytics/_components//analytics-content.test.tsx`              |
| baru    | `app/admin/analytics/_components//analytics-content.tsx`                   |
| baru    | `app/admin/analytics/_data//analytics.ts`                                  |
| baru    | `app/admin/telegram-bot/page.test.tsx`                                     |
| baru    | `app/admin/timesheet/_data//timesheet-summary.ts`                          |
| baru    | `app/admin/users/_data/workload-page.ts`                                   |
| baru    | `app/dashboard/_components/overview-invoice-chart.test.tsx`                |
| baru    | `app/dashboard/_components/overview-invoice-chart.tsx`                     |
| baru    | `app/dashboard/_components/overview-work-chart.test.tsx`                   |
| baru    | `app/dashboard/_components/overview-work-chart.tsx`                        |
| baru    | `app/dashboard/_data//overview-analytics.ts`                               |
| baru    | `app/dashboard/_utils//overview-distributions.test.ts`                     |
| baru    | `app/dashboard/_utils//overview-distributions.ts`                          |
| baru    | `app/dashboard/ai-relay/page.test.tsx`                                     |
| baru    | `app/dashboard/error.test.tsx`                                             |
| baru    | `app/dashboard/error.tsx`                                                  |
| baru    | `app/dashboard/invoices/_components/invoices-content.test.tsx`             |
| baru    | `app/dashboard/orders/_components/orders-content.test.tsx`                 |
| baru    | `app/dashboard/profile/_components/profile-content.test.tsx`               |
| baru    | `app/dashboard/projects/_components/projects-content.test.tsx`             |
| baru    | `app/proposal/[token]/page.test.tsx`                                       |
| baru    | `app/proposal/error.test.tsx`                                              |
| baru    | `app/proposal/error.tsx`                                                   |
| baru    | `components/ai-relay/_components/binding-linked-panel.test.tsx`            |
| baru    | `components/ai-relay/_components/binding-linked-panel.tsx`                 |
| baru    | `components/ai-relay/_components/binding-unlinked-panel.test.tsx`          |
| baru    | `components/ai-relay/_components/binding-unlinked-panel.tsx`               |
| baru    | `components/ai-relay/_hooks/use-account-binding.ts`                        |
| baru    | `components/ai-relay/_test-utils//binding-fixture.tsx`                     |
| baru    | `components/ai-relay/account-binding-card.test.tsx`                        |
| baru    | `components/shared/data-load-error.test.tsx`                               |
| baru    | `components/shared/data-load-error.tsx`                                    |
| baru    | `components/shared/navbar.test.tsx`                                        |
| baru    | `components/shared/query-input-error.test.tsx`                             |
| baru    | `components/shared/query-input-error.tsx`                                  |
| baru    | `lib/actions/binding-errors.test.ts`                                       |
| baru    | `lib/actions/time.test.ts`                                                 |
| baru    | `lib/admin-aggregates.test.ts`                                             |
| baru    | `lib/hooks/active-tab-scroll.test.ts`                                      |
| baru    | `lib/hooks/active-tab-scroll.ts`                                           |
| baru    | `lib/hooks/use-reveal-active-tab.test.ts`                                  |
| baru    | `lib/hooks/use-reveal-active-tab.ts`                                       |
| baru    | `lib/invoice-payment-policy.ts`                                            |
| baru    | `lib/invoice-snap-items.ts`                                                |
| baru    | `lib/invoice-snap-session.test.ts`                                         |
| baru    | `lib/invoice-snap-session.ts`                                              |
| baru    | `lib/login-rate-limit.test.ts`                                             |
| baru    | `lib/login-rate-limit.ts`                                                  |
| baru    | `lib/pagination.test.ts`                                                   |
| baru    | `lib/pagination.ts`                                                        |
| baru    | `lib/proposal-transitions.test.ts`                                         |
| baru    | `lib/public-publication.test.ts`                                           |
| baru    | `lib/safe-db.test.ts`                                                      |
| baru    | `lib/studio-public-routes.test.ts`                                         |
| baru    | `lib/studio-public-routes.ts`                                              |
| baru    | `lib/test-database-url.test.ts`                                            |
| baru    | `lib/test-database-url.ts`                                                 |
| baru    | `lib/validations/time-entry.ts`                                            |
| baru    | `prisma/migrations/20261116010000_auth_login_limits//migration.sql`        |
| baru    | `scripts/run-tests.ts`                                                     |
| baru    | `scripts/test-environment.test.ts`                                         |
| baru    | `scripts/test-environment.ts`                                              |
| baru    | `ai-agent-docs/project-wide-fixes.md`                                      |
