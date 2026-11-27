# Infrastruktur dan status pengujian

## Persyaratan

- Bun **1.4.4 atau lebih baru**.
- Docker harus aktif. Runner membuat container PostgreSQL 17 sementara dengan penyimpanan `tmpfs` dan port acak yang hanya terikat ke loopback.

## Menjalankan test

```bash
bun install --frozen-lockfile
bun run test
bun run test lib/invoice-snap-session.test.ts
bun run test app/admin/ai-relay
```

`bun run test` menjalankan `scripts/run-tests.ts`. Runner membuat database `aldera_test` dan `aldera_router_test` di container milik invocation tersebut, menerapkan schema, lalu menjalankan `bun test --isolate`. Runner tidak memakai database aplikasi atau menjalankan seed aplikasi. Jika setup schema gagal, test tidak dijalankan dan command berakhir dengan exit code nonzero.

Untuk CI atau environment test yang database-nya sudah disiapkan secara eksplisit, tersedia `bun run test:direct`. Jangan gunakan mode langsung terhadap database development, staging, atau produksi.

## Isolasi dan sumber schema router

Environment test dibentuk dari allowlist variabel OS. URL database test diberikan secara eksplisit dan secret/provider dari file `.env` tidak diwarisi. Prisma dan pool router menolak URL yang nama databasenya tidak memiliki segmen `test`; tidak ada fallback ke database aplikasi.

Schema router dipin pada commit `b6c89b69f39ea5d6f5fbcba2dcb6bb9b22ee0c0e` di repositori infrastruktur. Untuk menjalankan test offline dengan schema lokal, berikan direktori yang berisi `init.sql`, migrasi `001_initial_schema.sql` sampai `004_service_availability.sql`, dan `seeds/001_initial_pricing.sql`:

```bash
bun run test --router-schema=./fixtures/router-schema lib/router-db.test.ts
```

Runner mengunduh schema yang dipin jika opsi lokal tidak diberikan. Runner hanya menghentikan container yang dibuatnya sendiri; server atau container pengguna tidak disentuh.

`bun test --isolate` memisahkan global dan mock tiap berkas. Provider eksternal dan kanal pesan menggunakan mock. Test tidak mengirim permintaan AI berbayar, pembayaran, email, OTP, atau pesan sungguhan.

## Batas verifikasi

Test lokal yang memakai mock tidak membuktikan penyelesaian AI berbayar, pembayaran sandbox, settlement/refund gateway, penerimaan email atau pesan, maupun perilaku layanan di VPS. Nama atau cakupan test tidak boleh dianggap sebagai bukti E2E live untuk integrasi tersebut. Verifikasi alur eksternal dilakukan di VPS staging sebelum promosi produksi.

Syarat rilis dan batas verifikasi live ada di [gerbang kesiapan rilis](public-release-readiness.md). Standar cakupan test UI dijelaskan di [panduan UI testing](ui-testing.md); sharding CI dijelaskan di [ci-testing.md](ci-testing.md).

## Gerbang kualitas

```bash
bun run format
bun run format:check
bun run lint
bunx next typegen
bunx tsc --noEmit
bun run test
bun audit
```

Test UI ditempatkan bersebelahan dengan halaman atau komponen. Regresi data menggunakan mock atau PostgreSQL sementara.
