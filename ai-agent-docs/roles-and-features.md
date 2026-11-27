# Model akses dan batas fitur

Dokumen ini mencatat model otorisasi dan batas keamanan yang perlu dipahami lintas fitur. Daftar route dan permission yang lengkap tidak disalin di sini karena sumber kebenarannya berada di kode.

## Sumber kebenaran

- Role yang disimpan dan relasinya: `prisma/schema.prisma`.
- Konstanta permission, role aktif, dan pemetaan akses: `lib/permissions.ts`.
- Path dan builder route: `lib/routes.ts`.
- Batas awal request web: `middleware.ts`. Otorisasi server per tindakan tetap wajib.
- Invarian pembayaran, sesi, file, dan integrasi: [backend-integrity.md](backend-integrity.md).

## Model role

Role aktif adalah `ADMIN`, `DEVELOPER`, dan `CLIENT`. Nilai role lama yang masih ada di enum database hanya untuk kompatibilitas data; jangan menambahkannya sebagai role aktif tanpa migrasi kebijakan dan test.

Akun dapat memiliki beberapa role aktif. Permission efektif merupakan gabungan permission dari role tersebut. Gunakan helper dari `lib/permissions.ts` untuk pemeriksaan; jangan membandingkan string role secara ad hoc jika keputusan bergantung pada permission tertentu.

Secara umum:

| Batas       | Cakupan                                                                               |
| ----------- | ------------------------------------------------------------------------------------- |
| `ADMIN`     | Operasi administrasi, keuangan, konfigurasi, audit, serta pengelolaan konten dan tim. |
| `DEVELOPER` | Delivery proyek, timesheet, berkas proyek, dan tugas staf yang diizinkan.             |
| `CLIENT`    | Data proyek, pesanan, tagihan, dan profil milik akun itu sendiri.                     |
| Guest       | Halaman publik dan proposal yang dibuka dengan token yang sah.                        |

Rincian menu dapat berubah mengikuti implementasi. Jangan memakai tabel navigasi sebagai pengganti pemeriksaan server.

## Aturan otorisasi

- Middleware hanya membatasi area awal. Setiap Server Action, Route Handler, dan operasi data sensitif harus memeriksa sesi, permission tindakan, dan kepemilikan objek di server.
- Menyembunyikan tombol atau menu bukan kontrol keamanan.
- Baca dan tulis data klien harus membatasi query pada pemilik yang benar. Pengecualian staf harus mengikuti permission yang ditetapkan.
- Akses unduhan file memakai scope dan pemeriksaan kepemilikan server; URL lama tidak boleh melewati kontrol tersebut.
- Perubahan role atau permission perlu test regresi untuk akses yang diizinkan dan ditolak.

## Perubahan fitur

Jangan memelihara inventaris fitur atau salinan matriks route di dokumen ini. Gunakan implementasi route, navigasi, schema, dan permission sebagai sumber utama. Perbarui dokumen ini hanya ketika model role, prinsip authorization, atau batas kepemilikan berubah.
