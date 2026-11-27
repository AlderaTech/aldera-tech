# Alur kerja AI Agent

## Memulai task

- Baca [AGENTS.md](../AGENTS.md), lalu hanya panduan topik yang relevan dari [indeks dokumentasi](README.md).
- Cari implementasi dan test yang ada sebelum mengubah kode. Jangan membuat dokumen baru jika sudah ada sumber kanonis untuk topik tersebut.

## Branch dan pull request

- Ambil branch kerja dari `origin/staging`, dengan prefix `feat/`, `fix/`, `refactor/`, `docs/`, atau `chore/`.
- Jangan commit langsung ke `main` atau `staging`. Regular PR menargetkan `staging` dan digabung dengan Squash and Merge.
- Gunakan pesan Conventional Commit pada branch kerja.
- Promosi ke `main` hanya melalui Release PR setelah verifikasi staging.

## Perubahan kode dan test

- Petakan test yang memeriksa perilaku yang diubah. Perbarui test kontrak yang terdampak, tambah regresi untuk bug, dan tambah cakupan happy path serta batas penting untuk fitur baru.
- Jalankan `bun run test <path>` untuk test terarah atau `bun run test` untuk suite. Runner ini menyiapkan database sementara; lihat [testing-infrastructure.md](testing-infrastructure.md).
- Untuk perubahan UI, ikuti [ui-testing.md](ui-testing.md). Uji perilaku dan status yang memang didukung antarmuka, bukan kondisi yang tidak relevan.
- Jalankan formatter, lint, Next type generation, dan typecheck untuk perubahan kode. Jangan menjalankan production build kecuali diminta atau sebagai gerbang rilis.

## Sinkronisasi dokumen

- Perbarui dokumen kanonis yang sudah ada saat kontrak, kebijakan, atau arsitektur berubah.
- Jangan membuat laporan per-task di `ai-agent-docs/`, menambahkan manifest berkas, atau menyalin hasil test/CI ke beberapa dokumen.
- Jika agent mengusulkan file dokumentasi baru yang belum diminta pengguna, jangan buat dulu. Jelaskan preferensi repo untuk memperbarui dokumen kanonis, sebutkan path dan alasan file baru, berikan dokumen lama sebagai alternatif, lalu tanyakan pilihan pengguna. Contoh: “Panduan repo mengutamakan pembaruan dokumen kanonis dan menghindari file baru. Saya mengusulkan `<path>` karena `<alasan>`; alternatifnya memperbarui `<dokumen yang ada>`. Anda ingin file baru atau perubahan pada dokumen yang ada?”
- Permintaan eksplisit pengguna untuk membuat file baru sudah merupakan konfirmasi; jangan meminta konfirmasi yang sama sekali lagi.
- Catat hasil yang berubah setiap eksekusi di PR/CI. Dokumen release-readiness boleh menyimpan satu snapshot operasional bila ada pemilik dan tanggal review; selalu tandai tanggal pemeriksaan.
- Jika dokumen dipindah atau dihapus, perbarui tautan masuk dan [indeks](README.md). Simpan rincian historis di Git, bukan di panduan aktif.

## Penutupan task

Sebelum selesai, tinjau `git diff --check` dan `git status`. Laporkan branch, status perubahan/PR, berkas yang berubah, test relevan, dokumen yang disinkronkan, serta hasil pemeriksaan. Jangan menyalin manifest lengkap ke dokumen proyek.
