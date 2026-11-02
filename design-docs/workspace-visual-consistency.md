# Standar visual workspace Admin dan Pengguna

## Banner bersama

[WorkspaceBanner](../components/dashboard/workspace-banner.tsx) dan CSS Module pendamping menjadi sumber tampilan banner di area Admin dan dashboard pengguna:

- Badge di atas judul selalu memiliki ikon. AdminBanner memberi kategori dan ikon menu melalui preset bertipe; halaman pengguna menyediakan badge kontekstualnya.
- Latar putih ke biru terang dilengkapi titik, grid yang memudar dan orbit di kanan. Pola statis berada di belakang konten dan tidak menerima pointer.
- Maskot menempati track sendiri: 144px pada desktop, 120px pada tablet, disembunyikan di bawah 640px. Gambar dibatasi bingkai dan mempertahankan rasio asli.
- Heading, ID, avatar, nama, deskripsi, filter dan CTA tetap berasal dari pemanggil.
- Dashboard Admin tetap mempunyai Proyek Baru, Proposal Baru dan Invoice Baru sesuai permission.
- Pengguna memakai banner pada Ringkasan, Proyek Saya, Pesanan, Kalkulator, Invoice, AI Relay serta detail proyek. Profil memakai page header standar tanpa kartu/mascot karena kartu identitas sudah memiliki corak dan satu maskot. Admin memakai banner pada daftar, detail/editor dan formulir yang tersedia.
- Variasi preset didukung melalui mascotPose dari workspace-mascots.ts dan sumber eksplisit melalui mascotImage. Visual kustom atau tanpa visual didukung melalui prop `mascot`; tidak ada fetching, state bisnis atau route baru.

Pola banner lokal yang berduplikasi dibersihkan. Aturan banner native admin dan aturan tab admin mengecualikan komponen bersama agar hasilnya tidak ditimpa CSS lama. Token global, website publik, backend dan data tidak berubah.

## Segmented tab

[WorkspaceTabsList dan WorkspaceTabsTrigger](../components/dashboard/workspace-segmented-tabs.tsx) membungkus Radix Tabs. Semua props, ref, event, nilai, status disabled dan akses keyboard diteruskan.

| Pemanggil              | Jumlah pilihan | Susunan                                                                        |
| ---------------------- | -------------- | ------------------------------------------------------------------------------ |
| Kalkulator Harga Admin | 4              | Empat kolom, dua pada container kecil                                          |
| AI Operations Admin    | 5              | Lima kolom; dua kolom dan pilihan terakhir penuh pada container menengah/kecil |
| AI Gateway Pengguna    | 8              | Delapan kolom; empat pada container maksimal 64rem; dua pada maksimal 36rem    |
| Pengaturan Situs Admin | 2              | Dua kolom sama lebar; label membungkus pada layar kecil                        |

Track selalu selebar container. Default trigger minimal 44px, teks 13px dengan pembungkusan label, fokus terlihat dan indikator aktif biru. Aturan container mencegah sidebar membuat tab berhimpitan. AI Relay pengguna memakai density compact (minimum 36px, teks 12px, ikon 16px); Admin/Kalkulator tetap default. State `?tab=`, alias, pemilihan model dan callback tetap mengikuti hook asli. Helper pengungkapan tab pengguna tetap menjaga navigasi terlihat di bawah header sticky.

## Empty state Admin

Pilihan peran Pengguna & Tim memakai navigasi tautan dengan aria-current, panel putih serta badge jumlah yang kontras. Timesheet menempatkan filter tanggal pada panel mandiri di bawah banner. Kontrak dan verifikasi tersedia pada [navigasi dan filter Admin](admin-navigation-controls-ui.md).

AdminEmptyState memakai aset tablet/dokumen biru yang sama dengan pengguna, berukuran 120px pada desktop dan 104px pada HP. Label konteks, judul, penjelasan dan CTA tersusun rata tengah; dekorasi memakai EmptyStatePattern bersama. Tidak ada fallback kucing/ikon. Spesifikasi tersedia pada [standar header dan empty state Admin](admin-header-empty-state-ui.md).

Tampilan ini dipakai pada order, proyek, proposal, invoice, konten, audit, analitik, timesheet, workload, kalkulator, metode pembayaran dan tab AI yang kosong. Teks field biasa seperti ketiadaan catatan tetap berupa fallback field.

Pada HP, tabel kosong tidak memaksakan lebar kolom tabel berisi data. Header kolom disembunyikan hanya ketika body memiliki empty state tunggal. Data berisi, filter, pagination, dan tautan detail tidak berubah.

