# Standar header dan empty state Admin

## Cakupan dan batas fungsi

Semua banner di area Admin memakai AdminBanner atau AdminPageHeader dengan kategori eksplisit. Header daftar, pembuatan, detail/editor dan pengaturan menggunakan ikon serta label kategori yang sama untuk menu terkait. Website publik dan dashboard pengguna tidak mendapat perubahan styling.

Data fetching, API, guard autentikasi, izin, parameter pencarian/pagination, tindakan server, nominal dan perhitungan tetap berasal dari implementasi yang tersedia. Tiga pintasan Dashboard Admin (Proyek Baru, Proposal Baru dan Invoice Baru) dipertahankan.

## Badge kategori

Sumber: [admin-banner-categories.ts](../app/admin/_data/admin-banner-categories.ts). Komponen: [AdminBanner](../app/admin/_components/admin-banner.tsx).

| Konteks halaman                             | Prop category | Label                  | Ikon            |
| ------------------------------------------- | ------------- | ---------------------- | --------------- |
| Dashboard                                   | overview      | RINGKASAN SISTEM       | LayoutDashboard |
| Proyek, Proposal, Timesheet, Manajer Berkas | projects      | MANAJEMEN PROYEK       | FolderKanban    |
| Permohonan Pesanan, Kalkulator Harga        | estimates     | ESTIMASI & PESANAN     | Calculator      |
| Invoice, detail dan template berkala        | billing       | KEUANGAN & TAGIHAN     | ReceiptText     |
| AI Relay Ops, Telegram Bot & Pembayaran     | ai            | OPERASIONAL AI GATEWAY | Bot             |
| Pendapatan & Profitabilitas                 | analytics     | ANALITIK & LAPORAN     | BarChart3       |
| Blog, Kategori Blog, Portfolio, Testimoni   | content       | MANAJEMEN KONTEN       | Newspaper       |
| Pengguna & Tim                              | users         | PENGGUNA & TIM         | Users           |
| Pengaturan Situs                            | settings      | PENGATURAN SISTEM      | Settings        |
| Audit Log                                   | audit         | AUDIT & KEAMANAN       | ShieldCheck     |

AdminBanner menerima seluruh prop visual WorkspaceBanner selain eyebrow. category wajib bertipe AdminBannerCategory; badgeIcon dapat mengganti ikon default secara eksplisit. ID, children, visual maskot, aksi, status disabled dan atribut aksesibilitas diteruskan. Label selalu berasal dari kategori, bukan state URL atau teks statis bersama.

Subjudul banner menggunakan Bahasa Indonesia, termasuk istilah pengelolaan proyek, penetapan klien, penerbitan artikel, tanda tangan elektronik, harga model dan pengisian saldo. Judul/nama produk, ID model, isi data klien dan pengenal teknis tidak diubah menjadi data baru.

## Empty state bersama

Komponen: [AdminEmptyState](../app/admin/_components/admin-empty-state.tsx). Konten: [admin-empty-contexts.ts](../app/admin/_data/admin-empty-contexts.ts).

Urutan elemen:

1. Gambar tablet/dokumen biru.
2. Label konteks abu-abu, uppercase dan letter-spacing.
3. Judul tebal yang ringkas.
4. Penjelasan dengan lebar maksimal 28rem.
5. Aksi pill jika disediakan pemanggil.

Aset menggunakan static import dari `public/images/about/technology/design.webp`, sama dengan empty state Invoice, Estimasi Biaya dan Riwayat Estimasi pengguna. Ukurannya 120px pada desktop dan 104px pada HP. Tidak ada pose kucing maupun fallback ikon untuk empty state Admin.

Panel memakai putih, border halus, radius, dan bayangan lembut. EmptyStatePattern yang sama dengan pengguna menyediakan lingkaran kiri, titik dan sirkuit dengan simbol kode di kanan. Lapisan dekoratif tidak menghalangi klik atau fokus. Panel di dalam kartu/tabel tidak menggambar border atau shadow ganda.

Sel tabel yang berisi empty state melepaskan padding termasuk padding kolom pertama/terakhir. Pada HP, tabel kosong melepaskan minimum width dan menyembunyikan header kolom. Kartu yang memiliki empty state tidak menggandakan corak kartu Admin di atas EmptyStatePattern. Isi data normal mempertahankan kolom dan scroll tabel asli.

## Konten dan aksi

