# UI Proyek Saya Aldera Tech

## Cakupan dan tema

Halaman daftar `/dashboard/projects` memakai tema yang sama dengan Ringkasan: Plus Jakarta Sans, navy/biru elektrik, gradasi terang, kartu putih, radius lembut, border tipis, dan fokus keyboard biru.

`getStudioDashboardSection` mengaktifkan wrapper, sidebar, serta header studio untuk rute tepat `/dashboard`, `/dashboard/projects`, `/dashboard/orders`, `/dashboard/calculator`, dan `/dashboard/ai-relay`. Menu, akses, command palette, dropdown akun, serta navigasi Sheet tetap menggunakan konfigurasi dan mekanisme yang sama. Nama bagian header mengikuti rute aktif. Detail `/dashboard/projects/[id]` tidak memakai variasi tampilan baru.

## Sumber data dan interaksi

- `ProjectsContent` memanggil `auth()` lalu `prisma.project.count` dan `findMany` dengan cakupan `clientId`, filter status/kata kunci yang tersedia, dan urutan `updatedAt` menurun. Paginasi menggunakan enam proyek per halaman. Penataan empty state tidak mengubah query, pemilik, filter, urutan, atau perhitungan progres.
- Nama, deskripsi, status, progres, deadline, dan tanggal pembaruan berasal dari proyek asli. Judul ditampilkan lengkap dengan pembungkusan kata; ringkasan deskripsi dibatasi secara visual menjadi dua baris.
- Label status berasal dari `projectStatusMeta`. Warna lokal membedakan Pending, Berjalan, Review, Selesai, dan Dibatalkan dengan permukaan pastel serta teks, tanpa mengubah nilai status.
- Progres memakai nilai `project.progress` langsung melalui elemen `progress` native. Badge tidak menentukan atau menghitung progres.
- Seluruh kartu menuju `DASHBOARD_ROUTES.projectDetail(id)`. Tidak ada tombol/input atau tautan bersarang di dalam kartu. Kategori, anggota, thumbnail, dan nilai proyek tidak ditambahkan.
- Satu CTA Hitung Estimasi ditempatkan pada header halaman dan menggunakan `PUBLIC_ROUTES.calculator`, sama dengan alur yang tersedia. Pencarian, filter status, dan paginasi memakai parameter URL `q`, `status`, serta `page`. Empty state belum memiliki proyek ditampilkan ketika total nol tanpa filter; hasil filter kosong memakai pesan dan tindakan Reset Filter yang terpisah.
- Data tetap berada pada komponen server. Tidak ada perubahan API, database, autentikasi, izin, fitur detail, chat, milestone, file, atau invoice.

## Kondisi halaman

- **Loading**: `Suspense` di dalam halaman daftar menampilkan skeleton yang mengikuti grid kartu. Fallback ini tidak ditaruh pada `projects/loading.tsx`, sehingga tidak diwariskan ke halaman detail. Status loading memiliki label pembaca layar dan mendukung reduced motion.
- **Kosong**: array proyek kosong menampilkan komposisi vertikal rata tengah: maskot, label Langkah pertama, judul Belum ada proyek, lalu deskripsi estimasi. Mini maskot memakai [aset Tentang yang tersedia](../public/images/about/aldera-cat-about.webp), static import, `next/image`, kualitas 90, lazy loading, dan perlakuan dekoratif. Kotak gambar berukuran 140×140px pada desktop dan 112×112px pada HP, dengan `object-fit: contain`. Jarak ke tulisan 18px pada desktop dan 16px pada HP; lebar deskripsi maksimal 24rem. Tinggi kartu mengikuti isi dengan padding 32px/24px, tanpa min-height tambahan. Kelas `emptyPanel` membatasi perubahan layout pada kondisi kosong; panel error, header, dan CTA Hitung Estimasi tetap mengikuti implementasi yang sama.
- **Gagal mengambil data**: fallback lokal `safeDb` berupa `null`, sehingga kegagalan dapat dibedakan dari array kosong. Query serta mekanisme logging `safeDb` tetap sama. Panel error tidak mengekspos pesan database; tombol Coba Lagi memanggil `router.refresh()` dengan status pending dan disabled.

Permukaan dasar kartu empty state memakai putih solid dari token `--overview-paper`. Border navy 24% dan bayangan dua lapis yang halus memperjelas batasnya terhadap gradasi halaman. Corak teknologi berada pada lapisan dekoratif tersendiri: lingkaran orbit dengan cahaya biru lembut di kiri atas, garis sirkuit dan simbol kode di kanan atas, serta titik-titik yang memudar di kanan bawah. Lapisan ini terpotong pada radius kartu, berada di belakang maskot/teks, tidak menerima pointer, dan tersembunyi dari pembaca layar. Dekorasi statis diperkecil pada HP. Aturan hanya berlaku pada empty state, sehingga warna panel error serta kartu proyek tidak ikut berubah.

