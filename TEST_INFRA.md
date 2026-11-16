# Infrastruktur pengujian Aldera Tech

## Persyaratan

- Bun **1.4.4 atau lebih baru**; `bun.lock` memakai format v3 dan override berbasis rentang versi.
- Docker aktif. Runner memakai PostgreSQL 17 sementara dengan storage tmpfs dan port acak hanya pada loopback.
- Git for Windows diperlukan untuk fixture script POSIX pada Windows. Runner menemukan direktori shell dari instalasi Git; tidak ada path mesin yang ditanam dalam kode.

## Perintah

```bash
bun install --frozen-lockfile
bun run test
bun run test lib/invoice-snap-session.test.ts
bun run test app/admin/ai-relay
```

`scripts/run-tests.ts` membuat database `aldera_test` serta `aldera_router_test` pada container milik invocation itu sendiri. Script tidak menghubungkan PostgreSQL lokal yang sedang berjalan, tidak menjalankan seed aplikasi, tidak memakai `--accept-data-loss`, dan berhenti jika setup schema gagal.

Schema router uji dipin pada commit `d75d14412b5277d174618602e7a8d7649cc2f02c` repositori infrastruktur. Untuk pengujian offline dengan sumber schema yang sudah tersedia:

```bash
bun run test --router-schema=./fixtures/router-schema lib/router-db.test.ts
```

Sumber tersebut harus menyediakan init.sql, tiga migrasi bernomor 001?003 dan seed pricing sesuai daftar pada runner. Runner tidak mengunduh atau menggunakan credential infrastruktur.

## Isolasi dan mutasi

- Environment test dibentuk dari allowlist variabel OS. URL/database test diberikan eksplisit; secret/provider aktif tidak diwarisi dari file .env.
- Prisma dan pool router menolak URL test yang tidak menunjuk nama database bersegmen `test`. Tidak ada fallback ke database aplikasi.
- `bun test --isolate` memisahkan global/mock tiap berkas. Provider dan kanal pesan menggunakan mock; pengujian tidak mengirim permintaan AI berbayar, pembayaran, email, OTP atau pesan asli.
- CI menyediakan dua database test dengan schema yang sama. `bun run test:direct` hanya untuk environment yang sudah disiapkan eksplisit seperti CI, bukan database development/staging/produksi.
- Kegagalan test dipropagasikan sebagai exit code nonzero. Runner membersihkan hanya container yang dibuatnya; server/container milik pengguna tidak disentuh.

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

Test UI ditempatkan bersebelahan dengan halaman/komponen. Regresi data memakai mock atau PostgreSQL sementara. Lihat [standar UI](ai-agent-docs/ui-testing.md) dan [hasil pemeriksaan](ai-agent-docs/project-wide-fixes.md).
