# UI Proyek Saya Aldera Tech

## Cakupan dan tema

Halaman daftar `/dashboard/projects` memakai tema yang sama dengan Ringkasan: Plus Jakarta Sans, navy/biru elektrik, gradasi terang, kartu putih, radius lembut, border tipis, dan fokus keyboard biru.

`getStudioDashboardSection` mengaktifkan wrapper, sidebar, serta header studio untuk rute tepat `/dashboard`, `/dashboard/projects`, `/dashboard/orders`, `/dashboard/calculator`, dan `/dashboard/ai-relay`. Menu, akses, command palette, dropdown akun, serta navigasi Sheet tetap menggunakan konfigurasi dan mekanisme yang sama. Nama bagian header mengikuti rute aktif. Detail `/dashboard/projects/[id]` tidak memakai variasi tampilan baru.

## Sumber data dan interaksi

- `ProjectsContent` tetap memanggil `auth()` lalu query `prisma.project.findMany` dengan `where: { clientId: userId }` dan `orderBy: { updatedAt: "desc" }`. Tidak ada query tambahan, perubahan pemilik, filter, urutan, atau perhitungan progres.
- Nama, deskripsi, status, progres, deadline, dan tanggal pembaruan berasal dari proyek asli. Judul ditampilkan lengkap dengan pembungkusan kata; ringkasan deskripsi dibatasi secara visual menjadi dua baris.
- Label status berasal dari `projectStatusMeta`. Warna lokal membedakan Pending, Berjalan, Review, Selesai, dan Dibatalkan dengan permukaan pastel serta teks, tanpa mengubah nilai status.
- Progres memakai nilai `project.progress` langsung melalui elemen `progress` native. Badge tidak menentukan atau menghitung progres.
- Seluruh kartu menuju `DASHBOARD_ROUTES.projectDetail(id)`. Tidak ada tombol/input atau tautan bersarang di dalam kartu. Kategori, anggota, thumbnail, dan nilai proyek tidak ditambahkan.
- Satu CTA Hitung Estimasi ditempatkan pada header halaman dan menggunakan `PUBLIC_ROUTES.calculator`, sama dengan alur yang tersedia. Tidak ada pencarian, filter, pengurutan interaktif, pagination, atau pergantian tampilan pada implementasi sumber halaman ini.
- Data tetap berada pada komponen server. Tidak ada perubahan API, database, autentikasi, izin, fitur detail, chat, milestone, file, atau invoice.

## Kondisi halaman

- **Loading**: `Suspense` di dalam halaman daftar menampilkan skeleton yang mengikuti grid kartu. Fallback ini tidak ditaruh pada `projects/loading.tsx`, sehingga tidak diwariskan ke halaman detail. Status loading memiliki label pembaca layar dan mendukung reduced motion.
- **Kosong**: array proyek kosong menampilkan penjelasan dan mini maskot; CTA estimasi tetap tersedia pada header. Mini maskot memakai [aset Tentang yang tersedia](../public/images/about/aldera-cat-about.webp), static import, `next/image`, kualitas 90, ukuran responsif, lazy loading, dan perlakuan dekoratif; tidak ada aset baru.
- **Gagal mengambil data**: fallback lokal `safeDb` berupa `null`, sehingga kegagalan dapat dibedakan dari array kosong. Query serta mekanisme logging `safeDb` tetap sama. Panel error tidak mengekspos pesan database; tombol Coba Lagi memanggil `router.refresh()` dengan status pending dan disabled.

Grid memakai satu kolom pada HP, dua mulai 768px, serta tiga mulai 1280px. Card menggunakan flex column agar progres/informasi pendukung dan tautan detail sejajar. Semua kondisi mengikuti lebar container dan tidak membuat scroll horizontal.

## Berkas

| Status      | Berkas                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Diubah      | `app/dashboard/projects/page.tsx`                                                                                                 |
| Baru        | `app/dashboard/projects/_components/project-list-header.tsx`, `project-card.tsx`                                                  |
| Baru        | `app/dashboard/projects/_components/projects-content.tsx`, `projects-empty-state.tsx`, `projects-load-error.tsx`                  |
| Baru        | `app/dashboard/projects/_components/project-list-skeleton.tsx`, `project-list.module.css`                                         |
| Bersama     | `components/dashboard/_hooks/use-dashboard-refresh.ts` untuk memuat ulang data pada panel error tanpa mengubah mekanisme navigasi |
| Baru        | `components/dashboard/studio-dashboard-routes.ts`                                                                                 |
| Diubah      | `app/dashboard/_components/overview-shell.tsx`, `components/dashboard/sidebar.tsx`, `components/dashboard/dashboard-header.tsx`   |
| Dokumentasi | `design-docs/dashboard-projects-ui.md`, `design-docs/dashboard-overview-ui.md`, `ai-agent-docs/brand-context.md`                  |

Tidak ada file yang dihapus dalam perubahan daftar proyek ini.

## Pemeriksaan

- Lint terarah, Prettier, Next.js typegen, dan typecheck untuk kode yang diubah.
- Perbandingan dengan sumber halaman awal memastikan isi query dan pengambilan identitas sesi tetap sama.
- Halaman aktual diperiksa pada lebar 1440, 1024, 768, 390, dan 320px: menu Proyek Saya aktif, nama bagian header benar, serta empty state dan CTA berada dalam viewport tanpa overflow. Akun uji memang memiliki nol proyek.
- Grid kartu diperiksa melalui pratinjau komponen terpisah dengan dua proyek yang sudah tersedia di database. Judul, status Pending/Berjalan, nilai progres 10%/65%, tanggal, dan rute detail cocok dengan data. Tidak ada proyek dummy atau perubahan data pengguna. Pratinjau tidak mengganti isi halaman akun.
- Loading dan panel error diperiksa sebagai komponen terpisah pada lebar 1440, 390, dan 320px. Perilaku retry pada kegagalan database nyata tidak dipicu karena database aktif tetap tersedia.
- Navigasi mobile menampilkan Proyek Saya aktif. CTA estimasi menuju `/pricing#calculator`; Ringkasan, Pesanan & Estimasi, Kalkulator dashboard, dan AI Gateway / Relay memakai tema studio. Invoice serta detail proyek mempertahankan tampilannya masing-masing. Rincian kalkulator tersedia di [Panduan UI Kalkulator](dashboard-calculator-ui.md).
- Pemeriksaan sumber detail memastikan pemeriksaan pemilik dan redirect tetap tersedia. Pengujian detail proyek milik akun uji tidak dilakukan karena akun tersebut belum memiliki proyek.
- Tidak ada perubahan data, transaksi, pesan yang dikirim, test suite, atau build produksi dalam pekerjaan ini.
