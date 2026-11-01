# Antarmuka Admin Aldera Tech

Area `/admin` memakai warna, tipografi Plus Jakarta Sans, aksen biru, teks navy, serta kartu putih dari dashboard pengguna. Tema dibatasi oleh `AdminShell`; website publik dan area pengguna memakai tampilan masing-masing.

## Layout bersama

- Sidebar mempertahankan konfigurasi `getAdminNavConfig` beserta permission dan 18 menu asli. Menu aktif memakai pill biru. Sidebar dapat bergulir pada layar pendek dan tersedia melalui sheet pada HP.
- Header mempertahankan pencarian, notifikasi, avatar, dan dropdown akun tanpa teks breadcrumb `Admin / Dashboard` atau nama halaman pada bar atas, selaras dengan tampilan header halaman pengguna.
- Kanvas abu-abu kebiruan, kartu putih, border terlihat, dan bayangan halus memisahkan panel. Setiap kartu (`[data-slot="card"]`, `[data-admin-stat]`, serta kartu metrik/detail) dilengkapi corak dekoratif statis di belakang konten berupa lingkaran orbit konsentris, garis diagonal teknis pada sudut atas/header, dan matriks titik radial pada sudut bawah dengan aksen warna yang bervariasi; tabel memakai scroll di pembungkusnya dan tab memakai satu baris yang dapat digulir.
- Form, editor, badge, dialog, dropdown, dan skeleton mewarisi token admin. Tema portal dipasang saat admin dimuat dan dibersihkan ketika layout dilepas.
- Konfigurasi route dan permission tetap di `lib/routes.ts`, `lib/dashboard-nav.ts`, serta guard server yang sudah tersedia.

## Cakupan halaman

| Menu                        | Route implementasi       | Bagian yang mengikuti tema                                                                                                            |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard                   | `/admin`                 | Sambutan, tiga tindakan cepat sesuai permission, lima statistik, revenue 12 bulan, status proyek, lima client, aktivitas, operasional |
| Proyek                      | `/admin/projects`        | Daftar, filter, pagination, pembuatan, detail dan delapan tab proyek                                                                  |
| Permohonan Pesanan          | `/admin/orders`          | Daftar permohonan, filter status, detail dan tindakan yang tersedia                                                                   |
| Kalkulator Harga            | `/admin/calculator`      | Jenis proyek, fitur, add-on, konfigurasi, dialog                                                                                      |
| Proposal                    | `/admin/proposals`       | Daftar, pembuatan, detail, item dokumen dan tindakan asli                                                                             |
| Invoice                     | `/admin/invoices`        | Daftar, pembuatan, detail, kontrol status, invoice berkala dan formulir template                                                      |
| Timesheet                   | `/admin/timesheet`       | Rentang tanggal, statistik, tabel anggota dan proyek, ekspor                                                                          |
| Manajer Berkas              | `/admin/files`           | Upload, filter, kartu, unduh, tindakan dan empty state                                                                                |
| AI Gateway / Relay Ops      | `/admin/ai-relay`        | Lima tab: ringkasan keuangan, harga model, sinkronisasi, top-up dan audit ledger; tabel dan dialog                                    |
| Telegram Bot & Pembayaran   | `/admin/telegram-bot`    | Editor template, preview, nominal, metode pembayaran dan dialog                                                                       |
| Pendapatan & Profitabilitas | `/admin/analytics`       | Statistik asli, grafik revenue, profitabilitas dan Client LTV                                                                         |
| Blog                        | `/admin/blog`            | Daftar, filter, pembuatan dan editor artikel                                                                                          |
| Kategori Blog               | `/admin/blog/categories` | Daftar, pencarian dan dialog pengelolaan                                                                                              |
| Portfolio                   | `/admin/portfolio`       | Daftar, statistik konten, pembuatan dan editor studi kasus                                                                            |
| Testimoni                   | `/admin/testimonials`    | Daftar, filter, preview dan dialog                                                                                                    |
| Pengguna & Tim              | `/admin/users`           | Tab peran, tabel, workload dan dialog sesuai izin                                                                                     |
| Pengaturan Situs            | `/admin/settings`        | Profil website serta sosial/kontak                                                                                                    |
| Audit Log                   | `/admin/audit`           | Pelaku, aksi, entitas, waktu, filter dan pagination                                                                                   |

