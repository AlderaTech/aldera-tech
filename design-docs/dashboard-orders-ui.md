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
- Kartu bersifat informasional, sesuai implementasi asal yang tidak memiliki rute detail atau tindakan per pesanan. Tidak ada kontrol pencarian, filter, pagination, pembatalan, pembayaran, atau proses pengajuan baru.
- Query tetap `orderRequest.findMany` dengan `where: { userId }`, `orderBy: { createdAt: "desc" }`, dan include nama jenis proyek. Identitas sesi, sumber data, izin, API, database, pengajuan kalkulator, dan proses konversi tidak diubah.
- Prisma Decimal tetap di server; konversi number hanya digunakan untuk format nominal pada komponen server.

## Kondisi dan responsivitas

`OrdersFrame` memberi susunan header yang sama pada halaman dan loading. `OrdersSkeleton` mengikuti bentuk kartu akhir, digunakan oleh `orders/loading.tsx` dan Suspense lokal. Empty state memakai [maskot Layanan](../public/images/services/aldera-cat-services.webp) yang sudah tersedia, static import, `next/image`, sizes responsif, kualitas 90, lazy loading, serta atribut dekoratif.

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

## Pemeriksaan

- Prettier, ESLint terarah, Next.js typegen, serta typecheck digunakan untuk verifikasi kode.
- Perbandingan query terhadap sumber halaman awal memastikan query tidak berubah. Formatter nominal, perhitungan jumlah fitur, dan label status mempertahankan implementasi asal.
- Browser pada lebar 1440, 1024, 768, 390, dan 320px: tanpa overflow horizontal, hanya satu CTA Estimasi Baru, serta penanda menu Pesanan & Estimasi aktif.
- Menu mobile terbuka dan dapat berpindah ke Proyek Saya. Fokus keyboard pada CTA terlihat. Estimasi Baru membuka `/dashboard/calculator`, dengan lima tahap dan ringkasan biaya pada tema dashboard studio.
- Database saat pemeriksaan tidak memiliki estimasi. Empty state diverifikasi pada halaman aktual; kartu riwayat terisi belum dapat dibandingkan dengan data nyata. Tidak ada data contoh yang disisipkan atau pengajuan yang dibuat untuk pemeriksaan.
- Pengiriman formulir kalkulator, konversi pesanan, kegagalan database nyata, test suite, dan build produksi tidak dijalankan dalam pekerjaan UI ini.
