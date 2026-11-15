# Konsistensi UI Admin dan Pengguna

## Batas perubahan

Area Admin dan dashboard Pengguna memakai fondasi visual bersama. Perubahan mencakup presentasi status invoice, offset sticky, tema portal, dialog Aktivitas, kontrol, badge, kartu, tab, teks tampilan dan pose maskot yang tersedia. Query, autentikasi, permission, backend, sumber data, nomor dokumen, nominal, tarif, pembayaran dan tujuan navigasi tidak berubah.

Sidebar Admin tetap lebih lebar untuk menu operasional. Tabel Admin tetap mendukung perbandingan data dan scroll lokal; Invoice Pengguna mempertahankan kartu mobile. Profil mempertahankan header sederhana dan satu maskot pada kartu identitas.

## Kompatibilitas backend

Paket UI memakai backend staging dari PR #28 (`528c28b`). Berkas backend, schema Prisma, autentikasi, perhitungan dan integrasi tetap mengikuti staging. Validasi mencakup seluruh regresi backend bersama antarmuka yang akan dipublikasikan.

## Token dan kontrol

Sumber token: components/dashboard/overview-chrome.module.css. Sumber aturan kontrol dan portal: workspace-controls.module.css di direktori yang sama.

| Elemen                 | Standar                                                      |
| ---------------------- | ------------------------------------------------------------ |
| Warna                  | Biru dan navy Aldera Tech, kanvas kebiruan rata, kartu putih |
| Header workspace       | 64px; offset sticky memakai --workspace-header-height        |
| Kontrol standar        | Minimum 40px desktop, 44px pada HP                           |
| Teks utama / metadata  | 14px / 12px; input HP 16px                                   |
| Radius kontrol / kartu | 12px / 20px                                                  |
| Tindakan banner        | Pill, minimum 44px                                           |
| Empty state standar    | Ilustrasi 120px desktop, 104px HP; judul 18px                |

Komponen berinformasi padat seperti tab compact dan toolbar AI tetap memiliki varian ringkas eksplisit. Kartu ringkasan yang kecil dapat mempertahankan ilustrasi compact. Tidak ada perubahan pada design token global website publik.

Badge menggunakan data-variant dari komponen primitif. Info berwarna biru pastel; status netral abu-abu kebiruan; sukses hijau pastel; peringatan peach; kesalahan merah pastel. Teks status tetap terlihat sehingga makna tidak bergantung pada warna. Corak kartu Admin memakai aksen biru tetap, tanpa pemilihan warna berdasarkan urutan nth-child.

## Status invoice

Tabel Admin menampilkan label dan varian dari invoiceStatusMeta menggunakan inv.status, sama dengan Pengguna. Tanggal yang sudah lewat tidak mengganti label SENT atau PENDING_VERIFICATION menjadi Overdue di frontend Admin. OVERDUE tetap tampil sebagai Lewat Jatuh Tempo saat status tersebut berasal dari sistem. Nominal, status tersimpan, filter, pagination, bulk action, PDF dan pembayaran tidak berubah.

## Tema portal dan aksesibilitas

AdminShell dan OverviewShell memakai useWorkspacePortalTheme. Hook menerapkan kelas token/kontrol pada body agar popup di portal mewarisi tema workspace. Helper mountWorkspacePortalTheme mempertahankan kelas bersama selama perpindahan layout dan mengembalikan kelas serta atribut yang sudah ada ketika pemilik terakhir dilepas. Pengguna hanya mengaktifkan tema pada route studio yang tersedia. Halaman publik memperoleh tema aslinya setelah keluar dari workspace.

Dropdown, submenu, pilihan select dan tombol penutup dialog memiliki marker data-slot yang sesuai dengan selector styling. Props, event, disabled, nilai, posisi popup dan ref tetap diteruskan oleh komponen primitif.

Dialog Aktivitas memakai primitive Dialog Radix yang sama dengan dialog standar. Fokus masuk ke dialog, tetap di dalamnya, dan kembali ke pemicu setelah ditutup. Escape, klik di luar, scroll lock serta hubungan judul/deskripsi ditangani primitive. Isi riwayat lengkap tetap diteruskan dan dirender saat dialog terbuka; markup dialog tertutup tidak mengekspos riwayat ke urutan fokus.

## Tab dan bahasa tampilan

WorkspaceTabsList/WorkspaceTabsTrigger dipakai pada AI Pengguna, AI Admin, Kalkulator Harga Admin, Pengaturan Situs, Telegram Bot, serta detail proyek kedua area. Nilai tab dan sinkronisasi query tab tetap sama. Enam pilihan memakai enam/tiga/dua kolom; delapan pilihan memakai delapan/empat/dua kolom sesuai lebar container. Satu tab aktif dan seluruh label tetap tersedia pada HP.

Tab sticky detail proyek Admin memakai workspace-layout.module.css dan token tinggi header. Label tab detail menggunakan Ringkasan, Tahapan, Tugas, Aktivitas, Diskusi, Waktu, Berkas, Invoice, atau Linimasa sesuai bagian yang tersedia. Judul Pengaturan Situs, Undang Pengguna dan Pendapatan & Profitabilitas menggunakan Bahasa Indonesia. ID, nilai query dan istilah teknis API tidak diubah.

Banner Invoice Admin memakai aldera-cat-invoice.webp dan Kalkulator Admin memakai aldera-cat-calculator.webp yang juga digunakan Pengguna. Tidak ada aset baru. Empty state tetap memakai tablet/dokumen biru di public/images/about/technology/design.webp.

## Pemeriksaan