Grid memakai satu kolom pada HP, dua mulai 768px, serta tiga mulai 1280px. Card menggunakan flex column agar progres/informasi pendukung dan tautan detail sejajar. Semua kondisi mengikuti lebar container dan tidak membuat scroll horizontal.

## Berkas

| Status      | Berkas                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Diubah      | `app/dashboard/projects/page.tsx`                                                                                                 |
| Baru        | `app/dashboard/projects/_components/project-list-header.tsx`, `project-card.tsx`                                                  |
| Baru        | `app/dashboard/projects/_components/projects-content.tsx`, `projects-empty-state.tsx`, `projects-load-error.tsx`                  |
| Baru        | `app/dashboard/projects/_components/project-list-skeleton.tsx`, `project-list.module.css`                                         |
| Pengujian   | `app/dashboard/projects/_components/projects-empty-state.test.tsx`, `app/dashboard/projects/page.test.tsx`                        |
| Bersama     | `components/dashboard/_hooks/use-dashboard-refresh.ts` untuk memuat ulang data pada panel error tanpa mengubah mekanisme navigasi |
| Baru        | `components/dashboard/studio-dashboard-routes.ts`                                                                                 |
| Diubah      | `app/dashboard/_components/overview-shell.tsx`, `components/dashboard/sidebar.tsx`, `components/dashboard/dashboard-header.tsx`   |
| Dokumentasi | `design-docs/dashboard-projects-ui.md`, `design-docs/dashboard-overview-ui.md`, `ai-agent-docs/brand-context.md`                  |

Tidak ada file yang dihapus dalam perubahan daftar proyek ini.

Corak dekoratif memakai komponen bersama `app/dashboard/_components/empty-state-pattern.tsx` dan `empty-state-pattern.module.css`, dengan test pendamping `empty-state-pattern.test.tsx`. `projects-empty-state.tsx` serta empty state Pesanan & Estimasi merender komponen yang sama sebagai SVG/CSS tanpa aset raster atau dependensi baru.

## Pemeriksaan

- Lint terarah, Prettier, Next.js typegen, dan typecheck untuk kode yang diubah.
- Perbandingan dengan sumber halaman awal memastikan isi query dan pengambilan identitas sesi tetap sama.
- Halaman aktual diperiksa pada lebar 1440, 1024, 768, 390, dan 320px: menu Proyek Saya aktif, nama bagian header benar, serta empty state dan CTA berada dalam viewport tanpa overflow. Akun uji memang memiliki nol proyek.
- Grid kartu diperiksa melalui pratinjau komponen terpisah dengan dua proyek yang sudah tersedia di database. Judul, status Pending/Berjalan, nilai progres 10%/65%, tanggal, dan rute detail cocok dengan data. Tidak ada proyek dummy atau perubahan data pengguna. Pratinjau tidak mengganti isi halaman akun.
- Loading dan panel error diperiksa sebagai komponen terpisah pada lebar 1440, 390, dan 320px. Perilaku retry pada kegagalan database nyata tidak dipicu karena database aktif tetap tersedia.
- Navigasi mobile menampilkan Proyek Saya aktif. CTA estimasi menuju `/pricing#calculator`; Ringkasan, Pesanan & Estimasi, Kalkulator dashboard, dan AI Gateway / Relay memakai tema studio. Invoice serta detail proyek mempertahankan tampilannya masing-masing. Rincian kalkulator tersedia di [Panduan UI Kalkulator](dashboard-calculator-ui.md).
- Pemeriksaan sumber detail memastikan pemeriksaan pemilik dan redirect tetap tersedia. Pengujian detail proyek milik akun uji tidak dilakukan karena akun tersebut belum memiliki proyek.
- Test pendamping `projects-empty-state.test.tsx` memeriksa urutan maskot/teks, identitas aset dekoratif, ukuran responsif, serta satu CTA estimasi asli pada header. Test halaman mencakup metadata, data kosong, pencarian/filter/paginasi yang tersedia, dan error database.
- Dua belas test terkait pada kedua berkas lulus, termasuk regresi permukaan putih solid, border, bayangan, dan dekorasi noninteraktif yang dibatasi pada empty state. Lint, formatter, Next.js typegen, dan typecheck lulus. Preview komponen asli dengan CSS hasil kompilasi aplikasi memverifikasi posisi tengah pada desktop 1440px dan HP 390/320px: gambar serta tulisan memiliki pusat horizontal yang sama, gap 18/16px, dan tidak ada overflow horizontal. Preview memakai sesi mock lokal tanpa membuat akun atau proyek.
- Percobaan suite lengkap dengan `bun test --bail=1` berhenti pada pengujian integrasi router yang fixture penggunanya tidak mengisi kolom `users.web_user_id` wajib. Kendala skema/fixture tersebut tidak ditangani melalui perubahan empty state.
- Tidak ada perubahan data, transaksi, pesan yang dikirim, atau build produksi dalam pekerjaan ini.
