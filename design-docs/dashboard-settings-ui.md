# UI Pengaturan dashboard Aldera Tech

## Cakupan dan kemampuan yang tersedia

Rute `/dashboard/settings` memakai tema studio dashboard, tipografi Plus Jakarta Sans, kartu putih solid, border navy 18%, teks sekunder navy 72%, serta aksen biru elektrik. Sidebar dan header memakai varian studio hanya pada rute tepat melalui `getStudioDashboardSection`. Halaman Profil, halaman detail, serta halaman admin mempertahankan tampilannya masing-masing.

Penanda Pengaturan pada footer sidebar menggunakan pill biru dengan teks putih. Selector status aktif menyamai specificity selector warna default footer agar teks tetap terbaca; footer tidak aktif pada halaman dashboard lain.

Halaman ini bersifat informasional. Implementasi belum menyediakan pengaturan notifikasi pengguna, field preferensi, endpoint pembaruan, atau mekanisme penyimpanan pengaturan. Panel Notifikasi mempertahankan pesan “Pengaturan notifikasi email akan hadir sebentar lagi.” dan memperjelas status “Belum tersedia”. Tidak ada switch, tombol Simpan, autosave, nilai preferensi contoh, maupun konfirmasi tersimpan.

Panel Informasi akun tampil pertama dan menyediakan satu tautan **Kelola Profil** ke `DASHBOARD_ROUTES.profile`. Dua baris informasi menjelaskan nama lengkap dan nomor telepon yang dapat dikelola melalui formulir Profil yang sudah tersedia. Baris tersebut berupa daftar informasional, bukan input atau nilai profil contoh. Halaman Pengaturan tidak menduplikasi formulir atau menampilkan data identitas buatan. Autentikasi tetap ditangani layout dashboard yang sama.

## Komposisi dan aksesibilitas

- Header ringkas berisi ikon, label Akun & preferensi, judul Pengaturan, dan deskripsi singkat. Pada area lebar, deskripsi berada di kanan judul; pada area sempit, deskripsi berada di bawahnya.
- Panel Informasi akun di kiri dan Notifikasi di kanan memakai proporsi 1,1:1 mulai lebar container 54rem. Keduanya berada dalam satu baris grid dengan tepi bawah sejajar, tanpa fixed height atau min-height. Pada area konten yang lebih sempit, panel tersusun vertikal dengan Profil terlebih dahulu.
- Informasi utama memakai teks 14–15px; judul panel 20px dan label status 12px. Panel putih, radius 24px, border yang terlihat, serta bayangan lembut membedakannya dari canvas dashboard.
- Orbit dan garis diagonal pada sudut panel Profil serta grid pada panel Notifikasi bersifat statis. Pseudo-element berada di belakang isi dengan `pointer-events: none`; opacity dikurangi pada HP.
- Ikon dan mini maskot bersifat dekoratif. Maskot memakai aset asisten AI Relay yang sudah tersedia, area gambar 112 × 128px dengan `object-contain`, `next/image`, lazy loading, dan disembunyikan di bawah 640px. Lingkaran lembut serta ikon amplop menjadi aksen di sekitar maskot. Tidak ada aset baru atau dependensi baru.
- Kedua panel memiliki heading serta `aria-labelledby`; status ketersediaan menggunakan teks, bukan hanya warna.
- CTA Profil memenuhi lebar kartu, memiliki area sentuh minimal 48px, fokus keyboard yang jelas, dan transisi yang dinonaktifkan pada reduced motion.
- CSS Module lokal menggunakan token `--overview-*` yang sudah tersedia tanpa mengubah CSS global atau bergantung pada stylesheet halaman Proyek.

## Pengujian

UI test berada di `app/dashboard/settings/page.test.tsx`, `_components/settings-overview.test.tsx`, dan `components/dashboard/studio-dashboard-routes.test.ts`. Cakupannya meliputi rendering, metadata, status belum tersedia, satu tautan Profil, urutan panel, dua informasi field yang didukung, tidak adanya kontrol/penyimpanan palsu, dekorasi, serta isolasi tema pada rute tepat. Test sidebar yang sudah tersedia menjadi pemeriksaan regresi navigasi. Tujuh test Pengaturan dan delapan test navigasi lulus. Formatter terarah, ESLint, Next.js typegen, dan TypeScript lulus.

Halaman ini tidak mengambil daftar data atau menyimpan pengaturan, sehingga pagination, sinkronisasi filter URL, validasi field, skeleton data, dan status penyimpanan tidak berlaku. Pratinjau browser memakai HTML SSR serta stylesheet Next.js dari server lokal dan sesi klien sementara. Sesi uji tidak membuat akun, memperbarui profil, memanggil mutasi, atau mengubah pengaturan akun produksi.

Pratinjau desktop, tablet, dan HP tidak menghasilkan overflow horizontal. Pemeriksaan mencakup panel putih, font utama 14px, urutan panel, tombol 48px, target Profil, fokus yang terlihat, gambar maskot yang berhasil dimuat, dan transisi nol saat reduced motion aktif. Klik CTA dicegat dalam preview untuk memeriksa target rute tanpa memperbarui profil. Tidak ada mekanisme penyimpanan pada halaman ini yang perlu disimulasikan. Suite integrasi backend memerlukan lingkungan Router DB tersendiri dan tidak dijalankan untuk tugas presentasi ini.
