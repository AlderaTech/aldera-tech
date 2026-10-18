<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Agent Task Completion Rules & Protocols

Setiap AI Agent yang bekerja pada repositori ini **WAJIB** mematuhi aturan dan protokol berikut sebelum menyatakan suatu tugas selesai (_task completion_). Rincian panduan operasional (SOP) lengkap terdapat di [`ai-agent-docs/agent-workflow.md`](ai-agent-docs/agent-workflow.md).

## 1. Pembaruan Dokumentasi (Documentation Sync)

- **Wajib** memperbarui file dokumentasi (pada folder `ai-agent-docs/` atau file markdown terkait seperti `ai-agent-docs/roles-and-features.md`) yang terdampak atau tidak lagi relevan akibat perubahan kode.
- Pastikan dokumentasi selalu merefleksikan kondisi aktif sistem (_present state_), bukan riwayat atau sejarah perubahan lama.

## 2. Pembersihan File & Kode Usang (Dead Code & Artifact Cleanup)

- **Wajib** menghapus file, folder, komponen, rute, atau skrip yang sudah tidak digunakan lagi (_dead code/unused files_) terkait perubahan task saat itu.
- Dilarang meninggalkan file sementara (_temporary scratch files_), file tes coba-coba, atau artefak yang tidak sengaja terbuat.

## 3. Aturan Git Branching Model: `main` <- `staging` <- `feat/*`, `fix/*` (Dilarang Commit/PR Langsung ke `main`)

Repositori ini menerapkan model percabangan 3-tingkat terstruktur: `main` (Production) $\leftarrow$ `staging` (Staging / Pre-Production) $\leftarrow$ `feat/*`, `fix/*`, `refactor/*`, `docs/*`, `chore/*`.

- **LARANGAN KERAS**:
  1. **DILARANG KERAS** melakukan commit langsung ke branch `main` maupun branch `staging`.
  2. **DILARANG KERAS** membuka Pull Request (PR) langsung ke `main` untuk task reguler/fitur/bugfix.
- **Alur Kerja Branching Wajib (Staging -> Feature Branch -> PR to Staging -> Squash & Merge -> Promotion to Main)**:
  1. **Buat Branch Baru dari `staging`**: Setiap penanganan tugas, perbaikan bug, atau penambahan fitur **WAJIB dicabangkan dari `origin/staging`**:
     ```bash
     git fetch origin
     git checkout -b feat/<nama-fitur> origin/staging
     # atau untuk perbaikan bug:
     git checkout -b fix/<deskripsi-bug> origin/staging
     ```
     Konvensi penamaan:
     - `feat/<nama-fitur>`: Penambahan fitur baru
     - `fix/<deskripsi-bug>`: Perbaikan bug atau celah keamanan
     - `refactor/<komponen>`: Restrukturisasi atau pembersihan kode
     - `docs/<nama-dokumen>`: Pembaruan dokumentasi
     - `chore/<nama-tugas>`: Pemeliharaan dependensi / konfigurasi build
  2. **Commit pada Branch Kerja**: Lakukan commit pada branch kerja dengan pesan Conventional Commits (`feat: ...`, `fix: ...`, `refactor: ...`).
  3. **Buat Pull Request (PR) ke `staging`**: Ajukan PR dengan target branch **`staging`** (`base: staging`, `compare: feat/...`).
  4. **Squash and Merge ke `staging`**: Penggabungan PR ke branch `staging` **WAJIB** menggunakan metode **Squash and Merge**. Push ke `staging` memicu otomatisasi CI/CD untuk build image `:staging` dan deploy ke VPS Staging Stack (`/opt/docker-stack/applications/aldera-tech-staging` & `staging.aldera.tech`).
  5. **Promosi Teruji ke `main`**: Penggabungan dari `staging` ke `main` hanya dilakukan melalui Release PR (`base: main`, `compare: staging`) setelah seluruh pengujian E2E di VPS staging lulus dan diverifikasi.

## 4. Protokol Pengetesan & Pembaruan Test (Mandatory Test Mapping & Updating)

