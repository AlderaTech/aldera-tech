<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Task Completion Rules & Protocols

Setiap AI Agent yang bekerja pada repositori ini **WAJIB** mematuhi aturan dan protokol berikut sebelum menyatakan suatu tugas selesai (_task completion_). Rincian panduan operasional (SOP) lengkap terdapat di [`docs/agent-workflow.md`](docs/agent-workflow.md).

## 1. Pembaruan Dokumentasi (Documentation Sync)

- **Wajib** memperbarui file dokumentasi (pada folder `docs/` atau file markdown terkait seperti `docs/roles-and-features.md`) yang terdampak atau tidak lagi relevan akibat perubahan kode.
- Pastikan dokumentasi selalu merefleksikan kondisi aktif sistem (_present state_), bukan riwayat atau sejarah perubahan lama.

## 2. Pembersihan File & Kode Usang (Dead Code & Artifact Cleanup)

- **Wajib** menghapus file, folder, komponen, rute, atau skrip yang sudah tidak digunakan lagi (_dead code/unused files_) terkait perubahan task saat itu.
- Dilarang meninggalkan file sementara (_temporary scratch files_), file tes coba-coba, atau artefak yang tidak sengaja terbuat.

## 3. Larangan Commit Otomatis (No Auto-Commit / No Auto-Push)

- **DILARANG** menjalankan perintah `git commit` atau `git push` kecuali jika diminta secara eksplisit oleh pengguna.
- Biarkan perubahan berada dalam status _unstaged/staged_ agar pengguna dapat meninjau diff secara mandiri.

## 4. Batasan Eksekusi Test & Build (No Auto-Test / No Auto-Build)

- **DILARANG** menjalankan test otomatis (`bun test`, `npm test`, dll.) atau build produksi (`next build`, `bun run build`) tanpa persetujuan pengguna.
- AI **boleh dan disarankan menawarkan/bertanya** kepada pengguna: _"Apakah Anda ingin saya menjalankan test suite atau build untuk memverifikasi?"_, dan menjalankannya **hanya jika** pengguna menyetujuinya.
- Perintah verifikasi non-test dan non-build **diizinkan dan dianjurkan** dijalankan secara mandiri:
  - Linter: `bun run lint` (atau `eslint`)
  - Formatter: `bun run format` (atau `prettier --write .`) — **Wajib dijalankan setelah selesai mengedit kode untuk merapikan kode & mengurutkan kelas Tailwind**
  - Typecheck: `bunx tsc --noEmit`

## 5. Pemeriksaan Integritas Git Status (Clean Working Tree)

- Sebelum menyatakan selesai, AI **wajib** menjalankan `git status` untuk memeriksa dan memastikan hanya file yang dimaksud yang tersentuh, serta tidak ada file sampah _untracked_ yang tertinggal.

## 6. Keamanan & Sinkronisasi Environment Variables

- Jika ada penambahan variabel lingkungan (_env var_) baru, **wajib** mencatatnya di [`.env.example`](.env.example) beserta komentar penjelasan.
- **Dilarang** menimpa, menghapus, atau membocorkan kredensial rahasia pada file `.env` tanpa instruksi eksplisit pengguna.

## 7. Format Laporan Akhir Terstandarisasi (Standard Completion Summary)

Setiap kali menyelesaikan task, berikan ringkasan terstruktur yang memuat:

- **Perubahan File**: Daftar file yang dimodifikasi, dibuat, dan dihapus.
- **Dokumentasi yang Diperbarui**: Daftar file dokumentasi yang disinkronkan.
- **Status Verifikasi**: Hasil linter, formatter (Prettier), dan typecheck.
- **Tawaran Verifikasi Lanjutan**: Menawarkan apakah pengguna ingin menjalankan test atau build.

## 8. Standar Kualitas Kode & Arsitektur Modular (Code Quality Standards)

- **Wajib** mematuhi 13 prinsip kualitas kode yang didokumentasikan di [`docs/code-quality.md`](docs/code-quality.md):
  1. **Larangan Fat Files**: Pecah file yang membengkak menjadi sub-komponen atau helper terpisah.
  2. **Reusabilitas**: Desain komponen, custom hook, dan helper agar reusable.
  3. **Pemisahan UI & Logic**: Pisahkan state/mutation/validation ke dalam custom hook, biarkan komponen UI murni untuk rendering presentasional.
  4. **Batas Ukuran File**: Patokan batas lunak ~200–250 baris untuk file komponen UI (`.tsx`).
  5. **Pola Co-location**: Gunakan folder privat per rute (`_components/`, `_hooks/`, `_data/`, `_utils/`).
  6. **Zero-any Policy**: Dilarang keras menggunakan tipe `any`. Gunakan `unknown` + type narrowing atau tipe Prisma/Zod eksplisit.
  7. **Sentralisasi Zod**: Validasi form & action wajib di `lib/validations/`.
  8. **Clean RSC Boundary**: Data fetching di server, serialisasi tipe non-plain (seperti Decimal) sebelum oper ke Client Component.
  9. **Error & Toast Hygiene**: Tangani error secara eksplisit dan berikan toast feedback via `sonner` (larangan silent failure).
  10. **Disiplin Tailwind**: Gunakan helper `cn()` dan semantic design tokens (hindari inline style & hex statis).
  11. **Efisiensi State**: Hindari redundant `useEffect` untuk derived state; gunakan `useTransition` untuk mutasi.
  12. **Konvensi Penamaan**: Terapkan `kebab-case` untuk file/folder, `PascalCase` untuk komponen/type, `camelCase` untuk hooks/functions.
  13. **Sentralisasi Rute**: Dilarang hardcode string rute/link/endpoint; wajib impor konstanta dari `lib/routes.ts` (`PUBLIC_ROUTES`, `AUTH_ROUTES`, `DASHBOARD_ROUTES`, `ADMIN_ROUTES`, `API_ROUTES`).

## 9. Sinkronisasi Deployment & Docker (Deployment & Infrastructure Sync)

- Setiap penambahan atau perubahan fitur yang memengaruhi lingkungan runtime produksi (seperti penambahan/perubahan rute cron job, variabel lingkungan, dependensi sistem operasi/binary, port, atau volume persistensi), AI Agent **WAJIB** memperbarui berkas terkait pada folder `docker/` (`docker/Dockerfile`, `docker/docker-compose.yml`, `docker/crontab`, `docker/entrypoint.sh`) dan menyinkronkan panduan di [`docs/deployment.md`](docs/deployment.md) sebelum menyatakan task selesai.

## 10. Portabilitas & Larangan Hardcoded Path Absolut (Portability & Relative Path Rule)

- **DILARANG KERAS** menuliskan path absolut mesin atau skema lokal (seperti `file:///...`, `/home/...`, `/Users/...`, `C:\...`) ke dalam berkas repositori (kode program, skrip, maupun dokumentasi markdown).
- Seluruh tautan file dan import antar berkas dalam repositori **WAJIB** menggunakan path relatif atau module alias (`@/`) agar repositori portabel dan tidak mengalami kerusakan tautan saat dipindahkan ke direktori atau perangkat lain.