`AdminMascot` menggunakan aset yang ada di `public/images/`. Pose relay, coding dan assistant mengarah ke gambar karakter kucing asli, bukan gambar teknologi generik. Grid gambar portrait dibatasi dengan `minmax(0, 1fr)` serta ukuran maksimum bingkai untuk mencegah tumpang tindih dengan pesan.

## Label integritas audit

Helper presentasi: [ledger-check-label.ts](../app/admin/ai-relay/_utils/ledger-check-label.ts).

| ID server                        | Label UI                         |
| -------------------------------- | -------------------------------- |
| `ROW_ARITHMETIC_INVARIANT`       | Kesesuaian perhitungan transaksi |
| `LIFETIME_SUM_INVARIANT`         | Kesesuaian akumulasi saldo       |
| `TRANSACTION_POLARITY_INVARIANT` | Kesesuaian arah transaksi        |
| `USAGE_LOG_RECONCILIATION`       | Rekonsiliasi catatan pemakaian   |
| `TOPUP_REQUEST_RECONCILIATION`   | Rekonsiliasi permintaan top-up   |

ID asli tetap digunakan sebagai key dan referensi data. Status, jumlah pelanggaran serta rincian tidak diubah. ID lain memperoleh fallback teks tanpa underscore; input kosong memperoleh label Pemeriksaan integritas.

## Verifikasi

- Test co-located mencakup banner/badge/visual, seluruh jumlah tab, callback/URL, data nol/panjang, daftar kosong/terisi, pagination, tindakan, helper label dan regresi gambar portrait.
- Browser memakai komponen asli dengan fixture dan action mock terisolasi pada 320, 824 dan 1440px. Seluruh delapan tab pengguna dan lima tab Admin diperiksa; lebar track sama dengan container, hanya satu tab aktif, URL mengikuti pilihan, aset tampil dan tidak ada overflow halaman.
- Empty state Admin memakai tablet/dokumen biru 120/104px di atas label dan teks. Banner desktop menempatkan visual 144px pada track kanan; visual disembunyikan pada HP.
- Perubahan runtime terbatas pada komposisi JSX, styling, preset gambar dan pemisahan toolbar presentasi. Hook profil/katalog, data fetching, rumus serta action tetap memakai implementasi asli.
- Pengujian terarah: `bun test app/admin app/dashboard components/dashboard components/ai-relay` menghasilkan **364 pass, 0 fail**, 133 berkas. Suite lengkap `bun test` pada salinan Linux bersih menghasilkan **798 pass, 0 fail**, 173 berkas.
- Prettier terarah, Next.js typegen dan TypeScript no-emit lulus. ESLint menghasilkan 0 error dengan empat warning existing di test backend yang tidak diedit; berkas UI yang diubah tidak menambah warning.
- Suite menggunakan database uji bersih per eksekusi. Fixture pembayaran memakai transaction ID tetap, sehingga database uji yang dipakai ulang perlu diinisialisasi bersih sebelum suite lengkap dijalankan lagi. Tidak ada perubahan kode pembayaran atau test backend.
- Suite lengkap menggunakan salinan repository dengan lockfile yang sama di Linux dan PostgreSQL sementara. File environment lokal tidak disalin; tidak ada mutasi akun atau transaksi produksi.
- Authenticated E2E, provider AI, pembayaran, publikasi dan perubahan permission produksi belum diverifikasi. Preview memakai mock untuk tindakan tersebut.

## Manifest perubahan

Daftar berikut mencakup komponen UI, test co-located dan dokumentasi. Tidak ada file backend, schema, route API, dependency atau konfigurasi produksi yang berubah.

<!-- FILE_MANIFEST -->

### Dimodifikasi

