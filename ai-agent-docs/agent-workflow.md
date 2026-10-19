# Standard Operating Procedure (SOP): Alur Kerja & Penyelesaian Task AI Agent

Dokumen ini merupakan panduan operasional standar (_Standard Operating Procedure_) bagi AI Agent yang bekerja pada repositori Aldera Tech. Dokumen ini merinci langkah-langkah wajib yang harus dieksekusi sebelum dan sesudah menyelesaikan setiap tugas (_task_).

---

## 1. Matriks Batasan Eksekusi Perintah (Command Execution Boundaries)

Tabel berikut menentukan perintah apa saja yang boleh dijalankan otomatis oleh AI Agent dan perintah apa yang memerlukan konfirmasi eksplisit dari pengguna:

| Kategori Perintah                  | Contoh Perintah                                       | Boleh Dijalankan Otomatis? | Keterangan & Aturan                                                                                             |
| :--------------------------------- | :---------------------------------------------------- | :------------------------: | :-------------------------------------------------------------------------------------------------------------- |
| **Branching**                      | `git checkout -b feat/... origin/staging`             |         ✅ **YA**          | **Wajib membuat branch baru dari `origin/staging`**. Dilarang bekerja/commit langsung di `staging` atau `main`. |
| **Pencarian Test**                 | `find . -name "*.test.*"`, `grep ...`                 |         ✅ **YA**          | **Wajib dijalankan** untuk memetakan file pengujian yang menguji modul yang diubah.                             |
| **Modul Test Execution**           | `bun test <file.test.ts>`, `bun test <file.test.tsx>` |         ✅ **YA**          | **Wajib dijalankan** untuk memverifikasi file test unit / UI yang diperbarui/dibuat.                            |
| **Full Test Suite**                | `bun test`                                            |         ✅ **YA**          | **Wajib dijalankan** sebelum menyelesaikan task untuk menjamin 0 regresi di seluruh sistem.                     |
| **Typecheck**                      | `bunx tsc --noEmit`                                   |         ✅ **YA**          | Wajib dijalankan untuk memastikan tidak ada error kompilasi/tipe.                                               |
| **Next.js Typegen**                | `bunx next typegen`                                   |         ✅ **YA**          | Jalankan sebelum typecheck pada Next.js 16 untuk menghasilkan deklarasi gambar dan tipe rute.                   |
| **Linter**                         | `bun run lint`, `eslint .`                            |         ✅ **YA**          | Diizinkan untuk memastikan kepatuhan standar kode.                                                              |
| **Formatter**                      | `bun run format`, `prettier --write ...`              |         ✅ **YA**          | **Wajib dijalankan** setelah selesai mengedit kode untuk merapikan kode & mengurutkan class Tailwind.           |
| **Pemeriksaan Status**             | `git status`, `git diff`                              |         ✅ **YA**          | Wajib dijalankan sebelum menyelesaikan turn/task.                                                               |
| **Generasi Skema**                 | `bun run db:generate`                                 |         ✅ **YA**          | Dijalankan saat ada perubahan pada `prisma/schema.prisma`.                                                      |
| **Pembersihan File**               | `rm ...`, file deletion                               |         ✅ **YA**          | Wajib untuk membersihkan dead code / scratch files terkait task.                                                |
| **Production Build**               | `bun run build`, `next build`                         |        ❌ **TIDAK**        | Jalankan jika diminta pengguna atau sebagai gerbang verifikasi rilis final.                                     |
| **Git Commit ke `main`/`staging`** | `git commit` di branch `main` atau `staging`          |      🚫 **DILARANG**       | **DILARANG KERAS**. Seluruh commit wajib berada di feature/fix branch.                                          |
| **Git Commit di Branch**           | `git commit -m "..."` di feature branch               |         ✅ **YA**          | Dilakukan pada branch kerja dengan pesan Conventional Commits.                                                  |
| **PR & Squash Merge**              | Buat PR & Squash and Merge ke `staging`               |         ✅ **YA**          | Alur wajib penggabungan perubahan ke branch `staging`. Promosi ke `main` via release PR teruji.                 |

---

## 2. Checklist Wajib Penyelesaian Task (Task Completion Checklist)

Setiap AI Agent wajib memeriksa seluruh checklist berikut sebelum menyatakan bahwa tugas telah selesai:

