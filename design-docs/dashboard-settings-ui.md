# UI Pengaturan dashboard Aldera Tech

## Cakupan dan kemampuan yang tersedia

Rute `/dashboard/settings` memakai tema studio dashboard, tipografi Plus Jakarta Sans, kartu putih, gradasi biru es, dan aksen biru elektrik. Sidebar dan header memakai varian studio hanya pada rute tepat melalui `getStudioDashboardSection`. Halaman Profil, halaman detail, serta halaman admin mempertahankan tampilannya masing-masing.

Penanda Pengaturan pada footer sidebar menggunakan pill biru dengan teks putih. Selector status aktif menyamai specificity selector warna default footer agar teks tetap terbaca; footer tidak aktif pada halaman dashboard lain.

Halaman ini bersifat informasional. Implementasi belum menyediakan pengaturan notifikasi pengguna, field preferensi, endpoint pembaruan, atau mekanisme penyimpanan pengaturan. Panel Notifikasi mempertahankan pesan “Pengaturan notifikasi email akan hadir sebentar lagi.” dan memperjelas status “Belum tersedia”. Tidak ada switch, tombol Simpan, autosave, nilai preferensi contoh, maupun konfirmasi tersimpan.

Panel Informasi akun menyediakan satu tautan **Kelola Profil** ke `DASHBOARD_ROUTES.profile`. Nama lengkap dan nomor telepon dikelola melalui formulir Profil yang sudah tersedia; halaman Pengaturan tidak menduplikasi formulir atau menampilkan data identitas buatan. Autentikasi tetap ditangani layout dashboard yang sama.

## Komposisi dan aksesibilitas

- Header ringkas berisi judul Pengaturan dan deskripsi singkat.
- Pada desktop/tablet mulai 768px, panel Notifikasi dan Informasi akun ditata dua kolom dengan proporsi 1,65:1; pada HP susunannya vertikal.
- Ikon dan mini maskot bersifat dekoratif. Maskot memakai aset asisten AI Relay yang sudah tersedia, ukuran tetap 112px, `next/image`, lazy loading, dan disembunyikan di bawah 640px. Tidak ada aset baru atau dependensi baru.
- Kedua panel memiliki heading serta `aria-labelledby`; status ketersediaan menggunakan teks, bukan hanya warna.
- CTA Profil memiliki area sentuh minimal 44px, fokus keyboard yang jelas, dan transisi yang dinonaktifkan pada reduced motion.
- CSS Module menggunakan token `--overview-*` yang sudah tersedia tanpa mengubah CSS global.

## Pengujian

UI test berada di `app/dashboard/settings/page.test.tsx`, `_components/settings-overview.test.tsx`, dan `components/dashboard/studio-dashboard-routes.test.ts`. Cakupannya meliputi rendering, metadata, status belum tersedia, tautan Profil, tidak adanya kontrol/penyimpanan palsu, dekorasi, serta isolasi tema pada rute tepat. Test sidebar yang sudah tersedia menjadi pemeriksaan regresi navigasi.

Halaman ini tidak mengambil daftar data atau menyimpan pengaturan, sehingga pagination, sinkronisasi filter URL, validasi field, skeleton data, dan status penyimpanan tidak berlaku. Pemeriksaan browser memakai sesi klien sementara (mock) pada server lokal; akun bawaan `client@aldera.tech` belum tersedia dalam database lokal. Sesi uji tidak membuat akun, memperbarui profil, memanggil mutasi, atau mengubah pengaturan akun produksi.

Rendering pada 320, 390, 768, 1024, 1280, dan 1440px tidak menghasilkan overflow horizontal. Navigasi mobile, penanda aktif Pengaturan, fokus keyboard dan Enter pada CTA Profil, reduced motion, serta status belum tersedia setelah reload diperiksa melalui browser. Test Pengaturan, navigasi, dan regresi Invoice lulus. Suite lengkap masih memiliki kegagalan integrasi AI Relay pada fungsi ledger/trigger PostgreSQL yang tidak tersedia dalam lingkungan lokal; suite lengkap belum dapat dinyatakan lulus.