- **Wajib Mencari Test Terkait**: Untuk setiap perubahan kode (perbaikan bug, penambahan fitur, perubahan skema database, atau refactoring), AI Agent **WAJIB** mencari file test yang menguji modul/fitur terkait (gunakan `find . -name "*.test.*"` atau `grep -rn "namaFungsi" lib/ tests/ app/`).
- **Wajib Memperbarui & Menambah Test**:
  - Jika logika bisnis atau kontrak fungsi berubah, **wajib memperbarui skenario test yang ada** agar tetap relevan dan akurat.
  - Jika memperbaiki bug, **wajib menambahkan skenario pengujian baru** (_regression test_) yang memverifikasi bahwa bug tersebut telah tuntas dan tidak terulang kembali.
  - Jika membuat fitur baru, **wajib membuat file test baru** (`*.test.ts`) yang mencakup _happy path_ dan _boundary/edge cases_.
- **Wajib UI Test untuk Setiap UI (Mandatory UI Testing)**:
  - Setiap komponen UI, halaman rute (`page.tsx`), form input, modal, dan view interaktif **WAJIB** dibuatkan file pengujian UI (`*.test.tsx` atau `*.test.ts`) yang diletakkan secara _co-located_ di direktori yang sama (panduan lengkap: [`ai-agent-docs/ui-testing.md`](ai-agent-docs/ui-testing.md)).
  - Pengujian UI wajib menguji: rendering elemen JSX, ekspor SEO metadata, integritas rute `lib/routes.ts` (Zero Hardcoded Routes), penanganan 4 kondisi UI (Skeleton loading, Empty state, Error state, Large dataset), form input hygiene (placeholder, bintang merah `*`, label `(Opsional)`), dan sinkronisasi parameter URL (`?tab=`, `?q=`, `?page=`).
- **Verifikasi Pengetesan Mandiri**:
  - AI Agent diwajibkan menjalankan test spesifik modul yang diubah (`bun test <path-file.test.ts>`) atau test suite lengkap (`bun test`) untuk memverifikasi bahwa seluruh test berstatus **PASS** (0 fail) sebelum branch/PR dinyatakan siap dimerge.
- Perintah verifikasi non-test dan non-build tetap **wajib dijalankan**:
  - Linter: `bun run lint` (atau `eslint .`)
  - Formatter: `bun run format` (atau `prettier --write .`) — **Wajib dijalankan setelah selesai mengedit kode untuk merapikan kode & mengurutkan kelas Tailwind**
  - Typecheck: `bunx tsc --noEmit` (atau `bun run typecheck`)

## 5. Pemeriksaan Integritas Git Status (Clean Working Tree)

- Sebelum menyatakan selesai, AI **wajib** menjalankan `git status` untuk memeriksa dan memastikan hanya file yang dimaksud yang tersentuh, serta tidak ada file sampah _untracked_ yang tertinggal.

## 6. Keamanan & Sinkronisasi Environment Variables

- Jika ada penambahan variabel lingkungan (_env var_) baru, **wajib** mencatatnya di [`.env.example`](.env.example) beserta komentar penjelasan.
- **Dilarang** menimpa, menghapus, atau membocorkan kredensial rahasia pada file `.env` tanpa instruksi eksplisit pengguna.

## 7. Format Laporan Akhir Terstandarisasi (Standard Completion Summary)

Setiap kali menyelesaikan task, berikan ringkasan terstruktur yang memuat:

- **Branch & Git Status**: Nama branch kerja aktif dan status Pull Request.
- **Perubahan File**: Daftar file yang dimodifikasi, dibuat, dan dihapus.
- **Status Test & Pengujian**: Daftar file test yang dicari, diperbarui/dibuat, dan hasil eksekusi `bun test`.
- **Dokumentasi yang Diperbarui**: Daftar file dokumentasi yang disinkronkan.
- **Status Verifikasi**: Hasil linter, formatter (Prettier), dan typecheck.

## 8. Standar Kualitas Kode & Arsitektur Modular (Code Quality Standards)