Halaman detail/editor menggunakan ID dan route asli: `projects/[id]`, `invoices/[id]`, `proposals/[id]`, `blog/[id]/edit`, serta `portfolio/[id]/edit`. Tidak ada modul atau tujuan navigasi baru.

## Dashboard dan formulir

Lima statistik menampilkan nilai server secara langsung, termasuk nol, dengan format mata uang asli. Susunan responsif menggunakan lima kolom ketika cukup lebar, tiga lalu dua pada ukuran menengah, dan dua lalu satu kartu penuh pada HP. Grafik menerima array sumber yang sama. Data kosong menampilkan pesan kosong, tanpa menambahkan grafik atau metrik contoh. Panel Top 5 Client by Revenue dan Aktivitas Terbaru disejajarkan tinggi tepi bawahnya (`align-items: stretch`); ketika jumlah client kurang dari 5, sisa slot peringkat ditampilkan sebagai slot tersedia (tanpa nama atau nominal fiktif) disertai ringkasan total revenue top client dan tautan menuju daftar invoice serta analitik revenue.

Seluruh kartu panel di dashboard admin dibuat ringkas (compact) dengan header padat (`px-5 py-3.5`), tipografi yang tegas dan proporsional (judul `text-sm font-semibold` + deskripsi `text-xs text-muted-foreground mt-0.5`), padding konten ringkas (`p-4.5`), serta penataan baris aktivitas dan tautan operasional yang hemat ruang vertikal. Desain tab navigasi kalkulator admin diseragamkan dengan standar pill bar dashboard (`dashboardTabsListClass` dan `dashboardTabsTriggerClass`), dan formulir pembuatan jenis proyek, fitur, serta add-on kalkulator ditata dalam layout grid harmonis satu kesatuan penuh (full width) tanpa pembagian kolom asimetris 7/5 yang menyisakan ruang kosong.

Grafik revenue dan pie memiliki prop opsional `animate` dengan default `true`. Admin memakai `false` agar grafik langsung terbaca tanpa animasi masuk; pemanggil lain mempertahankan perilaku sebelumnya.

Form invoice, proposal, dan template invoice berkala memiliki label per item yang selalu terlihat. Form proyek baru serta formulir dokumen menandai field wajib dan opsional sesuai aturan yang sudah tersedia. Penambahan ID pada kontrol yang sebelumnya belum memiliki ID hanya menghubungkan label; nama field, nilai awal, batas angka, handler, payload, pajak, subtotal dan total tetap mengikuti implementasi asli.

## Maskot

Seluruh ilustrasi maskot di area `/admin` dirender menggunakan komponen terstandarisasi `AdminMascot` (`app/admin/_components/admin-mascot.tsx`) dengan bingkai 1:1 (`aspect-ratio: 1 / 1`, `object-fit: contain`, `object-position: center bottom`) dan lingkaran orbit dekoratif di belakang karakter, sehingga baik aset berasio 1:1 (`512×512`) maupun 2:3 (`427×640`, `900×1350`, `1024×1536`) tampil dengan tinggi karakter yang konsisten:

- **Empat tier ukuran baku**:
  - `hero` (`92×92px` / `5.75rem × 5.75rem`): Sambutan utama Dashboard (`OverviewHero`).
  - `header` (`60×60px` / `3.75rem × 3.75rem` pada desktop/tablet, disembunyikan `< 640px`): Header halaman (`[data-admin-page-header]`) di seluruh menu admin.
  - `panel` (`42×42px` / `2.65rem × 2.65rem` pada desktop/tablet, `40×40px` pada mobile): Header kartu analitik dan operasional (`Revenue 12 Bulan Terakhir`, `Status Proyek`, `Top 5 Client by Revenue`, `Aktivitas Terbaru`, `Panel Operasional`).
  - `empty` (`76×76px` / `4.75rem × 4.75rem`): Ilustrasi kondisi kosong (`AdminEmptyState`).
