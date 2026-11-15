# Verifikasi keamanan dan konsistensi backend

## Cakupan aktif

| Area              | Perlindungan                                                                       | Pengujian                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Identitas & sesi  | Token reset sekali pakai, versi sesi, nomor terverifikasi, lock OTP                | `auth.test.ts`, `lib/auth-session.test.ts`, `lib/backend-security.test.ts`                                           |
| Izin & relasi     | Permission per tindakan; milestone dan balasan satu proyek                         | `lib/backend-security.test.ts`, `lib/actions/calculator-permissions.test.ts`                                         |
| Pembayaran        | Status terminal, tujuan invoice eksplisit, outbox kredit/refund, saldo non-negatif | `app/api/webhooks/payment/route.test.ts`, `lib/invoice-balance-effects.test.ts`                                      |
| Dokumen           | Nomor numerik berserial, konversi proposal idempoten, jadwal invoice atomik        | `lib/invoice-balance-effects.test.ts`, `lib/backend-security.test.ts`                                                |
| AI                | Respons/usage valid, bearer upstream, tanpa debit saat gagal, tanpa katalog buatan | `lib/relay-upstream.test.ts`, `lib/backend-security.test.ts`                                                         |
| Konten            | Sanitasi parser, pembatas JSON-LD, kegagalan write diteruskan                      | `lib/sanitize-html.test.ts`, `components/seo/json-ld.test.tsx`, `lib/backend-security.test.ts`                       |
| Unggahan          | Dekode isi, ekstensi kanonik, scope privat, otorisasi URL lama/baru                | `lib/upload-content.test.ts`, `lib/file-download.test.ts`, `lib/backend-security.test.ts`, tes rute API files/upload |
| Koneksi router    | Proxy guard tidak memodifikasi koneksi pool; trigger audit tetap aktif             | `lib/router-db.test.ts`, `lib/router-db-adversarial.test.ts`                                                         |
| Bot & konfigurasi | Antrean sinkronisasi per entitas; gagal utama tidak memutasi router                | `lib/integration-sync.test.ts`, `lib/backend-security.test.ts`, tes aksi Telegram                                    |

## Cara menjalankan

- Gunakan PostgreSQL aplikasi dan router yang terisolasi. Terapkan schema aplikasi dan SQL router resmi yang dipakai CI; jangan memakai database produksi.
- Semua panggilan provider, pembayaran dan pengiriman pesan dalam pengujian memakai mock atau konfigurasi pengujian.
- Jalankan `bun test`, `bun run lint`, formatter pada berkas task, `bunx next typegen`, lalu `bunx tsc --noEmit`.
- Migrasi aditif: `prisma/migrations/20261116000000_backend_security_and_reconciliation/migration.sql`. Volume privat, cron, dan prasyarat cache tercantum di [deployment](deployment.md).

## Batas verifikasi

- Keberhasilan fixture tidak menggantikan E2E VPS staging terhadap proxy/router eksternal, sandbox Midtrans, konfigurasi CDN/nginx, serta penyedia pesan pengujian.
- Refund parsial tidak direkonsiliasi sebagai refund penuh; memerlukan kebijakan dan alur akuntansi terpisah.
- Efek refund `REVIEW` tidak diproses otomatis. Admin meninjau ledger, memperbaiki kekurangan melalui alur resmi, mencoba ulang rekonsiliasi, kemudian membuka akses AI.
- Invoice lama bertujuan `PROJECT` secara default; jangan menyimpulkan top-up dari catatan atau menerbitkan kredit historis secara otomatis.
- Katalog/health AI memerlukan upstream dan database router yang benar. Gangguan eksternal dilaporkan jujur.

## Hasil pemeriksaan lokal

- Workspace: **890 pengujian lulus, 0 gagal** pada 208 berkas test, menggunakan PostgreSQL aplikasi/router terisolasi dan layanan eksternal mock.
- Snapshot backend diperiksa melalui arsip Git secara terpisah dari 59 perubahan UI sebelumnya; hasil lengkap dicatat pada Pull Request.
- Typecheck dan Next.js typegen lulus. Lint: 0 error; satu warning impor tidak terpakai yang sudah ada pada `lib/cron-lock.test.ts`.
- Formatter berkas task dan pemeriksaan diff lulus. Sintaks entrypoint Docker lulus. Scanner konfigurasi/infrastruktur: 0 drift dan 0 kebocoran secret.
- Probe Node native: HTML yang menyamar sebagai PNG ditolak HTTP 415, tanpa penulisan berkas. Probe Chrome offline: payload SVG/JSON-LD tidak dieksekusi.
- Rute login/register tersedia HTTP 200; file tidak dikenal HTTP 404; cron tanpa secret HTTP 401; dashboard tanpa sesi mengarah ke Login.
- Schema tambahan diterapkan pada database development loopback secara aditif. Tidak ada perubahan data akun atau transaksi. 59 perubahan UI yang sudah ada tetap terjaga.

