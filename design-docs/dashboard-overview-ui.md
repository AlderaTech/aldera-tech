# UI Ringkasan pengguna Aldera Tech

## Batas tampilan

Konten Ringkasan aktif pada rute tepat `/dashboard`. `OverviewShell` memakai `usePathname` untuk memberi tema lokal pada wrapper aplikasi; konten tetap dirender oleh server. Sidebar dan header memakai tema studio pada Ringkasan, daftar `/dashboard/projects`, riwayat `/dashboard/orders`, `/dashboard/calculator`, `/dashboard/ai-relay`, `/dashboard/invoices`, `/dashboard/profile`, dan `/dashboard/settings` melalui `getStudioDashboardSection`, dengan konfigurasi navigasi bertipe `client`. Halaman detail proyek dan rute lain mempertahankan tampilannya masing-masing. Rincian tersedia di [UI Proyek Saya](dashboard-projects-ui.md), [UI Pesanan & Estimasi](dashboard-orders-ui.md), [UI Kalkulator](dashboard-calculator-ui.md), [UI AI Relay](dashboard-ai-relay-ui.md), [UI Invoice & Pembayaran](dashboard-invoices-ui.md), [UI Profil Saya](dashboard-profile-ui.md), dan [UI Pengaturan](dashboard-settings-ui.md).

Ringkasan memakai latar abu-abu kebiruan yang rata, panel putih solid, border yang lebih jelas, serta bayangan halus. Navy dan biru mengikuti token studio; pastel biru/peach/cyan dibatasi pada ikon statistik. Teks sekunder dan garis panel diperkuat melalui token lokal pada wrapper halaman. Tipografi Plus Jakarta Sans, radius, dan fokus mengikuti identitas Login/Register. Tidak ada perubahan token global.

## Susunan halaman

Header bersama seluruh halaman pengguna tidak menampilkan breadcrumb `Workspace / nama halaman`. Judul tetap berada di area konten masing-masing halaman. Tombol sidebar mobile, pencarian, notifikasi, dan menu akun tetap memakai perilaku yang tersedia. Markup berada di `components/dashboard/dashboard-header.tsx` dengan tema `overview-chrome.module.css`. Test co-located `dashboard-header.test.tsx` memeriksa delapan halaman utama, detail proyek, serta keberadaan kontrol header pada konfigurasi pengguna dan admin.

Corak Ringkasan dibatasi oleh kelas `scope` pada `OverviewLayout` dan `overview-patterns.module.css`. Kartu sambutan memakai orbit/sirkuit dari `EmptyStatePattern` melalui varian kelas lokal, dengan aksen dikumpulkan di sisi kanan. Kartu statistik memiliki lingkaran dan titik kecil, sementara sudut panel onboarding, proyek, serta aktivitas memiliki garis diagonal yang memudar. Permukaan kartu tetap putih dengan border yang jelas. Seluruh dekorasi berada di belakang isi, tidak menghalangi pointer atau urutan fokus, dan statis; ukuran/opacity dikurangi pada HP. Gaya default corak empty state Projects/Orders mengikuti komponen bersama yang sama.