context menentukan label, judul dan deskripsi default. title, description dan label dapat diberikan untuk keadaan khusus; error boundary mempertahankan pesan kegagalan dan tombol retry. Fallback nilai field biasa (misalnya tidak ada catatan invoice) tetap berupa informasi field.

Konteks tersedia untuk proyek, permohonan, proposal, invoice, template, waktu kerja, berkas, aktivitas, tahapan, pendapatan, klien, status proyek, model, sinkronisasi, pengisian saldo, audit ledger/log, artikel, kategori, studi kasus, testimoni, pengguna, beban kerja, jenis proyek, fitur, opsi tambahan dan metode pembayaran.

CTA memakai route/action asli. Proyek, Proposal, Invoice, template, Blog dan Portfolio memakai tautan pembuatan yang tersedia. Kategori tetap memeriksa canCreate dan memakai callback pembuka dialog yang sama; Testimoni serta metode pembayaran memakai callback tambah asli. Jika tindakan tidak diberikan, komponen tidak membuat tombol tanpa fungsi.

Hasil audit kosong menampilkan Belum ada hasil pemeriksaan pada tampilan yang relevan. Label lulus hanya ditampilkan ketika array pemeriksaan tersedia; nilai status, jumlah pelanggaran, prosedur audit dan perhitungan tetap sama.

## Pengujian

Pilihan peran, tab Pengaturan Situs dan filter tanggal memakai panel serta indikator yang kontras. Spesifikasi dan berkas terkait tersedia pada [navigasi dan filter Admin](admin-navigation-controls-ui.md).

- Test header memverifikasi label/ikon setiap kategori, override ikon, ID, visual, disabled dan penerusan aksi.
- Test pemakaian memeriksa seluruh file runtime Admin agar kategori mengikuti menu, subjudul tidak memakai campuran bahasa yang ditargetkan, dan setiap daftar kosong memiliki konteks.
- Test empty state memverifikasi aset WebP dengan alpha, urutan gambar/label/judul/deskripsi/aksi, seluruh konteks, konten panjang, retry/disabled, dekorasi, serta aturan cascade tombol dan padding tabel.
- Test halaman/tabel diperbarui untuk teks Indonesia, tanpa melonggarkan pengecekan data, rute, nominal, permission, form dan pagination.
- Regresi tambahan mencakup tombol kategori yang dibatasi izin serta hasil audit kosong yang tidak menyatakan lulus.
- UI gabungan: 364 pass, 0 fail pada 133 berkas. Suite lengkap Linux dengan database sementara bersih: 798 pass, 0 fail pada 173 berkas.
- Browser fixture memeriksa seluruh 10 kategori badge dan 28 konteks empty state pada desktop/HP. Aset tunggal dipakai pada semua konteks, rata tengah, tanpa gambar rusak atau overflow. Tautan invoice dan aksi preview dapat difokuskan/diklik; seluruh tab AI tetap berpindah melalui parameter URL.
- Prettier, Next.js typegen dan typecheck lulus. Linter 0 error dengan empat warning existing di test backend yang tidak diedit.
- Authenticated E2E, undangan nyata, publikasi, transaksi dan sinkronisasi provider produksi tidak dijalankan. Preview memakai data fixture/action mock.

## Berkas

- Komponen bersama Admin: `admin-banner.tsx`, `admin-page-header.tsx`, `admin-empty-state.tsx`, `admin-common.module.css`, `admin-surfaces.module.css`, dan `admin-mascot.tsx`.
- Metadata: `app/admin/_data/admin-banner-categories.ts` dan `admin-empty-contexts.ts`.
- Pemanggil: banner serta kondisi kosong pada seluruh rute Admin yang tercantum di [cakupan Admin](admin-studio-ui.md), termasuk detail proyek/invoice/proposal dan editor Blog/Portfolio.
- Aksi dialog: `blog/categories/_components/category-management.tsx`, `category-table.tsx`, `testimonials/_components/testimonial-management.tsx` dan `testimonial-table.tsx`.
- Test co-located: komponen banner, kategori, konteks, empty state, pemakaian seluruh header, serta test halaman/tabel yang terkait.
- Dokumentasi: dokumen ini, `admin-studio-ui.md` dan `workspace-visual-consistency.md`. Manifest seluruh perubahan direktori kerja tersedia pada [standar workspace](workspace-visual-consistency.md).

Tidak ada aset gambar, route, endpoint, dependency, env var atau konfigurasi deployment baru. Tier maskot empty dan CSS fallback ikon/lingkaran lama dihapus dari komponen terkait; semua empty state memakai ilustrasi tablet.