- Pemetaan test mencakup shell, banner, tab, badge, dropdown, select, dialog, invoice, empty state dan seluruh pemanggil terkait. Test primitif UI baru memverifikasi penerusan props/event/disabled serta marker styling; test helper portal mencakup pemulihan tema dan perpindahan layout.
- Regresi invoice mencakup SENT, PENDING_VERIFICATION dan OVERDUE dengan tanggal lampau tanpa mengubah status sistem.
- Test aktivitas memeriksa dua item pratinjau dan penerusan enam log lengkap ke dialog, sekaligus memastikan dialog tertutup tidak mengekspos kontennya.
- Regresi UI terkait: 48 pass, 0 fail, 16 berkas. Suite lengkap bun test di Linux dengan lockfile dan database PostgreSQL sementara: 890 pass, 0 fail, 208 berkas. Schema router mengikuti sumber yang digunakan CI; file environment lokal tidak disalin dan data aplikasi tidak dimutasi.
- Browser fixture memakai React, komponen asli dan CSS proyek pada lebar 320, 824 dan 1440px. Tidak ada overflow halaman. Header kedua area 64px; kontrol 40/44px; badge invoice 12px dengan label serta warna yang sama; dropdown memakai Plus Jakarta Sans dan radius 12px.
- Dialog Aktivitas lulus pemeriksaan fokus awal, penahanan fokus, perpindahan Tab pada batas dialog, Escape, penutupan dan pengembalian fokus pada desktop/HP. Delapan tab proyek Admin tetap memperbarui URL dengan nilai aslinya.
- Pada pengujian scroll, posisi atas tab sticky dan tepi bawah header sama-sama 64px pada desktop serta HP. Input pencarian katalog tetap 36px; teksnya 14px pada desktop dan 16px pada HP. Kedua empty state standar terukur 104px pada viewport 320px.
- TypeScript no-emit, Next.js typegen dan formatter lulus. ESLint 0 error dan 0 warning.
- Browser memakai fixture dan action mock. Pengujian E2E dengan sesi produksi, transaksi, unggah bukti, perubahan akun dan integrasi provider sungguhan tidak dijalankan.

## Berkas

Manifest di bawah mencakup perubahan task ini. Detail runtime berada pada komponen bersama dan pemanggil UI; tidak ada endpoint, schema, dependency atau variabel lingkungan baru.

<!-- TASK_FILES -->

### Dimodifikasi

- `ai-agent-docs/brand-context.md`
- `app/admin/_components/admin-chrome.module.css`
- `app/admin/_components/admin-common.module.css`
- `app/admin/_components/admin-mascot.tsx`
- `app/admin/_components/admin-shell.test.tsx`
- `app/admin/_components/admin-shell.tsx`
- `app/admin/_components/admin-surfaces.module.css`
- `app/admin/analytics/page.tsx`
- `app/admin/calculator/page.tsx`
- `app/admin/invoices/_components/invoice-table.test.tsx`
- `app/admin/invoices/_components/invoice-table.tsx`
- `app/admin/invoices/page.tsx`
- `app/admin/projects/[id]/_components/project-detail-tabs.test.tsx`
- `app/admin/projects/[id]/_components/project-detail-tabs.tsx`
- `app/admin/settings/page.test.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/telegram-bot/client-view.tsx`
- `app/admin/users/page.tsx`
- `app/dashboard/_components/overview-activity-dialog.tsx`
- `app/dashboard/_components/overview-activity.module.css`
- `app/dashboard/_components/overview-activity.test.tsx`
- `app/dashboard/_components/overview-shell.tsx`
- `app/dashboard/invoices/_components/invoices.module.css`
- `app/dashboard/orders/_components/orders-empty-state.test.tsx`
- `app/dashboard/orders/_components/orders-empty-state.tsx`
- `app/dashboard/projects/[id]/page.test.tsx`
- `app/dashboard/projects/[id]/page.tsx`
- `app/dashboard/projects/_components/project-list.module.css`
- `app/dashboard/projects/_components/projects-empty-state.test.tsx`
- `app/dashboard/projects/_components/projects-empty-state.tsx`
- `components/dashboard/overview-chrome.module.css`
- `components/dashboard/workspace-banner.module.css`
- `components/dashboard/workspace-segmented-tabs.module.css`
- `components/dashboard/workspace-segmented-tabs.test.tsx`
- `components/ui/badge.tsx`
- `components/ui/dialog.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/select.tsx`
- `design-docs/admin-header-empty-state-ui.md`
- `design-docs/admin-navigation-controls-ui.md`
- `design-docs/admin-studio-ui.md`
- `design-docs/dashboard-density-and-mascots.md`
- `design-docs/dashboard-invoices-ui.md`
- `design-docs/dashboard-overview-ui.md`
- `design-docs/workspace-visual-consistency.md`

### Dibuat

- `app/dashboard/_components/overview-activity-dialog.test.tsx`
- `components/dashboard/use-workspace-portal-theme.ts`
- `components/dashboard/workspace-controls.module.css`
- `components/dashboard/workspace-controls.test.ts`
- `components/dashboard/workspace-layout.module.css`
- `components/dashboard/workspace-portal-theme.test.ts`
- `components/dashboard/workspace-portal-theme.ts`
- `components/ui/badge.test.tsx`
- `components/ui/dialog.test.tsx`
- `components/ui/dropdown-menu.test.tsx`
- `components/ui/select.test.tsx`
- `design-docs/workspace-ui-consistency.md`

### Dihapus

- `components/dashboard/dashboard-tabs.test.ts`
- `components/dashboard/dashboard-tabs.ts`
