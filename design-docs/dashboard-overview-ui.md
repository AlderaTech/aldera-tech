# UI Ringkasan pengguna Aldera Tech

## Batas tampilan

Konten Ringkasan aktif pada rute tepat `/dashboard`. `OverviewShell` memakai `usePathname` untuk memberi tema lokal pada wrapper aplikasi; konten tetap dirender oleh server. Sidebar dan header memakai tema studio pada Ringkasan, daftar `/dashboard/projects`, riwayat `/dashboard/orders`, `/dashboard/calculator`, `/dashboard/ai-relay`, `/dashboard/invoices`, `/dashboard/profile`, dan `/dashboard/settings` melalui `getStudioDashboardSection`, dengan konfigurasi navigasi bertipe `client`. Halaman detail proyek dan rute lain mempertahankan tampilannya masing-masing. Rincian tersedia di [UI Proyek Saya](dashboard-projects-ui.md), [UI Pesanan & Estimasi](dashboard-orders-ui.md), [UI Kalkulator](dashboard-calculator-ui.md), [UI AI Relay](dashboard-ai-relay-ui.md), [UI Invoice & Pembayaran](dashboard-invoices-ui.md), [UI Profil Saya](dashboard-profile-ui.md), dan [UI Pengaturan](dashboard-settings-ui.md).

Palet memakai navy `#102651`, biru `#245FE5`, putih, gradasi biru-es/slate, serta pastel peach/cyan. Tipografi Plus Jakarta Sans, radius, border, bayangan, dan fokus mengikuti identitas Login/Register. Seluruh token tema didefinisikan dalam CSS Module dan tidak diterapkan pada root global.

## Susunan halaman

- Sambutan berisi avatar/fallback inisial, nama dan email dari sesi aktif, deskripsi, serta tautan profil. Maskot kecil memakai [aset Register](../public/images/auth/aldera-cat-register.webp) dengan static import, `next/image`, sizes responsif, kualitas 90, dan lazy loading; tersembunyi pada HP serta dekoratif.
- Statistik Proyek Aktif, Invoice Pending, dan Total Dibayarkan berada dalam tiga kartu sejajar. Pada lebar di bawah 380px kartu disusun vertikal. Format rupiah dan nilai nol mengikuti implementasi semula; wrapper counter lokal menonaktifkan animasi ketika reduced motion aktif.
- Onboarding menampilkan ringkasan selesai/total, persentase, progress native yang aksesibel, dan empat langkah asli. Langkah selesai memakai ikon centang dan aksen hijau lembut. Tautan tindakan pada langkah yang belum selesai dipertahankan.
- Proyek terbaru menampilkan nama, badge status, milestone berikutnya beserta tanggal jika tersedia, progres, dan tanggal pembaruan dari data asli. Tidak ada thumbnail proyek dalam sumber data ini, sehingga kartu memakai ikon folder. Seluruh kartu menuju detail proyek yang sama.
- Aktivitas tampil pada kolom kanan sebagai timeline vertikal. Deskripsi, proyek, tanggal, dan jam memakai log asli. Empty state proyek dan aktivitas memiliki tautan ke tindakan yang tersedia.
- Dua kolom aktif mulai 1280px; tablet dan HP memakai urutan vertikal. Navigasi mobile Sheet, command palette, notifikasi yang sudah tersedia, serta dropdown akun tetap memakai komponennya sendiri. Tidak ada grafik, tren, filter, metrik, kontrol, atau integrasi baru.

## Sumber data dan progres

Query serta fallback `safeDb` pada `app/dashboard/page.tsx` dipertahankan:

| Bagian           | Sumber dan aturan                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Proyek Aktif     | Jumlah proyek milik pengguna berstatus `IN_PROGRESS` atau `REVIEW`                        |
| Invoice Pending  | Jumlah invoice pengguna berstatus `SENT` atau `OVERDUE`                                   |
| Total Dibayarkan | Jumlah `total` invoice pengguna berstatus `PAID`, dikonversi menjadi number; fallback nol |
| Proyek Terbaru   | Maksimal tiga proyek pengguna, urut `updatedAt` menurun, dengan satu milestone berikutnya |
| Aktivitas        | Maksimal enam log pada proyek pengguna, urut `createdAt` menurun                          |

Onboarding tetap menjalankan query profil, jumlah proyek, pesan pengguna pada proyeknya, dan invoice dibayar. Profil selesai ditentukan oleh keberadaan nomor telepon, sesuai logika semula. Langkah lainnya ditentukan oleh jumlah data lebih dari nol. Persentase tetap `Math.round((completed / total) * 100)`; panel tetap tidak ditampilkan setelah seluruh langkah selesai. Data Prisma tetap berada di server; counter hanya menerima nilai number.

## Berkas

| Status                 | Berkas                                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diubah                 | `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`                                                                                                       |
| Diubah                 | `components/dashboard/sidebar.tsx`, `components/dashboard/dashboard-header.tsx`                                                                            |
| Baru                   | `components/dashboard/overview-chrome.module.css`                                                                                                          |
| Baru                   | `app/dashboard/_components/overview-shell.tsx`, `overview-welcome.tsx`, `overview-stats.tsx`, `overview-counter.tsx`                                       |
| Baru                   | `app/dashboard/_components/overview-projects.tsx`, `overview-activity.tsx`                                                                                 |
| Baru                   | `app/dashboard/_components/overview.module.css`, `overview-projects.module.css`, `overview-activity.module.css`, `overview-onboarding.module.css`          |
| Dipindah dan dirapikan | `components/dashboard/onboarding-checklist.tsx` ke `app/dashboard/_components/onboarding-checklist.tsx`; modul lama dihapus karena hanya dipakai Ringkasan |
| Dokumentasi            | `design-docs/dashboard-overview-ui.md`, `ai-agent-docs/brand-context.md`                                                                                   |

## Pemeriksaan

- Lint terarah, formatter, Next.js typegen, dan typecheck digunakan untuk verifikasi kode.
- Perbandingan isi fungsi terhadap sumber awal memastikan query Ringkasan, query onboarding, langkah, persentase, serta kondisi selesai tidak berubah.
- Browser desktop/tablet/HP pada lebar 1440, 1280, 1024, 768, 390, dan 320px: tidak ada overflow horizontal, statistik sesuai database akun uji, seluruh empat langkah terlihat, dan onboarding 1/4 menampilkan 25%.
- Akun uji belum memiliki proyek atau aktivitas; kedua empty state diverifikasi. Data tidak diisi atau diganti dengan dummy untuk keperluan tampilan.
- Menu mobile terbuka, menandai Ringkasan aktif, dan menutup setelah navigasi. Pencarian membuka command palette; dropdown akun dapat dibuka dengan keyboard. Fokus pada tautan onboarding terlihat jelas.
- Seluruh tujuan navigasi pengguna dapat dibuka. Token tema lokal dan lebar sidebar studio aktif hanya pada rute tepat yang tercantum dalam batas tampilan di atas; rute lain mempertahankan tema semula.
- Reduced motion mematikan animasi masuk dan menampilkan nilai counter langsung. Skeleton dibatasi lebar container melalui scope Ringkasan; loading/error serta mekanisme komponen lain tetap dipertahankan.
- Tidak ada perubahan data, pengiriman pesan, transaksi, test suite, atau build produksi dalam pekerjaan UI ini.