- `app/admin/_components/admin-common.module.css`
- `app/admin/_components/admin-empty-state.test.tsx`
- `app/admin/_components/admin-empty-state.tsx`
- `app/admin/_components/admin-mascot.test.tsx`
- `app/admin/_components/admin-mascot.tsx`
- `app/admin/_components/admin-page-header.test.tsx`
- `app/admin/_components/admin-page-header.tsx`
- `app/admin/_components/admin-surfaces.module.css`
- `app/admin/_components/overview/admin-overview.module.css`
- `app/admin/_components/overview/overview-charts.test.tsx`
- `app/admin/_components/overview/overview-charts.tsx`
- `app/admin/_components/overview/overview-hero.test.tsx`
- `app/admin/_components/overview/overview-hero.tsx`
- `app/admin/_components/overview/recent-activity-card.test.tsx`
- `app/admin/_components/overview/recent-activity-card.tsx`
- `app/admin/_components/overview/top-clients-card.test.tsx`
- `app/admin/_components/overview/top-clients-card.tsx`
- `app/admin/ai-relay/client-view.test.tsx`
- `app/admin/ai-relay/client-view.tsx`
- `app/admin/analytics/page.tsx`
- `app/admin/audit/page.test.tsx`
- `app/admin/audit/page.tsx`
- `app/admin/blog/[id]/edit/page.tsx`
- `app/admin/blog/_components/blog-table.tsx`
- `app/admin/blog/categories/_components/category-management.tsx`
- `app/admin/blog/categories/_components/category-table.tsx`
- `app/admin/blog/categories/page.tsx`
- `app/admin/blog/new/page.tsx`
- `app/admin/blog/page.test.tsx`
- `app/admin/blog/page.tsx`
- `app/admin/calculator/_components/add-ons-tab.tsx`
- `app/admin/calculator/_components/calculator-admin.tsx`
- `app/admin/calculator/_components/features-tab.tsx`
- `app/admin/calculator/_components/project-types-tab.tsx`
- `app/admin/calculator/page.tsx`
- `app/admin/error.tsx`
- `app/admin/files/page.test.tsx`
- `app/admin/files/page.tsx`
- `app/admin/invoices/[id]/_components/invoice-detail-header.tsx`
- `app/admin/invoices/_components/invoice-table.tsx`
- `app/admin/invoices/new/page.tsx`
- `app/admin/invoices/page.test.tsx`
- `app/admin/invoices/page.tsx`
- `app/admin/invoices/recurring/new/page.tsx`
- `app/admin/invoices/recurring/page.tsx`
- `app/admin/orders/page.test.tsx`
- `app/admin/orders/page.tsx`
- `app/admin/portfolio/[id]/edit/page.tsx`
- `app/admin/portfolio/_components/portfolio-table.test.tsx`
- `app/admin/portfolio/_components/portfolio-table.tsx`
- `app/admin/portfolio/new/page.tsx`
- `app/admin/portfolio/page.tsx`
- `app/admin/projects/[id]/_components/activity-tab.tsx`
- `app/admin/projects/[id]/_components/milestones-tab.tsx`
- `app/admin/projects/[id]/_components/project-detail-header.tsx`
- `app/admin/projects/[id]/_components/project-detail-tabs.tsx`
- `app/admin/projects/new/page.tsx`
- `app/admin/projects/page.test.tsx`
- `app/admin/projects/page.tsx`
- `app/admin/proposals/[id]/page.tsx`
- `app/admin/proposals/new/page.tsx`
- `app/admin/proposals/page.test.tsx`
- `app/admin/proposals/page.tsx`
- `app/admin/settings/_components/settings-form.test.tsx`
- `app/admin/settings/_components/settings-form.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/telegram-bot/client-view.tsx`
- `app/admin/testimonials/_components/testimonial-management.tsx`
- `app/admin/testimonials/_components/testimonial-table.test.tsx`
- `app/admin/testimonials/_components/testimonial-table.tsx`
- `app/admin/timesheet/page.test.tsx`
- `app/admin/timesheet/page.tsx`
- `app/admin/users/_components/team-workload-grid.tsx`
- `app/admin/users/_components/user-role-tabs.tsx`
- `app/admin/users/_components/user-table.tsx`
- `app/admin/users/page.tsx`
- `app/dashboard/_components/overview-layout.test.tsx`
- `app/dashboard/_components/overview-patterns.module.css`
- `app/dashboard/_components/overview-welcome.test.tsx`
- `app/dashboard/_components/overview-welcome.tsx`
- `app/dashboard/_components/overview.module.css`
- `app/dashboard/ai-relay/_components/relay-header.tsx`
- `app/dashboard/ai-relay/_components/relay-loading.test.tsx`
- `app/dashboard/ai-relay/_components/relay-loading.tsx`
- `app/dashboard/ai-relay/_components/relay-patterns.module.css`
- `app/dashboard/ai-relay/_components/relay-section-heading.test.tsx`
- `app/dashboard/ai-relay/_components/relay-tabs.test.tsx`
- `app/dashboard/ai-relay/_components/relay-tabs.tsx`
- `app/dashboard/ai-relay/_components/relay-workspace.module.css`
- `app/dashboard/calculator/_components/calculator-page.module.css`
- `app/dashboard/calculator/page.tsx`
- `app/dashboard/invoices/_components/invoices-frame.test.tsx`
- `app/dashboard/invoices/_components/invoices-frame.tsx`
- `app/dashboard/orders/_components/orders-frame.tsx`
- `app/dashboard/profile/_components/profile-frame.tsx`
- `app/dashboard/profile/_components/profile.module.css`
- `app/dashboard/projects/[id]/_components/project-header.tsx`
- `app/dashboard/projects/_components/project-list-header.tsx`
- `components/ai-relay/model-catalog.tsx`
- `components/dashboard/dashboard-tabs.test.ts`
- `components/dashboard/dashboard-tabs.ts`
- `design-docs/admin-studio-ui.md`
- `design-docs/dashboard-ai-relay-ui.md`
- `design-docs/dashboard-calculator-ui.md`
- `design-docs/dashboard-overview-ui.md`
- `design-docs/dashboard-profile-ui.md`