- Sambutan dan statistik memenuhi lebar konten sebelum area dua kolom. Sambutan berisi avatar/fallback inisial, nama dan email sesi, deskripsi, serta tautan profil. Maskot dekoratif memakai [aset Register](../public/images/auth/aldera-cat-register.webp), static import, `next/image`, kualitas 90, dan ukuran 80×96px; tersembunyi pada HP.
- Statistik Proyek Aktif, Invoice Pending, dan Total Dibayarkan berada dalam tiga kartu putih sejajar. Ikon kecil memiliki latar pastel; angka dan label berada di sebelahnya. Di bawah 640px kartu disusun vertikal. Format rupiah, animasi counter, nilai nol, serta reduced motion mengikuti mekanisme asli.
- Checklist Onboarding memenuhi lebar konten setelah statistik. Pada panel berlebar minimal 720px, pie chart berbentuk donat berada di kiri dan empat langkah di kanan. Chart hanya menggambarkan jumlah langkah selesai/belum selesai dan persentase yang diterima dari `OnboardingChecklist`; tidak ada query, statistik, atau perhitungan bisnis baru. Legenda menampilkan jumlah kedua kategori dan progress native tersembunyi secara visual tetap tersedia bagi pembaca layar. Pada panel lebih sempit, chart/legenda berada di atas daftar.
- Setiap langkah memiliki nomor atau ikon centang, judul, deskripsi, dan CTA asli. Status selesai ditandai teks serta warna; hanya langkah belum selesai pertama yang diberi label Berikutnya dan aksen biru. Tombol memiliki lebar konsisten di kanan pada desktop dan pindah ke bawah teks pada panel berlebar maksimal 480px, dengan tinggi area klik minimal 44px. Tidak ada pembatasan baru untuk mengakses CTA langkah lain.
- Pada desktop mulai 1280px, Proyek Terbaru dan Aktivitas berada dalam satu baris grid dengan proporsi 2:1. Tepi atas dan bawah sejajar mengikuti tinggi isi paling panjang pada baris tersebut, tanpa fixed height/min-height tambahan. Timeline aktivitas memakai ruang yang tersedia. Gap antarpanel 24px; sambutan, statistik, dan onboarding tetap memiliki tinggi sesuai isi masing-masing.
- Proyek terbaru menampilkan nama, badge status, milestone berikutnya beserta tanggal jika tersedia, progres, dan tanggal pembaruan dari data asli. Tidak ada thumbnail proyek dalam sumber data ini, sehingga kartu memakai ikon folder. Seluruh kartu menuju detail proyek yang sama.
- Aktivitas memakai timeline vertikal dengan deskripsi, proyek, tanggal, dan jam dari log asli. Empty state proyek/aktivitas memakai ikon 36px serta pesan dan CTA yang ringkas, rata kiri.
- Ketika kedua daftar kosong, dua empty state berada dalam satu baris desktop dengan proporsi 1:1 dan tinggi ringkas. Jika onboarding sudah tuntas, panelnya tetap tidak dirender sesuai mekanisme asli tanpa menyisakan kolom kosong. Tidak ada data yang disembunyikan atau ditambahkan.
- Tablet dan HP memakai satu kolom dengan urutan sambutan, statistik, onboarding, proyek, aktivitas. Navigasi mobile Sheet, command palette, notifikasi, dan dropdown akun mempertahankan perilaku aslinya.
- `OverviewShell` mengaktifkan background rata hanya untuk rute tepat `/dashboard` melalui `data-overview-home` dan CSS Module. Rute dashboard lain mempertahankan latar studio sebelumnya. Aturan `.progress` yang juga dipakai kartu Proyek Saya tidak diubah.

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

## Komponen dan pengujian

Semua path komponen berikut relatif terhadap `app/dashboard/_components/`.

Corak memakai `overview-patterns.module.css`, `empty-state-pattern.tsx`, dan `empty-state-pattern.module.css`. Test varian lokal dan scope berada pada `overview-welcome.test.tsx`, `overview-layout.test.tsx`, serta `empty-state-pattern.test.tsx`.