- **Pemetaan pose kontekstual**: `guide` (Proyek, File Manager, Hero), `activity` (Order Requests, Timesheet, Aktivitas Terbaru), `portfolio` (Portfolio & Case Studies), `blog` (Blog & Kategori Blog), `relay` (AI Operations & Admin Portal), `coding` (Kalkulator Harga, Settings Website, Panel Operasional), `assistant` (Telegram Bot & Testimoni Klien), `services` (Invoice & Top 5 Client), `vision` (Revenue & Profitability), `contact` (Proposal), `users` (Pengguna & Tim), dan `security` (Audit Log).
- Seluruh maskot bersifat dekoratif (`alt=""`, `aria-hidden="true"`, `pointer-events: none`) dan tidak menghalangi interaksi.

## Batas integrasi dan kondisi data

Pengambilan data, auth, session, role, permission, query, perhitungan, server action, endpoint, model ID, tarif, saldo, ledger, pembayaran dan proses publikasi tetap berasal dari implementasi sebelumnya. Loading Dashboard mempunyai lima skeleton statistik. Error boundary admin menyediakan tindakan coba lagi tanpa menampilkan detail internal.

Empty state dan error yang telah ditangani komponen tetap mengikuti perilaku aslinya. Fallback `safeDb` yang mengembalikan daftar kosong tetap mengikuti kontrak tersebut; UI tidak menyimpulkan kegagalan database atau status pembayaran baru dari daftar kosong.

## Pemeriksaan

UI test co-located mencakup layout, guard autentikasi, header, statistik nol/nominal besar, array grafik, kondisi kosong, retry, label input, nilai awal, mode baru/edit, route detail, not-found, tab URL, tabel dan pagination. Fixture berada di `app/admin/_test-utils/` dan hanya diimpor pengujian, bukan halaman runtime.

Preview browser menggunakan komponen asli dan fixture terisolasi pada lebar 320, 820, 1440 dan 1936 px; data server serta server action diganti hanya dalam preview pengujian. Pemeriksaan meliputi menu mobile di layar pendek, tab, dialog portal, overflow, aset, serta pembersihan tema. Preview bukan pengujian autentikasi atau integrasi produksi.

Pembayaran, top-up, penghapusan, perubahan role, pengiriman dokumen, upload ke server dan publikasi produksi tidak dijalankan. Pengujian otomatis keseluruhan menggunakan database PostgreSQL sementara, kredensial pengujian dan endpoint eksternal pengujian; tidak menggunakan akun produksi.

### Hasil verifikasi

- Pengujian gabungan UI area admin, pengguna, komponen bersama, permission dan parameter route: **370 pass, 0 fail**, 120 berkas.
- Suite lengkap: **595 pass, 0 fail**, 132 berkas. Eksekusi menggunakan salinan proyek dalam kontainer Linux, dependency dari lockfile yang sama (`bun install --frozen-lockfile`), serta PostgreSQL sementara dengan skema dan seed router resmi. File environment lokal tidak disalin. Tidak ada perubahan dependency atau kode backend untuk pengujian ini.
- Verifikasi penuh memakai Linux dengan paket native gambar yang sesuai. Bun Windows pada lingkungan lokal mengalami timeout pada skenario backend Playground Chat; hasil suite lengkap yang dinyatakan lulus berasal dari lingkungan Linux tersebut.
- Linter, Prettier, Next.js typegen dan TypeScript no-emit lulus.
- Preview browser: 18 menu, formulir baru, lima detail/editor, seluruh tab AI Relay/Telegram/kalkulator/pengaturan, dialog model dan metode pembayaran, pencarian URL, serta sidebar mobile di layar pendek. Tidak ada overflow halaman atau aset rusak pada fixture yang diperiksa. Redirect tanpa session ke Login tetap sesuai route callback asli.
- Dua mock invoice pada pengujian halaman pengguna menyertakan seluruh ekspor action supaya pengujian UI admin dan pengguna dapat berjalan bersama dalam cache modul Bun. Tidak ada perubahan implementasi pembayaran pengguna.