```
[ ] 1. Git Branching Check (Non-Main, Non-Staging Branch)
    - Pastikan TIDAK berada di branch `main` atau `staging` saat melakukan commit.
    - Dicabangkan dari `origin/staging`: `git checkout -b feat/... origin/staging`.
    - Telah membuat branch kerja: `feat/...`, `fix/...`, `refactor/...`, `docs/...`, atau `chore/...`.

[ ] 2. Kode & Perubahan Utama Selesai
    - Fitur/perbaikan telah diimplementasikan sesuai kebutuhan pengguna.
    - Menjaga integritas komentar dan kode yang tidak terkait.

[ ] 3. Pemetaan & Pembaruan Test (Test Mapping & Maintenance)
    - Telah mencari file test terkait (`find . -name "*.test.*"` atau grep).
    - Memperbarui skenario test yang ada jika kontrak logika/fungsi berubah.
    - Menambahkan skenario test baru untuk bugfix (regression test) atau fitur baru.
    - Menjalankan `bun test <file.test.ts>` dan memastikan 100% test lulus.

[ ] 4. Pengujian UI Wajib untuk Setiap UI (Mandatory UI Testing)
    - Setiap komponen UI, halaman rute (`page.tsx`), form input, modal, dan view interaktif memiliki UI test (`*.test.tsx` / `*.test.ts`) yang diletakkan secara co-located di folder yang sama (lihat `ai-agent-docs/ui-testing.md`).
    - Memverifikasi rendering elemen JSX & prop initialization.
    - Memverifikasi ekspor SEO metadata (title, description, canonical) pada halaman rute.
    - Memverifikasi integritas rute menggunakan konstanta `lib/routes.ts` (Zero Hardcoded Routes).
    - Memverifikasi penanganan 4 kondisi UI: Loading Skeleton, Empty State (ikon + pesan + CTA), Error State (kartu error + retry), dan Large Dataset pagination.
    - Memverifikasi standarisasi form: Setiap input memiliki placeholder kontekstual, label required bertanda bintang merah (*), dan label optional bertuliskan (Opsional).
    - Memverifikasi sinkronisasi parameter URL (?tab=, ?q=, ?page=).
    - Memverifikasi pelarangan window.confirm/alert dan penggunaan <ConfirmDialog>.

[ ] 5. Kepatuhan Standar Kualitas Kode (Code Quality Audit)
    - Mematuhi prinsip di `ai-agent-docs/code-quality.md`.
    - Tidak ada fat file (>200–250 baris) yang belum diekstrak ke sub-komponen/hooks.
    - Logika state/mutasi form telah dipisahkan dari tampilan UI (menggunakan custom hooks).
    - Tidak ada penggunaan tipe `any` (kebijakan zero-any dipatuhi).
    - Validasi data form/action dipusatkan di `lib/validations/`.
    - Seluruh link, tombol navigasi, redirect, dan pemanggilan API internal mengimpor konstanta dari `lib/routes.ts` (Zero Hardcoded Routes).
    - Sinkronisasi URL query parameter untuk searching, filter, sort, pagination, dan tab active.
    - Menangani 4 kondisi antarmuka: Loading Skeleton, Empty State + CTA, Error State + Retry, dan Large Dataset pagination.
    - Standarisasi input: Semua input memiliki placeholder, required bertanda (*), dan optional bertuliskan (Opsional).
    - Tidak ada URI/path absolut mesin (`file:///...`, `/home/...`) di dalam file kode maupun dokumentasi git (Portability Check).

[ ] 6. Pembersihan Kode & File Usang (Dead Code & Cleanup)
    - File/folder lama yang digantikan telah dihapus.
    - File scratch/temporer yang dibuat selama investigasi telah dibersihkan.
    - Import yang tidak lagi digunakan (unused imports) telah dihapus.

[ ] 7. Sinkronisasi Dokumentasi Proyek (Docs Sync)
    - Memeriksa folder `ai-agent-docs/` dan file markdown terkait.
    - Jika ada perubahan peran/rute, perbarui `ai-agent-docs/roles-and-features.md`.
    - Jika ada penyesuaian arsitektur/standar, perbarui `ai-agent-docs/code-quality.md`.
    - Jika ada penambahan standar pengujian antarmuka, perbarui `ai-agent-docs/ui-testing.md`.
    - Dokumentasi harus selalu mendeskripsikan kondisi sistem saat ini (tanpa riwayat masa lalu).

