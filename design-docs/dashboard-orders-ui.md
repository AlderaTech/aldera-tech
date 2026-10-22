# UI Pesanan & Estimasi Aldera Tech

## Cakupan

Halaman `/dashboard/orders` mengikuti tema Ringkasan dan Proyek Saya: Plus Jakarta Sans, navy/biru elektrik, latar terang, kartu putih, radius membulat, border tipis, serta badge pastel. `getStudioDashboardSection` mengaktifkan tema dan label header Pesanan & Estimasi pada rute ini. Menu dan tujuan navigasi tidak berubah.

Komponen header, tombol, empty state, dan error mengimpor stylesheet daftar proyek secara read-only agar desain konsisten. Gaya kartu estimasi berada pada CSS Module lokal. Kalkulator dashboard mengikuti [varian studio khusus kalkulator](dashboard-calculator-ui.md). AI Gateway / Relay mengikuti [tema dashboard studio](dashboard-ai-relay-ui.md). Invoice dan halaman detail proyek mempertahankan tampilannya masing-masing.

## Konten dan data

- Judul halaman tetap Riwayat Estimasi. Satu tombol Estimasi Baru berada di header dan menuju `DASHBOARD_ROUTES.calculator`; empty state tidak menambahkan tombol kedua.
- Kartu menggunakan jenis proyek dari `projectType.name`, status, penanda Urgent jika `urgency === "urgent"`, tanggal pengajuan, jumlah fitur, catatan, serta nominal estimasi dari sumber asli.
- Nominal tetap `formatCurrency(Number(order.estimatedTotal))`. Jumlah fitur tetap `features.length + customFeatures.length`; tidak ada perubahan perhitungan harga atau fitur.
- Label status tetap Menunggu Review, Sedang Diproses, Dikonversi ke Proposal, dan Dibatalkan. Metadata tampilan dipusatkan di `_data/order-status.ts` dengan tipe `OrderRequestStatus`.
- Nama jenis proyek dibungkus penuh. Catatan ditampilkan lengkap dalam panel tersendiri dengan dukungan baris baru dan pembungkusan kata.
- Kartu bersifat informasional, sesuai implementasi asal yang tidak memiliki rute detail atau tindakan per pesanan. Filter status dan paginasi tetap memakai parameter URL `status` serta `page`, dengan enam item per halaman. Hasil filter kosong memiliki pesan dan tindakan Reset Filter tersendiri; tidak diganti dengan empty state akun baru.
- Query tetap memakai `orderRequest.count` dan `findMany` dengan cakupan `userId`, filter status yang tersedia, urutan `createdAt` menurun, batas enam item per halaman, serta include nama jenis proyek. Identitas sesi, sumber data, izin, API, database, pengajuan kalkulator, dan proses konversi tidak diubah.
- Prisma Decimal tetap di server; konversi number hanya digunakan untuk format nominal pada komponen server.

## Kondisi dan responsivitas

`OrdersFrame` memberi susunan header yang sama pada halaman dan loading. `OrdersSkeleton` mengikuti bentuk kartu akhir, digunakan oleh `orders/loading.tsx` dan Suspense lokal. Empty state memakai [maskot Layanan](../public/images/services/aldera-cat-services.webp) yang sudah tersedia, static import, `next/image`, sizes responsif, kualitas 90, lazy loading, serta atribut dekoratif.

Kartu Belum ada estimasi disusun vertikal rata tengah: maskot, label Rencanakan langkah Anda, judul, dan deskripsi asli. Gambar berukuran 140×140px pada desktop dan 112×112px pada HP, dengan jarak ke teks 18/16px. Lebar deskripsi maksimal 24rem; tinggi kartu mengikuti isi dengan padding 32/24px. Dasar putih solid, border navy yang jelas, serta bayangan halus mengikuti Proyek Saya melalui kelas `statePanel` dan `emptyPanel` yang sudah tersedia. Header tetap memiliki satu tombol Estimasi Baru ke kalkulator dashboard.