## Berkas task

Manifest berkas di bawah mencakup perubahan backend dan pengujian pendukung; perubahan UI yang sudah ada sebelumnya tidak termasuk commit task.

<!-- TASK FILE MANIFEST -->

| Status | Berkas                                                                               |
| ------ | ------------------------------------------------------------------------------------ |
| Diubah | `.dockerignore`                                                                      |
| Diubah | `.gitignore`                                                                         |
| Diubah | `ai-agent-docs/backend-integrity.md`                                                 |
| Dibuat | `ai-agent-docs/backend-security-verification.md`                                     |
| Diubah | `ai-agent-docs/deployment.md`                                                        |
| Diubah | `ai-agent-docs/roles-and-features.md`                                                |
| Diubah | `app/(public)/ai-relay/page.test.tsx`                                                |
| Dibuat | `app/admin/ai-relay/_components/invoice-reconciliation.test.tsx`                     |
| Dibuat | `app/admin/ai-relay/_components/invoice-reconciliation.tsx`                          |
| Diubah | `app/admin/ai-relay/client-view.tsx`                                                 |
| Dibuat | `app/admin/ai-relay/page.test.tsx`                                                   |
| Diubah | `app/admin/ai-relay/page.tsx`                                                        |
| Dibuat | `app/admin/invoices/[id]/_components/invoice-proof-verifier.test.tsx`                |
| Diubah | `app/admin/invoices/[id]/_components/invoice-proof-verifier.tsx`                     |
| Diubah | `app/admin/invoices/_components/invoice-create-form.test.tsx`                        |
| Diubah | `app/admin/invoices/_components/invoice-create-form.tsx`                             |
| Dibuat | `app/admin/proposals/_components/client-credentials-dialog.test.tsx`                 |
| Dibuat | `app/admin/proposals/_components/client-credentials-dialog.tsx`                      |
| Dibuat | `app/admin/proposals/_components/proposal-actions.test.tsx`                          |
| Diubah | `app/admin/proposals/_components/proposal-actions.tsx`                               |
| Diubah | `app/api/cron/cron-endpoints.test.ts`                                                |
| Diubah | `app/api/cron/issue-recurring/route.ts`                                              |
| Dibuat | `app/api/cron/reconcile-integrations/route.test.ts`                                  |
| Dibuat | `app/api/cron/reconcile-integrations/route.ts`                                       |
| Dibuat | `app/api/files/[id]/route.test.ts`                                                   |
| Dibuat | `app/api/files/[id]/route.ts`                                                        |
| Dibuat | `app/api/files/legacy/[...path]/route.test.ts`                                       |
| Dibuat | `app/api/files/legacy/[...path]/route.ts`                                            |
| Diubah | `app/api/upload/route.test.ts`                                                       |
| Diubah | `app/api/upload/route.ts`                                                            |
| Diubah | `app/api/webhooks/payment/route.test.ts`                                             |
| Diubah | `app/api/webhooks/payment/route.ts`                                                  |
| Dibuat | `app/dashboard/invoices/_components/payment-proof-field.test.tsx`                    |
| Diubah | `app/dashboard/invoices/_components/payment-proof-field.tsx`                         |
| Dibuat | `app/dashboard/profile/_hooks/use-profile-form.test.ts`                              |
| Diubah | `app/dashboard/profile/_hooks/use-profile-form.ts`                                   |
| Diubah | `auth.config.ts`                                                                     |
| Diubah | `auth.test.ts`                                                                       |
| Diubah | `auth.ts`                                                                            |
| Diubah | `bun.lock`                                                                           |
| Dibuat | `components/seo/json-ld.test.tsx`                                                    |
| Diubah | `components/seo/json-ld.tsx`                                                         |
| Diubah | `docker/Dockerfile`                                                                  |
| Diubah | `docker/crontab`                                                                     |
| Diubah | `docker/docker-compose.yml`                                                          |
| Diubah | `docker/entrypoint.sh`                                                               |
| Dibuat | `lib/account-locks.ts`                                                               |
| Diubah | `lib/actions/admin-ai-relay.test.ts`                                                 |
| Diubah | `lib/actions/admin-ai-relay.ts`                                                      |
| Diubah | `lib/actions/admin.ts`                                                               |
| Diubah | `lib/actions/adversarial-stress.test.ts`                                             |
| Diubah | `lib/actions/ai-relay.test.ts`                                                       |
| Diubah | `lib/actions/ai-relay.ts`                                                            |
| Diubah | `lib/actions/auth-actions.test.ts`                                                   |
| Diubah | `lib/actions/auth.ts`                                                                |
| Diubah | `lib/actions/blog.ts`                                                                |
| Diubah | `lib/actions/bulk.ts`                                                                |
| Diubah | `lib/actions/calculator.ts`                                                          |
| Diubah | `lib/actions/invoice-actions.test.ts`                                                |
| Dibuat | `lib/actions/invoice-reconciliation.ts`                                              |
| Diubah | `lib/actions/invoice.ts`                                                             |
| Diubah | `lib/actions/message.ts`                                                             |
| Dibuat | `lib/actions/model-catalog.test.ts`                                                  |
| Diubah | `lib/actions/password-reset-actions.test.ts`                                         |
| Diubah | `lib/actions/password-reset.ts`                                                      |
| Diubah | `lib/actions/profile.ts`                                                             |
| Diubah | `lib/actions/project.ts`                                                             |
| Diubah | `lib/actions/proposal.ts`                                                            |
| Diubah | `lib/actions/recurring-invoice.ts`                                                   |
| Diubah | `lib/actions/task.ts`                                                                |
| Diubah | `lib/actions/team.ts`                                                                |
| Diubah | `lib/actions/telegram-bot-actions.test.ts`                                           |
| Diubah | `lib/actions/telegram-bot.ts`                                                        |
| Diubah | `lib/actions/testimonial.ts`                                                         |
| Diubah | `lib/ai-relay-utils.ts`                                                              |
| Dibuat | `lib/audit-log.ts`                                                                   |
| Diubah | `lib/auth-session.test.ts`                                                           |
| Diubah | `lib/auth-session.ts`                                                                |
| Dibuat | `lib/backend-security.test.ts`                                                       |
| Dibuat | `lib/document-number.ts`                                                             |
| Dibuat | `lib/file-download.test.ts`                                                          |
| Dibuat | `lib/file-download.ts`                                                               |
| Dibuat | `lib/integration-sync.test.ts`                                                       |
| Dibuat | `lib/integration-sync.ts`                                                            |
| Dibuat | `lib/invoice-balance-effects.test.ts`                                                |
| Dibuat | `lib/invoice-balance-effects.ts`                                                     |
| Dibuat | `lib/invoice-status-transition.ts`                                                   |
| Diubah | `lib/manual-payment-verification.ts`                                                 |
| Dibuat | `lib/midtrans-payment-event.ts`                                                      |
| Dibuat | `lib/public-upload-classification.ts`                                                |
| Dibuat | `lib/recurring-invoice-issuer.ts`                                                    |
| Dibuat | `lib/relay-upstream.test.ts`                                                         |
| Dibuat | `lib/relay-upstream.ts`                                                              |
| Diubah | `lib/router-db.test.ts`                                                              |
| Diubah | `lib/router-db.ts`                                                                   |
| Diubah | `lib/routes-query.test.ts`                                                           |
| Diubah | `lib/routes.ts`                                                                      |
| Diubah | `lib/sanitize-html.test.ts`                                                          |
| Diubah | `lib/sanitize-html.ts`                                                               |
| Dibuat | `lib/task-relations.ts`                                                              |
| Diubah | `lib/telegram.test.ts`                                                               |
| Diubah | `lib/telegram.ts`                                                                    |
| Dibuat | `lib/upload-content.test.ts`                                                         |
| Dibuat | `lib/upload-content.ts`                                                              |
| Dibuat | `lib/upload-storage.test.ts`                                                         |
| Dibuat | `lib/upload-storage.ts`                                                              |
| Dibuat | `lib/validations/bot-settings.ts`                                                    |
| Diubah | `lib/validations/invoice.ts`                                                         |
| Dibuat | `lib/validations/order-request.ts`                                                   |
| Dibuat | `lib/validations/profile.ts`                                                         |
| Dibuat | `lib/validations/relay.ts`                                                           |
| Dibuat | `lib/verification-store.ts`                                                          |
| Diubah | `next.config.ts`                                                                     |
| Diubah | `package.json`                                                                       |
| Dibuat | `prisma/migrations/20261116000000_backend_security_and_reconciliation/migration.sql` |
| Diubah | `prisma/schema.prisma`                                                               |