[ ] 8. Keamanan & Environment Variables
    - Jika ada env var baru, tambahkan ke `.env.example` beserta deskripsi singkatnya.
    - Tidak menimpa atau membocorkan isi kredensial di `.env`.

[ ] 9. Sinkronisasi Deployment & Docker (Infrastructure Sync)
    - Jika ada penambahan cron job baru, dependensi OS, port, atau volume persistensi, perbarui berkas terkait di folder `docker/`.
    - Perbarui dan sinkronkan panduan `ai-agent-docs/deployment.md`.

[ ] 10. Verifikasi Linter, Formatter & Typecheck (Wajib)
    - Jalankan `bun run format` untuk merapikan kode & mengurutkan kelas Tailwind.
    - Jalankan `bunx next typegen` untuk menghasilkan deklarasi tipe Next.js sebelum typecheck.
    - Jalankan `bunx tsc --noEmit` untuk memastikan 0 error tipe TypeScript.
    - Jalankan `bun run lint` untuk memastikan 0 error/warning linter.
    - Jalankan `bun test` untuk memastikan seluruh 100% unit tests & UI tests lulus.

[ ] 11. Pemeriksaan Integritas Git & PR Workflow
    - Jalankan `git status` untuk meninjau status direktori kerja (tidak ada file sampah untracked).
    - Lakukan commit pada branch kerja (BUKAN di `main` atau `staging`).
    - Buka Pull Request (PR) ke `staging` (`base: staging`, `compare: feat/...`).
    - Terapkan strategi Squash and Merge saat penggabungan ke `staging`.
    - Promosi ke `main` hanya melalui Release PR terverifikasi setelah lulus pengujian di staging.