## Berkas implementasi dan pengujian

Daftar berikut merupakan cakupan perubahan frontend beserta dokumentasi dan pengujiannya.

- `ai-agent-docs/roles-and-features.md`
- `app/admin/_components/admin-chrome.module.css`
- `app/admin/_components/admin-common.module.css`
- `app/admin/_components/admin-empty-state.test.tsx`
- `app/admin/_components/admin-empty-state.tsx`
- `app/admin/_components/admin-field-label.test.tsx`
- `app/admin/_components/admin-field-label.tsx`
- `app/admin/_components/admin-icon-art.test.tsx`
- `app/admin/_components/admin-icon-art.tsx`
- `app/admin/_components/admin-mascot.test.tsx`
- `app/admin/_components/admin-mascot.tsx`
- `app/admin/_components/admin-page-header.test.tsx`
- `app/admin/_components/admin-page-header.tsx`
- `app/admin/_components/admin-shell.test.tsx`
- `app/admin/_components/admin-shell.tsx`
- `app/admin/_components/admin-stat-card.test.tsx`
- `app/admin/_components/admin-stat-card.tsx`
- `app/admin/_components/admin-surfaces.module.css`
- `app/admin/_components/admin-theme.module.css`
- `app/admin/_components/overview/admin-overview-page.test.tsx`
- `app/admin/_components/overview/admin-overview-page.tsx`
- `app/admin/_components/overview/admin-overview.module.css`
- `app/admin/_components/overview/operational-panel.test.tsx`
- `app/admin/_components/overview/operational-panel.tsx`
- `app/admin/_components/overview/overview-charts.test.tsx`
- `app/admin/_components/overview/overview-charts.tsx`
- `app/admin/_components/overview/overview-hero.test.tsx`
- `app/admin/_components/overview/overview-hero.tsx`
- `app/admin/_components/overview/overview-stat-grid.test.tsx`
- `app/admin/_components/overview/overview-stat-grid.tsx`
- `app/admin/_components/overview/recent-activity-card.test.tsx`
- `app/admin/_components/overview/recent-activity-card.tsx`
- `app/admin/_components/overview/top-clients-card.test.tsx`
- `app/admin/_components/overview/top-clients-card.tsx`
- `app/admin/_test-utils/navigation.ts`
- `app/admin/_test-utils/page-mocks.ts`
- `app/admin/_test-utils/records.ts`
- `app/admin/_utils/overview-config.ts`
- `app/admin/ai-relay/client-view.tsx`
- `app/admin/analytics/page.test.tsx`
- `app/admin/analytics/page.tsx`
- `app/admin/audit/page.tsx`
- `app/admin/blog/[id]/edit/page.test.tsx`
- `app/admin/blog/[id]/edit/page.tsx`
- `app/admin/blog/_components/blog-form.test.tsx`
- `app/admin/blog/_components/blog-form.tsx`
- `app/admin/blog/categories/page.test.tsx`
- `app/admin/blog/categories/page.tsx`
- `app/admin/blog/new/page.test.tsx`
- `app/admin/blog/new/page.tsx`
- `app/admin/blog/page.tsx`
- `app/admin/calculator/_components/add-ons-tab.tsx`
- `app/admin/calculator/_components/calculator-admin.tsx`
- `app/admin/calculator/_components/config-tab.tsx`
- `app/admin/calculator/_components/features-tab.tsx`
- `app/admin/calculator/_components/project-type-fields.test.tsx`
- `app/admin/calculator/_components/project-type-fields.tsx`
- `app/admin/calculator/_components/project-types-tab.tsx`
- `app/admin/calculator/page.test.tsx`
- `app/admin/calculator/page.tsx`
- `app/admin/error.test.tsx`
- `app/admin/error.tsx`
- `app/admin/files/page.tsx`
- `app/admin/invoices/[id]/_components/invoice-detail-header.test.tsx`
- `app/admin/invoices/[id]/_components/invoice-detail-header.tsx`
- `app/admin/invoices/[id]/page.test.tsx`
- `app/admin/invoices/_components/invoice-create-form.test.tsx`
- `app/admin/invoices/_components/invoice-create-form.tsx`
- `app/admin/invoices/new/page.test.tsx`
- `app/admin/invoices/new/page.tsx`
- `app/admin/invoices/page.tsx`
- `app/admin/invoices/recurring/_components/recurring-form.test.tsx`
- `app/admin/invoices/recurring/_components/recurring-form.tsx`
- `app/admin/invoices/recurring/new/page.test.tsx`
- `app/admin/invoices/recurring/new/page.tsx`
- `app/admin/invoices/recurring/page.test.tsx`
- `app/admin/invoices/recurring/page.tsx`
- `app/admin/layout.test.tsx`
- `app/admin/layout.tsx`
- `app/admin/loading.test.tsx`
- `app/admin/loading.tsx`
- `app/admin/orders/page.tsx`
- `app/admin/page.test.tsx`
- `app/admin/portfolio/[id]/edit/page.test.tsx`
- `app/admin/portfolio/[id]/edit/page.tsx`
- `app/admin/portfolio/_components/portfolio-form.test.tsx`
- `app/admin/portfolio/_components/portfolio-form.tsx`
- `app/admin/portfolio/_components/portfolio-stat-grid.tsx`
- `app/admin/portfolio/new/page.test.tsx`
- `app/admin/portfolio/new/page.tsx`
- `app/admin/portfolio/page.test.tsx`
- `app/admin/portfolio/page.tsx`
- `app/admin/projects/[id]/_components/milestones-tab.test.tsx`
- `app/admin/projects/[id]/_components/milestones-tab.tsx`
- `app/admin/projects/[id]/_components/overview-tab.test.tsx`
- `app/admin/projects/[id]/_components/overview-tab.tsx`
- `app/admin/projects/[id]/page.test.tsx`
- `app/admin/projects/_components/project-create-form.test.tsx`
- `app/admin/projects/_components/project-create-form.tsx`
- `app/admin/projects/new/page.test.tsx`
- `app/admin/projects/new/page.tsx`
- `app/admin/projects/page.tsx`
- `app/admin/proposals/[id]/page.test.tsx`
- `app/admin/proposals/[id]/page.tsx`
- `app/admin/proposals/_components/proposal-create-form.test.tsx`
- `app/admin/proposals/_components/proposal-create-form.tsx`
- `app/admin/proposals/new/page.test.tsx`
- `app/admin/proposals/new/page.tsx`
- `app/admin/proposals/page.tsx`
- `app/admin/settings/_components/settings-fields.test.tsx`
- `app/admin/settings/_components/settings-fields.tsx`
- `app/admin/settings/page.test.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/telegram-bot/client-view.tsx`
- `app/admin/testimonials/_components/testimonial-management.tsx`
- `app/admin/testimonials/_components/testimonial-stat-grid.tsx`
- `app/admin/testimonials/page.test.tsx`
- `app/admin/timesheet/page.test.tsx`
- `app/admin/timesheet/page.tsx`
- `app/admin/users/page.test.tsx`
- `app/admin/users/page.tsx`
- `app/dashboard/invoices/_components/invoices-view.test.tsx`
- `app/dashboard/invoices/page.test.tsx`
- `components/dashboard/analytics-charts.test.tsx`
- `components/dashboard/analytics-charts.tsx`
- `components/dashboard/dashboard-header.test.tsx`
- `components/dashboard/dashboard-header.tsx`
- `design-docs/admin-studio-ui.md`
