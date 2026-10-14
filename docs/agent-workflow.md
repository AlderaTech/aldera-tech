# Standard Operating Procedure (SOP): Alur Kerja & Penyelesaian Task AI Agent

Dokumen ini merupakan panduan operasional standar (_Standard Operating Procedure_) bagi AI Agent yang bekerja pada repositori Aldera Tech. Dokumen ini merinci langkah-langkah wajib yang harus dieksekusi sebelum dan sesudah menyelesaikan setiap tugas (_task_).

---

## 1. Matriks Batasan Eksekusi Perintah (Command Execution Boundaries)

Tabel berikut menentukan perintah apa saja yang boleh dijalankan otomatis oleh AI Agent dan perintah apa yang memerlukan konfirmasi eksplisit dari pengguna:

| Kategori Perintah      | Contoh Perintah                          | Boleh Dijalankan Otomatis? | Keterangan & Aturan                                                                                   |
| :--------------------- | :--------------------------------------- | :------------------------: | :---------------------------------------------------------------------------------------------------- |
| **Typecheck**          | `bunx tsc --noEmit`                      |         ✅ **YA**          | Wajib dijalankan untuk memastikan tidak ada error kompilasi/tipe.                                     |
| **Linter**             | `bun run lint`, `eslint .`               |         ✅ **YA**          | Diizinkan untuk memastikan kepatuhan standar kode.                                                    |
| **Formatter**          | `bun run format`, `prettier --write ...` |         ✅ **YA**          | **Wajib dijalankan** setelah selesai mengedit kode untuk merapikan kode & mengurutkan class Tailwind. |
| **Pemeriksaan Status** | `git status`, `git diff`                 |         ✅ **YA**          | Wajib dijalankan sebelum menyelesaikan turn/task.                                                     |
| **Generasi Skema**     | `bun run db:generate`                    |         ✅ **YA**          | Dijalankan saat ada perubahan pada `prisma/schema.prisma`.                                            |
| **Pembersihan File**   | `rm ...`, file deletion                  |         ✅ **YA**          | Wajib untuk membersihkan dead code / scratch files terkait task.                                      |
| **Automated Testing**  | `bun test`, `npm test`                   |        ❌ **TIDAK**        | **Dilarang otomatis**. Tanyakan terlebih dahulu kepada pengguna.                                      |
| **Production Build**   | `bun run build`, `next build`            |        ❌ **TIDAK**        | **Dilarang otomatis**. Tanyakan terlebih dahulu kepada pengguna.                                      |
| **Git Commit**         | `git commit -m "..."`                    |        ❌ **TIDAK**        | **Dilarang otomatis**. Jalankan hanya jika diminta user.                                              |
| **Git Push**           | `git push ...`                           |        ❌ **TIDAK**        | **Dilarang otomatis**. Jalankan hanya jika diminta user.                                              |

---

## 2. Checklist Wajib Penyelesaian Task (Task Completion Checklist)

Setiap AI Agent wajib memeriksa seluruh checklist berikut sebelum menyatakan bahwa tugas telah selesai:

```
[ ] 1. Kode & Perubahan Utama Selesai
    - Fitur/perbaikan telah diimplementasikan sesuai kebutuhan pengguna.
    - Menjaga integritas komentar dan kode yang tidak terkait.

[ ] 2. Kepatuhan Standar Kualitas Kode (Code Quality Audit)
    - Mematuhi 13 prinsip di `docs/code-quality.md`.
    - Tidak ada fat file (>200–250 baris) yang belum diekstrak ke sub-komponen/hooks.
    - Logika state/mutasi form telah dipisahkan dari tampilan UI (menggunakan custom hooks).
    - Tidak ada penggunaan tipe `any` (kebijakan zero-any dipatuhi).
    - Validasi data form/action dipusatkan di `lib/validations/`.
    - Seluruh link, tombol navigasi, redirect, dan pemanggilan API internal mengimpor konstanta dari `lib/routes.ts` (Zero Hardcoded Routes).
    - Tidak ada URI/path absolut mesin (`file:///...`, `/home/...`) di dalam file kode maupun dokumentasi git (Portability Check).

[ ] 3. Pembersihan Kode & File Usang (Dead Code & Cleanup)
    - File/folder lama yang digantikan telah dihapus.
    - File scratch/temporer yang dibuat selama investigasi telah dibersihkan.
    - Import yang tidak lagi digunakan (unused imports) telah dihapus.

[ ] 4. Sinkronisasi Dokumentasi Proyek (Docs Sync)
    - Memeriksa folder `docs/` dan file markdown terkait.
    - Jika ada perubahan peran/rute, perbarui `docs/roles-and-features.md`.
    - Jika ada penyesuaian arsitektur/standar, perbarui `docs/code-quality.md`.
    - Dokumentasi harus selalu mendeskripsikan kondisi sistem saat ini (tanpa riwayat masa lalu).