### Dibuat

- `app/admin/_components/admin-banner-usage.test.tsx`
- `app/admin/_components/admin-banner.test.tsx`
- `app/admin/_components/admin-banner.tsx`
- `app/admin/_data/admin-banner-categories.test.ts`
- `app/admin/_data/admin-banner-categories.ts`
- `app/admin/_data/admin-empty-contexts.test.ts`
- `app/admin/_data/admin-empty-contexts.ts`
- `app/admin/ai-relay/_utils/ledger-check-label.test.ts`
- `app/admin/ai-relay/_utils/ledger-check-label.ts`
- `app/admin/blog/_components/blog-table.test.tsx`
- `app/admin/blog/categories/_components/category-management.test.tsx`
- `app/admin/blog/categories/_components/category-table.test.tsx`
- `app/admin/calculator/_components/add-ons-tab.test.tsx`
- `app/admin/calculator/_components/calculator-admin.test.tsx`
- `app/admin/calculator/_components/project-types-tab.test.tsx`
- `app/admin/invoices/_components/invoice-table.test.tsx`
- `app/admin/projects/[id]/_components/activity-tab.test.tsx`
- `app/admin/projects/[id]/_components/project-detail-header.test.tsx`
- `app/admin/testimonials/_components/testimonial-management.test.tsx`
- `app/admin/timesheet/_components/timesheet-filters.module.css`
- `app/admin/timesheet/_components/timesheet-filters.test.tsx`
- `app/admin/timesheet/_components/timesheet-filters.tsx`
- `app/admin/users/_components/team-workload-grid.test.tsx`
- `app/admin/users/_components/user-role-tabs.module.css`
- `app/admin/users/_components/user-role-tabs.test.tsx`
- `app/admin/users/_components/user-table.test.tsx`
- `app/dashboard/calculator/page.test.tsx`
- `app/dashboard/orders/_components/orders-frame.test.tsx`
- `app/dashboard/profile/_components/profile-frame.test.tsx`
- `app/dashboard/projects/[id]/_components/project-header.test.tsx`
- `app/dashboard/projects/_components/project-list-header.test.tsx`
- `components/ai-relay/_components/model-catalog-toolbar.test.tsx`
- `components/ai-relay/_components/model-catalog-toolbar.tsx`
- `components/ai-relay/model-catalog.test.tsx`
- `components/dashboard/workspace-banner.module.css`
- `components/dashboard/workspace-banner.test.tsx`
- `components/dashboard/workspace-banner.tsx`
- `components/dashboard/workspace-mascots.test.ts`
- `components/dashboard/workspace-mascots.ts`
- `components/dashboard/workspace-segmented-tabs.module.css`
- `components/dashboard/workspace-segmented-tabs.test.tsx`
- `components/dashboard/workspace-segmented-tabs.tsx`
- `design-docs/admin-header-empty-state-ui.md`
- `design-docs/admin-navigation-controls-ui.md`
- `design-docs/dashboard-density-and-mascots.md`
- `design-docs/workspace-visual-consistency.md`
- `public/images/dashboard/banners/aldera-cat-calculator.webp`
- `public/images/dashboard/banners/aldera-cat-invoice.webp`

Tidak ada berkas yang dihapus. CSS dan opsi visual usang dibersihkan di dalam komponen terkait. Kontrak Admin tercantum pada [standar header dan empty state](admin-header-empty-state-ui.md) serta [navigasi dan filter Admin](admin-navigation-controls-ui.md); kontrak dashboard pengguna berada pada [kepadatan dashboard dan maskot](dashboard-density-and-mascots.md).