Corak menggunakan `app/dashboard/_components/empty-state-pattern.tsx` dan `empty-state-pattern.module.css` bersama Proyek Saya: orbit biru lembut di kiri atas, sirkuit/simbol kode di kanan atas, dan titik-titik yang memudar di kanan bawah. Dekorasi statis berada di belakang isi, tersembunyi dari pembaca layar, tidak dapat difokuskan, dan tidak menangkap pointer. Ukurannya diperkecil pada HP. Panel error dan daftar estimasi tidak memakai kelas `emptyPanel`.

Fallback lokal `safeDb` berupa `null` membedakan kegagalan pengambilan data dari daftar kosong. Panel error mengumumkan pesan yang tidak mengekspos rincian database. Coba Lagi menggunakan hook bersama `useDashboardRefresh` dan `router.refresh()` dengan status pending/disabled. Hook ini juga digunakan oleh panel error Proyek Saya dengan perilaku yang sama; modul hook khusus proyek yang digantikan tidak lagi digunakan.

Pada desktop, informasi pesanan dan nominal membentuk dua area sejajar. Pada HP nominal turun di bawah identitas proyek; metadata serta badge dapat membungkus. Fokus keyboard, status pembaca layar, dan reduced motion mengikuti komponen dashboard yang tersedia. Tidak ada tinggi konten tetap atau scroll di dalam kartu.

## Berkas

| Status                   | Berkas                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Diubah                   | `app/dashboard/orders/page.tsx`, `app/dashboard/orders/loading.tsx`                                                                                    |
| Baru                     | `app/dashboard/orders/_components/orders-frame.tsx`, `orders-content.tsx`, `order-card.tsx`                                                            |
| Baru                     | `app/dashboard/orders/_components/orders-empty-state.tsx`, `orders-load-error.tsx`, `orders-skeleton.tsx`, `orders.module.css`                         |
| Baru                     | `app/dashboard/orders/_data/order-status.ts`                                                                                                           |
| Diubah                   | `components/dashboard/studio-dashboard-routes.ts`                                                                                                      |
| Hook bersama             | `components/dashboard/_hooks/use-dashboard-refresh.ts`                                                                                                 |
| Import hook diselaraskan | `app/dashboard/projects/_components/projects-load-error.tsx`                                                                                           |
| Dihapus                  | `app/dashboard/projects/_hooks/use-projects-refresh.ts`, digantikan hook bersama                                                                       |
| Dokumentasi              | `design-docs/dashboard-orders-ui.md`, `design-docs/dashboard-overview-ui.md`, `design-docs/dashboard-projects-ui.md`, `ai-agent-docs/brand-context.md` |

Test empty state berada di `app/dashboard/orders/_components/orders-empty-state.test.tsx`; test corak bersama berada di `app/dashboard/_components/empty-state-pattern.test.tsx`.

## Pemeriksaan

- Prettier, ESLint terarah, Next.js typegen, serta typecheck digunakan untuk verifikasi kode.
- Perbandingan query terhadap sumber halaman awal memastikan query tidak berubah. Formatter nominal, perhitungan jumlah fitur, dan label status mempertahankan implementasi asal.
- Browser pada lebar 1440, 1024, 768, 390, dan 320px: tanpa overflow horizontal, hanya satu CTA Estimasi Baru, serta penanda menu Pesanan & Estimasi aktif.
- Menu mobile terbuka dan dapat berpindah ke Proyek Saya. Fokus keyboard pada CTA terlihat. Estimasi Baru membuka `/dashboard/calculator`, dengan lima tahap dan ringkasan biaya pada tema dashboard studio.
- Database saat pemeriksaan tidak memiliki estimasi. Empty state diverifikasi pada halaman aktual; kartu riwayat terisi belum dapat dibandingkan dengan data nyata. Tidak ada data contoh yang disisipkan atau pengajuan yang dibuat untuk pemeriksaan.
- Test halaman Orders dan Projects, kedua empty state, serta corak bersama mencakup 25 skenario: data kosong, error, filter/paginasi, metadata, urutan maskot/teks, aset responsif, satu CTA asli, dan dekorasi noninteraktif. Lint, formatter, Next.js typegen, dan typecheck digunakan untuk verifikasi.
- Suite lengkap masih terkendala fixture database router yang tidak mengisi kolom wajib `users.web_user_id`. Pengiriman formulir kalkulator, konversi pesanan, kegagalan database nyata, dan build produksi tidak dijalankan untuk pemeriksaan empty state.
