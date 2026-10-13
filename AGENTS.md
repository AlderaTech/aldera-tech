<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Task Completion Rules & Protocols

Setiap AI Agent yang bekerja pada repositori ini **WAJIB** mematuhi aturan dan protokol berikut sebelum menyatakan suatu tugas selesai (*task completion*). Rincian panduan operasional (SOP) lengkap terdapat di [`docs/agent-workflow.md`](file:///home/alfiang/Projects/solvo-tech/docs/agent-workflow.md).

## 1. Pembaruan Dokumentasi (Documentation Sync)
- **Wajib** memperbarui file dokumentasi (pada folder `docs/` atau file markdown terkait seperti `docs/roles-and-features.md`) yang terdampak atau tidak lagi relevan akibat perubahan kode.
- Pastikan dokumentasi selalu merefleksikan kondisi aktif sistem (*present state*), bukan riwayat atau sejarah perubahan lama.

## 2. Pembersihan File & Kode Usang (Dead Code & Artifact Cleanup)
- **Wajib** menghapus file, folder, komponen, rute, atau skrip yang sudah tidak digunakan lagi (*dead code/unused files*) terkait perubahan task saat itu.
- Dilarang meninggalkan file sementara (*temporary scratch files*), file tes coba-coba, atau artefak yang tidak sengaja terbuat.

## 3. Larangan Commit Otomatis (No Auto-Commit / No Auto-Push)
- **DILARANG** menjalankan perintah `git commit` atau `git push` kecuali jika diminta secara eksplisit oleh pengguna.
- Biarkan perubahan berada dalam status *unstaged/staged* agar pengguna dapat meninjau diff secara mandiri.

## 4. Batasan Eksekusi Test & Build (No Auto-Test / No Auto-Build)
- **DILARANG** menjalankan test otomatis (`bun test`, `npm test`, dll.) atau build produksi (`next build`, `bun run build`) tanpa persetujuan pengguna.
- AI **boleh dan disarankan menawarkan/bertanya** kepada pengguna: *"Apakah Anda ingin saya menjalankan test suite atau build untuk memverifikasi?"*, dan menjalankannya **hanya jika** pengguna menyetujuinya.
- Perintah verifikasi non-test dan non-build **diizinkan dan dianjurkan** dijalankan secara mandiri:
  - Linter: `bun run lint` (atau `eslint`)
  - Formatter: `prettier`
  - Typecheck: `bunx tsc --noEmit`

## 5. Pemeriksaan Integritas Git Status (Clean Working Tree)
- Sebelum menyatakan selesai, AI **wajib** menjalankan `git status` untuk memeriksa dan memastikan hanya file yang dimaksud yang tersentuh, serta tidak ada file sampah *untracked* yang tertinggal.

## 6. Keamanan & Sinkronisasi Environment Variables
- Jika ada penambahan variabel lingkungan (*env var*) baru, **wajib** mencatatnya di [`.env.example`](file:///home/alfiang/Projects/solvo-tech/.env.example) beserta komentar penjelasan.
- **Dilarang** menimpa, menghapus, atau membocorkan kredensial rahasia pada file `.env` tanpa instruksi eksplisit pengguna.

## 7. Format Laporan Akhir Terstandarisasi (Standard Completion Summary)
Setiap kali menyelesaikan task, berikan ringkasan terstruktur yang memuat:
- **Perubahan File**: Daftar file yang dimodifikasi, dibuat, dan dihapus.
- **Dokumentasi yang Diperbarui**: Daftar file dokumentasi yang disinkronkan.
- **Status Verifikasi**: Hasil linter / typecheck.
- **Tawaran Verifikasi Lanjutan**: Menawarkan apakah pengguna ingin menjalankan test atau build.