[ ] 5. Keamanan & Environment Variables
    - Jika ada env var baru, tambahkan ke `.env.example` beserta deskripsi singkatnya.
    - Tidak menimpa atau membocorkan isi kredensial di `.env`.

[ ] 6. Sinkronisasi Deployment & Docker (Infrastructure Sync)
    - Jika ada penambahan cron job baru, dependensi OS, port, atau volume persistensi, perbarui berkas terkait di folder `docker/`.
    - Perbarui dan sinkronkan panduan `docs/deployment.md`.

[ ] 7. Verifikasi Non-Build / Non-Test (Wajib)
    - Jalankan `bun run format` untuk merapikan kode & mengurutkan kelas Tailwind.
    - Jalankan `bunx tsc --noEmit` untuk memastikan 0 error tipe TypeScript.
    - Jalankan `bun run lint` jika relevan untuk membersihkan warning/error.

[ ] 8. Pemeriksaan Integritas Git (Git Status Check)
    - Jalankan `git status` untuk meninjau status direktori kerja.
    - Pastikan tidak ada file `untracked` yang tidak diinginkan tertinggal.
    - JANGAN menjalankan `git commit` kecuali diminta eksplisit oleh user.

[ ] 9. Laporan Ringkasan Terstandarisasi
    - Tampilkan ringkasan file yang disentuh (Modified, Created, Deleted).
    - Tampilkan status dokumen yang disinkronkan.
    - Tampilkan hasil verifikasi linter, formatter, dan typecheck.
    - Tanyakan apakah pengguna ingin menjalankan `test` atau `build`.
```

---

## 3. Protokol Pembersihan Berkas & Dead Code

Ketika melakukan refaktor, perampingan fitur, atau migrasi kode:

1. **Identifikasi Ketergantungan**: Cari seluruh referensi file/komponen yang akan dihapus menggunakan perintah grep atau file search.
2. **Hapus File Utama**: Hapus file komponen, rute, hook, atau utilitas yang sudah tidak digunakan.
3. **Bersihkan File Pendukung**: Hapus folder direktori kosong jika seluruh file di dalamnya sudah dihapus.
4. **Hapus File Uji Coba**: Hapus file scratch (misal `temp_test.js`, file output tes lokal) yang dibuat selama proses pengerjaan.

---

## 4. Protokol Pemeliharaan Dokumentasi (`docs/`)

Dokumentasi dalam folder `docs/` dirancang agar dapat dikonsumsi oleh manusia maupun agen AI lain di masa mendatang:

1. **Selalu Merefleksikan Status Aktif (_Present State Only_)**:
   - Dilarang menuliskan riwayat historis seperti _"Dahulu fitur ini bernama X lalu digabung menjadi Y"_.
   - Tulis secara langsung dan tegas: _"Fitur X berfungsi untuk ..."_.
2. **Format Terstruktur & Deterministik**:
   - Gunakan tabel pemetaan, daftar bullet yang rapi, dan blok spesifikasi YAML/JSON.
   - Hindari deskripsi naratif yang panjang atau ambigu.
3. **Pembaruan Konsisten**:
   - Jika ada rute baru ditambahkan, masukkan ke tabel matriks otorisasi rute di `docs/roles-and-features.md`.
   - Jika ada izin (_permission_) baru ditambahkan, daftarkan di kamus izin sistem.
4. **Sinkronisasi Infrastruktur Deployment (`docs/deployment.md`)**:
   - Jika ada rute cron baru atau background task, daftarkan ke `docker/crontab` dan perbarui `docs/deployment.md`.
   - Jika ada perubahan port, volume, atau dependensi sistem OS, dokumentasikan di `docs/deployment.md`.

---

## 5. Template Output Laporan Akhir (Standard Completion Template)

AI Agent disarankan menyusun respon penutup task dengan format konsisten seperti contoh berikut:

```markdown
### Ringkasan Penyelesaian Task:

#### 1. Perubahan Berkas:

- **Modified**: `path/to/file1.ts`, `path/to/file2.tsx`
- **Created**: `path/to/new-file.ts`
- **Deleted**: `path/to/unused-file.ts` (pembersihan dead code)

#### 2. Dokumentasi Diperbarui:

- `docs/roles-and-features.md` (disinkronkan dengan rute/fitur baru)

#### 3. Status Verifikasi:

- Typecheck (`tsc --noEmit`): **Passed (0 error)**
- Linter (`eslint`): **Passed**
- Git Status: **Clean & verified** (tanpa auto-commit)

---

_Catatan: Sesuai protokol, test suite dan production build tidak dijalankan secara otomatis._
**Apakah Anda ingin saya menjalankan `bun test` atau `bun run build` untuk verifikasi lebih lanjut?**
```