```

---

## 3. Protokol Pembersihan Berkas & Dead Code

Ketika melakukan refaktor, perampingan fitur, atau migrasi kode:

1. **Identifikasi Ketergantungan**: Cari seluruh referensi file/komponen yang akan dihapus menggunakan perintah grep atau file search.
2. **Hapus File Utama**: Hapus file komponen, rute, hook, atau utilitas yang sudah tidak digunakan.
3. **Bersihkan File Pendukung**: Hapus folder direktori kosong jika seluruh file di dalamnya sudah dihapus.
4. **Hapus File Uji Coba**: Hapus file scratch (misal `temp_test.js`, file output tes lokal) yang dibuat selama proses pengerjaan.

---

## 4. Protokol Pemeliharaan Dokumentasi (`ai-agent-docs/`)

Dokumentasi dalam folder `ai-agent-docs/` dirancang agar dapat dikonsumsi secara presisi oleh agen AI maupun pengembang:

1. **Selalu Merefleksikan Status Aktif (_Present State Only_)**:
   - Dilarang menuliskan riwayat historis seperti _"Dahulu fitur ini bernama X lalu digabung menjadi Y"_.
   - Tulis secara langsung dan tegas: _"Fitur X berfungsi untuk ..."_.
2. **Format Terstruktur & Deterministik**:
   - Gunakan tabel pemetaan, daftar bullet yang rapi, dan blok spesifikasi YAML/JSON.
   - Hindari deskripsi naratif yang panjang atau ambigu.
3. **Pembaruan Konsisten**:
   - Jika ada rute baru ditambahkan, masukkan ke tabel matriks otorisasi rute di `ai-agent-docs/roles-and-features.md`.
   - Jika ada izin (_permission_) baru ditambahkan, daftarkan di kamus izin sistem.
4. **Sinkronisasi Infrastruktur Deployment (`ai-agent-docs/deployment.md`)**:
   - Jika ada rute cron baru atau background task, daftarkan ke `docker/crontab` dan perbarui `ai-agent-docs/deployment.md`.
   - Jika ada perubahan port, volume, atau dependensi sistem OS, dokumentasikan di `ai-agent-docs/deployment.md`.

---

## 5. Protokol Git Branching, Commit, PR & Squash Merge

Untuk menjaga integritas dan kebersihan riwayat repositori, seluruh AI Agent **WAJIB** menerapkan model percabangan 3-tingkat: `main` (Production) $\leftarrow$ `staging` (Staging / Pre-Production) $\leftarrow$ `feat/*`, `fix/*`, `refactor/*`, `docs/*`, `chore/*`:

### 1. Larangan Commit Langsung ke `main` dan `staging`

- Branch `main` diproteksi sebagai representasi kode produksi yang stabil (auto-deploy ke production VPS stack).
- Branch `staging` diproteksi sebagai representasi lingkungan staging terintegrasi (auto-deploy ke staging VPS stack).
- **DILARANG KERAS** menjalankan `git commit` langsung saat berada di branch `main` maupun `staging`.
- **DILARANG KERAS** membuat PR langsung ke `main` untuk penanganan task atau fitur reguler.

### 2. Standar Alur Kerja (Branch from Staging -> Commit -> PR to Staging -> Squash & Merge -> Promotion to Main)

1. **Pemeriksaan Branch Awal & Fetch**:
   ```bash
   git status
   git fetch origin
   ```
2. **Pembuatan Branch Baru dari `origin/staging`**:
   Buat branch baru dari `origin/staging` terkini dengan format prefix yang sesuai:
   - `git checkout -b feat/<nama-fitur> origin/staging` (untuk penambahan fitur baru)
   - `git checkout -b fix/<deskripsi-bug> origin/staging` (untuk perbaikan bug)
   - `git checkout -b refactor/<komponen> origin/staging` (untuk restrukturisasi kode)
   - `git checkout -b docs/<nama-dokumen> origin/staging` (untuk pembaruan dokumentasi)
   - `git checkout -b chore/<nama-tugas> origin/staging` (untuk pemeliharaan dependensi/infrastruktur)
3. **Pengerjaan & Pengujian**:
   Implementasikan kode, cari dan perbarui skenario test terkait, jalankan formatter, linter, typecheck, dan unit test.
4. **Commit pada Branch Kerja**:
   Lakukan commit pada branch kerja yang baru dibuat dengan pesan Conventional Commits yang deskriptif:
   ```bash
   git add <file-terkait>
   git commit -m "fix(calculator): overhaul admin layout and fix double active menu"
   ```
5. **Pengajuan Pull Request (PR) ke `staging`**:
   Buat Pull Request dari branch kerja menuju branch **`staging`** (`base: staging`, `compare: feat/...`).
6. **Squash and Merge ke `staging`**:
   Saat menggabungkan PR ke `staging`, **WAJIB** menggunakan metode **Squash and Merge**. Penggabungan ke `staging` secara otomatis memicu pipeline CI/CD GitHub Actions untuk membangun image Docker dengan tag `:staging` dan men-deploy secara otomatis ke direktori VPS `/opt/docker-stack/applications/aldera-tech-staging` (`staging.aldera.tech`).
7. **Promosi Teruji ke `main`**:
   Promosi dari `staging` ke `main` hanya dilakukan melalui Release PR (`base: main`, `compare: staging`) setelah seluruh fungsi diverifikasi beroperasi normal pada stack staging. Push/merge ke `main` memicu build image `:latest` dan deployment ke stack produksi.

---

## 6. Protokol Pemetaan & Pemeliharaan Test (Test Mapping & Maintenance Protocol)

Setiap perubahan kode berpotensi memengaruhi fungsi yang sudah ada atau menimbulkan regresi. Oleh karena itu, pengujian wajib diperlakukan sebagai warga kelas satu (_first-class citizen_):

### 1. Kewajiban Mencari Test Terkait (Test Mapping)

Sebelum atau sesaat setelah memodifikasi sebuah fungsi, utilitas, Server Action, API Route, atau komponen:

- Jalankan pencarian berkas test terkait:
  ```bash
  find . -name "*.test.*"
  # Atau cari referensi fungsi/simbol yang diubah di dalam file test:
  grep -rn "namaFungsiYangDiubah" lib/ tests/ app/ components/
  ```

### 2. Kewajiban Memperbarui Skenario Test

- **Jika logika/kontrak fungsi berubah**: Perbarui nilai ekspektasi (`expect(...)`) pada file test yang ada agar mencerminkan kontrak baru yang benar.
- **Jika memperbaiki bug keamanan / fungsional**: Tambahkan kasus uji baru (_regression test case_) yang secara spesifik menguji input yang sebelumnya menyebabkan kegagalan (misalnya: payload penyerang, signature palsu, input kosong, dsb.).
- **Jika menambah fitur/utilitas baru**: Buat file test baru (misal `path/to/modul.test.ts`) yang menguji skenario positif (_happy path_), skenario negatif (_error handling_), dan batasan nilai (_boundary values_).

### 3. Eksekusi Mandiri & Verifikasi 100% Lulus

- Jalankan test modul yang bersangkutan terlebih dahulu:
  ```bash
  bun test path/to/modul.test.ts
  ```
- Sebelum menyelesaikan task, jalankan seluruh test suite repositori:
  ```bash
  bun test
  ```
- Seluruh pengujian wajib berstatus **PASS (0 fail)**. Dilarang meninggalkan test yang gagal, di-skip tanpa alasan kuat, atau di-komentari (_commented out_).

### 4. Protokol Wajib UI Testing untuk Setiap Komponen & Halaman

Setiap pembuatan atau modifikasi antarmuka pengguna **WAJIB** menyertakan atau memperbarui file pengujian UI (`*.test.tsx` / `*.test.ts`):

- **Co-location Wajib**: Letakkan file pengujian tepat di samping file UI yang bersangkutan (contoh: `app/(public)/ai-relay/page.test.tsx`, `components/dashboard/sidebar.test.ts`).
- **Cakupan Pengujian Wajib**:
  1. **Validitas Elemen & Props JSX**: Komponen merender elemen JSX yang valid dan menerima initial data.
  2. **SEO Metadata (RSC Page)**: Memverifikasi `metadata.title`, `metadata.description`, dan canonical URL.
  3. **Zero Hardcoded Routes**: Seluruh tautan dan aksi navigasi mengimpor rute dari `lib/routes.ts`.
  4. **The 4 UI States**: Skeleton loading, Empty state (+ ikon & CTA), Error state (+ retry), Large dataset pagination.
  5. **Form Input Hygiene**: Placeholder kontekstual, bintang merah `*` pada label required, dan `(Opsional)` pada label optional.
  6. **URL State Synchronization**: Tab aktif (`?tab=`), filter/pencarian (`?q=`, `?category=`), dan paginasi (`?page=`).
  7. **Modal & Feedback**: Pelarangan native dialog `window.confirm/alert`, penggunaan `<ConfirmDialog>`, dan notifikasi toast `sonner`.
- Rincian panduan dan contoh implementasi UI test lengkap terdapat di [`ai-agent-docs/ui-testing.md`](ui-testing.md).

---

## 7. Template Output Laporan Akhir (Standard Completion Template)

AI Agent menyusun respon penutup task dengan format konsisten seperti contoh berikut:

```markdown
### Ringkasan Penyelesaian Task:

#### 1. Git Branching & PR Status:

- **Branch Aktif**: `feat/nama-fitur-baru` (dicabangkan dari `origin/staging`)
- **Status Workflow**: Siap diajukan Pull Request ke `staging` dengan strategi **Squash and Merge**. Promosi ke `main` via Release PR terverifikasi.

#### 2. Perubahan Berkas:

- **Modified**: `path/to/file1.ts`, `path/to/file2.tsx`
- **Created**: `path/to/new-file.ts`
- **Deleted**: `path/to/unused-file.ts` (pembersihan dead code)

#### 3. Pemetaan & Status Test:

- **File Test Terkait**: `path/to/modul.test.ts`
- **Pembaruan Test**: Menambahkan skenario uji regresi X dan memperbarui assertion Y.
- **Hasil Pengujian**: `bun test` -> **PASS (219 passed, 0 failed)**.

#### 4. Dokumentasi Diperbarui:

- `ai-agent-docs/roles-and-features.md` (disinkronkan dengan rute/fitur baru)
- `ai-agent-docs/code-quality.md`

#### 5. Status Verifikasi Teknis:

- Formatter (`bun run format`): **Applied**
- Typecheck (`tsc --noEmit`): **Passed (0 error)**
- Linter (`eslint`): **Passed (0 error)**
- Git Status: **Clean working tree** (pada branch kerja)
```