- **Wajib** mematuhi prinsip kualitas kode yang didokumentasikan di [`ai-agent-docs/code-quality.md`](ai-agent-docs/code-quality.md):
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
  14. **Deep-Linking & URL Param State**: Searching, filtering, sorting, pagination, dan navigasi tab wajib disinkronkan ke URL query parameter (`?q=`, `?category=`, `?sort=`, `?page=`, `?tab=`) agar state dapat disalin dan dibagikan secara persis (_shareable state_).
  15. **The 4 UI States Rule**: Setiap antarmuka data wajib menangani 4 kondisi: Loading (Skeleton UI mirroring layout asli), Empty State (ikon/pesan ramah + CTA), Error State (pesan error informatif + retry/toast), dan Large Dataset State (paginasi URL / batas per-halaman).
  16. **Standarisasi Input Form**: Setiap field input/select wajib memiliki placeholder kontekstual yang informatif. Label field required wajib bertanda bintang merah (`*`), dan field opsional wajib mencantumkan keterangan `(Opsional)` secara eksplisit.
  17. **Integritas Pengetesan & Test Maintenance**: Setiap perubahan kode wajib mencari file test terkait, memperbarui/menambah skenario pengujian, dan memastikan 100% test lulus (`bun test`).
  18. **Git Branching & Squash Merge**: Wajib cabang dari `staging` (`git checkout -b feat/... origin/staging`), buka PR ke `staging`, dan gunakan Squash and Merge. Dilarang commit/PR langsung ke `main`.
  19. **Kewajiban Pengujian UI (Mandatory UI Testing)**: Setiap komponen antarmuka, modal, formulir, dan halaman rute (`page.tsx`) wajib memiliki UI test pendamping (`*.test.tsx`) yang menguji rendering, form input, 4 kondisi antarmuka, dan integritas navigasi (merujuk ke [`ai-agent-docs/ui-testing.md`](ai-agent-docs/ui-testing.md)).
- Rincian panduan UI/UX lengkap wajib merujuk ke [`ai-agent-docs/ai-guidelines.md`](ai-agent-docs/ai-guidelines.md) dan [`ai-agent-docs/ui-testing.md`](ai-agent-docs/ui-testing.md).

## 9. Sinkronisasi Deployment & Docker (Deployment & Infrastructure Sync)

- Setiap penambahan atau perubahan fitur yang memengaruhi lingkungan runtime produksi (seperti penambahan/perubahan rute cron job, variabel lingkungan, dependensi sistem operasi/binary, port, atau volume persistensi), AI Agent **WAJIB** memperbarui berkas terkait pada folder `docker/` (`docker/Dockerfile`, `docker/docker-compose.yml`, `docker/crontab`, `docker/entrypoint.sh`) dan menyinkronkan panduan di [`ai-agent-docs/deployment.md`](ai-agent-docs/deployment.md) sebelum menyatakan task selesai.

## 10. Portabilitas & Larangan Hardcoded Path Absolut (Portability & Relative Path Rule)

- **DILARANG KERAS** menuliskan path absolut mesin atau skema lokal (seperti `file:///...`, `/home/...`, `/Users/...`, `C:\...`) ke dalam berkas repositori (kode program, skrip, maupun dokumentasi markdown).
- Seluruh tautan file dan import antar berkas dalam repositori **WAJIB** menggunakan path relatif atau module alias (`@/`) agar repositori portabel dan tidak mengalami kerusakan tautan saat dipindahkan ke direktori atau perangkat lain.

## 11. Arsitektur Dual-Bot & Multi-Stack Staging Topology

Aldera Tech beroperasi dalam topologi multi-stack yang memisahkan lingkungan Staging dan Produksi secara berdampingan pada VPS `45.66.153.149`:
- **Lingkungan Staging (`staging`)**:
  - Web App: `https://staging.aldera.tech` (direktori server `/opt/docker-stack/applications/aldera-tech-staging`, database `aldera_tech_staging`).
  - Telegram Bot: `@aldera_tech_staging_bot` (Token: `[REDACTED_TELEGRAM_BOT_TOKEN]`, direktori server `/opt/docker-stack/applications/aldera-router-staging`, database `aldera_router_staging`).
- **Lingkungan Produksi (`main`)**:
  - Web App: `https://aldera.tech` (direktori server `/opt/docker-stack/applications/aldera-tech`, database `aldera_tech` / `solvo_tech`).
  - Telegram Bot: `@aldera_tech_bot` (Token: `[REDACTED_TELEGRAM_BOT_TOKEN]`, direktori server `/opt/docker-stack/applications/aldera-router`, database `aldera_router`).
- **CI/CD Triggers**: Push ke `staging` memicu build image `:staging` dan auto-deploy ke direktori staging di VPS. Push ke `main` memicu build image `:latest` dan auto-deploy ke direktori produksi di VPS. Detail teknis lengkap terdapat di [`ai-agent-docs/deployment.md`](ai-agent-docs/deployment.md).