| Tanggung jawab                                   | Berkas                                                                                                                                                                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Query asli dan komposisi halaman                 | `../page.tsx`                                                                                                                                                                                                                                              |
| Susunan slot, tata letak kosong, dan scope latar | `overview-layout.tsx`, `overview-shell.tsx`, `overview.module.css`                                                                                                                                                                                         |
| Sambutan dan statistik                           | `overview-welcome.tsx`, `overview-stats.tsx`, `overview-counter.tsx`                                                                                                                                                                                       |
| Proyek dan aktivitas                             | `overview-projects.tsx`, `overview-activity.tsx`, `overview-projects.module.css`, `overview-activity.module.css`                                                                                                                                           |
| Data/progres onboarding dan kartu vertikal       | `onboarding-checklist.tsx`, `onboarding-card.tsx`, `onboarding-card.module.css`                                                                                                                                                                            |
| Pie chart progres onboarding                     | `onboarding-pie-chart.tsx`, `onboarding-pie-chart.test.tsx`                                                                                                                                                                                                |
| Fixture uji, tidak diimpor kode produksi         | `_fixtures/overview.ts`                                                                                                                                                                                                                                    |
| Test pendamping                                  | `../page.test.tsx`, `overview-layout.test.tsx`, `overview-shell.test.tsx`, `overview-welcome.test.tsx`, `overview-stats.test.tsx`, `overview-projects.test.tsx`, `overview-activity.test.tsx`, `onboarding-checklist.test.tsx`, `onboarding-card.test.tsx` |

## Pemeriksaan

- Verifikasi gabungan antarmuka AI Relay, Kalkulator, Invoice, Profil, Pengaturan, header/sidebar, dan komponen kalkulator publik: `bun test app/dashboard/ai-relay app/dashboard/calculator app/dashboard/invoices app/dashboard/profile app/dashboard/settings components/dashboard "app/(public)/pricing"` menghasilkan 112 test lulus tanpa kegagalan. Mock navigasi header menyediakan router, pathname, search params, redirect, dan notFound agar kontrak ekspor Next.js konsisten saat test dijalankan bersama.

- Test terarah mencakup rendering dan metadata, query/limit 3 proyek serta 6 log, statistik nol/non-nol, data gagal dengan fallback `safeDb` asli, seluruh langkah/CTA onboarding, penanda langkah berikutnya, syarat telepon, pembulatan progres, kondisi selesai, urutan slot, identitas panjang, dan batas scope Ringkasan. Chart diuji untuk 0%, 25%, 100%, jumlah langkah nol, nilai legenda, dan progress aksesibel. Seluruh 27 test Ringkasan lulus; bersama regresi Proyek, Pesanan, Profil, Pengaturan, Invoice, corak bersama, dan navigasi, 90 test lulus tanpa kegagalan.
- Perbandingan sumber memastikan query Ringkasan, query onboarding, langkah, persentase, dan kondisi selesai tidak berubah. Server action, API, skema database, routing, dan stylesheet global tidak dimodifikasi.
- Browser terisolasi memeriksa halaman kosong pada sesi mock lokal. Fixture hanya pada server preview pengujian sementara mengisi DOM Ringkasan dengan komponen presentasi asli dan CSS hasil kompilasi Next.js. Tidak ada fixture yang menggantikan sumber data aplikasi atau disimpan ke database.
- Skenario kosong, tiga proyek/enam aktivitas, identitas/deskripsi panjang, serta onboarding yang tidak tersedia diperiksa pada 320, 390, 768, 1024, 1280, dan 1440px tanpa overflow horizontal. Proporsi desktop dengan data terukur 2:1; tablet/HP satu kolom. Seluruh empat langkah tetap tampil saat onboarding belum tuntas.
- Fokus keyboard pada tautan Profil serta menu sidebar mobile dengan penanda Ringkasan diperiksa. Latar Proyek Saya tetap memakai gradasi studio sebelumnya tanpa flag Ringkasan. Reduced motion, skeleton dashboard, dan fallback gagal memuat mengikuti mekanisme yang sudah tersedia.
- Formatter, ESLint, Next.js typegen, dan typecheck digunakan untuk verifikasi. Suite `bun test` lengkap membutuhkan PostgreSQL dan skema Router beserta fungsi/trigger ledger yang sesuai. Workflow GitHub menyiapkan layanan database terisolasi untuk verifikasi penuh; lingkungan lokal yang berbeda tidak digunakan untuk mengubah backend melalui tugas UI.
- Tidak ada perubahan data akun produksi, pengiriman pesan atau transaksi sungguhan, dependensi, maupun build produksi dalam pekerjaan Ringkasan ini.
