# Antarmuka Admin Aldera Tech

Area `/admin` memakai Plus Jakarta Sans, aksen biru, teks navy, kanvas abu-abu kebiruan, kartu putih, border terlihat dan bayangan halus. Tema dibatasi oleh `AdminShell`; website publik dan area pengguna mempertahankan tema masing-masing.

## Layout dan banner

Sidebar mempertahankan konfigurasi `getAdminNavConfig`, permission serta 18 menu asli. Menu aktif memakai pill biru. Sidebar dapat bergulir pada layar pendek dan tersedia melalui sheet pada HP. Header mempertahankan pencarian, notifikasi, avatar dan dropdown akun tanpa breadcrumb tambahan.

Semua banner memakai AdminBanner di atas WorkspaceBanner, dengan kategori dan ikon sesuai menu dari admin-banner-categories.ts. Judul/deskripsi, pola titik/grid, orbit dan maskot 144px desktop atau 120px tablet tetap proporsional; visual disembunyikan di bawah 640px. Subjudul memakai Bahasa Indonesia. Tiga pintasan Dashboard, filter tanggal dan tindakan banner lain mempertahankan handler/parameter asli. Pemetaan lengkap tersedia di [standar header dan empty state](admin-header-empty-state-ui.md).

Kartu operasional memakai corak lokal statis di belakang isi; dekorasi tidak menghalangi klik. Tabel menggulir di pembungkusnya. Form, editor, badge, dialog, dropdown dan skeleton memakai token admin. Tema portal dibersihkan ketika layout dilepas.

## Cakupan halaman

| Menu                        | Route implementasi       | Bagian bertema                                                       |
| --------------------------- | ------------------------ | -------------------------------------------------------------------- |
| Dashboard                   | `/admin`                 | Banner, tindakan cepat, statistik, grafik, aktivitas dan operasional |
| Proyek                      | `/admin/projects`        | Daftar, filter, pagination, pembuatan, detail dan tab proyek         |
| Permohonan Pesanan          | `/admin/orders`          | Daftar, filter status, detail dan tindakan                           |
| Kalkulator Harga            | `/admin/calculator`      | Jenis proyek, fitur, add-on, konfigurasi dan dialog                  |
| Proposal                    | `/admin/proposals`       | Daftar, pembuatan, detail dan item dokumen                           |
| Invoice                     | `/admin/invoices`        | Daftar, pembuatan, detail, status dan invoice berkala                |
| Timesheet                   | `/admin/timesheet`       | Rentang tanggal, statistik, tabel dan ekspor                         |
| Manajer Berkas              | `/admin/files`           | Upload, filter, kartu, unduh dan empty state                         |
| AI Gateway / Relay Ops      | `/admin/ai-relay`        | Ringkasan, harga model, sinkronisasi, top-up dan audit ledger        |
| Telegram Bot & Pembayaran   | `/admin/telegram-bot`    | Template, preview, nominal, metode pembayaran dan dialog             |
| Pendapatan & Profitabilitas | `/admin/analytics`       | Statistik, revenue, profitabilitas dan Client LTV                    |
| Blog                        | `/admin/blog`            | Daftar, filter, pembuatan dan editor                                 |
| Kategori Blog               | `/admin/blog/categories` | Daftar, pencarian dan dialog                                         |
| Portfolio                   | `/admin/portfolio`       | Daftar, statistik, pembuatan dan editor studi kasus                  |
| Testimoni                   | `/admin/testimonials`    | Daftar, filter, preview dan dialog                                   |
| Pengguna & Tim              | `/admin/users`           | Peran, tabel, workload dan dialog sesuai izin                        |
| Pengaturan Situs            | `/admin/settings`        | Profil website, sosial dan kontak                                    |
| Audit Log                   | `/admin/audit`           | Pelaku, aksi, entitas, waktu, filter dan pagination                  |

Detail/editor memakai ID dan route asli: `projects/[id]`, `invoices/[id]`, `proposals/[id]`, `blog/[id]/edit` dan `portfolio/[id]/edit`. Route, guard dan permission tetap berada pada implementasi yang tersedia.

## Dashboard, tab dan formulir

Lima statistik menampilkan nilai server langsung termasuk nol. Grafik menggunakan array sumber dan satuan asli; data kosong tidak menghasilkan metrik contoh. Panel Top 5 Client dan Aktivitas memiliki tepi bawah sejajar. Slot client yang tersedia tidak diberi nama atau nominal fiktif. Grafik admin memakai `animate={false}`; default pemanggil lain tetap berlaku.

Navigasi Kalkulator Harga (empat tab), AI Operations (lima tab) dan Pengaturan Situs (dua tab) menggunakan `WorkspaceTabsList` / `WorkspaceTabsTrigger`. Setiap pilihan mengisi lebar track secara merata, memakai label yang dapat membungkus, tinggi minimal 44px dan indikator aktif biru. Breakpoint mengikuti lebar container. Nilai tab, callback, URL dan akses keyboard Radix tetap dipertahankan. Tab detail proyek mempertahankan navigasi aslinya.

Pilihan peran Pengguna & Tim memakai panel putih, teks navy, penanda aktif biru dan badge jumlah yang kontras. Filter tanggal Timesheet berada pada panel terpisah di bawah banner, dengan input serta tindakan sejajar. Kontrak field, izin dan parameter URL tercantum pada [navigasi dan filter Admin](admin-navigation-controls-ui.md).

Form jenis proyek, fitur dan add-on memakai lebar penuh. Form dokumen mempertahankan label, ID, field wajib/opsional, nilai awal, handler, payload, pajak, subtotal dan total. Tidak ada perubahan validasi atau tindakan server.

## Maskot dan empty state

`AdminMascot` memakai aset karakter asli yang tersedia, bingkai persegi dan `object-fit: contain`. Ukuran visual banner dikendalikan `WorkspaceBanner` (144/120px); maskot panel sekitar 42px. Maskot hanya dipakai pada banner dan panel, sedangkan empty state memakai tablet/dokumen biru. Track grid dan gambar dibatasi tinggi/lebar bingkai agar aset portrait tidak menimpa teks. Gambar bersifat dekoratif: alt kosong, `aria-hidden` dan tanpa intersepsi pointer.

Pose kontekstual meliputi guide, activity, portfolio, blog, relay, coding, assistant, services, vision, contact, users dan security. Relay memakai `aldera-cat-relay-connect.webp`, coding memakai `aldera-cat-services.webp`, serta assistant memakai `aldera-cat-relay-peek.webp`. Tidak ada aset baru.

AdminEmptyState memakai tablet/dokumen biru yang sama dengan pengguna, diikuti label konteks uppercase, judul, deskripsi dan CTA opsional. Preset berada di admin-empty-contexts.ts, dengan override teks untuk keadaan khusus. Gambar 120px pada desktop dan 104px pada HP. EmptyStatePattern mempertahankan lingkaran kiri serta simbol kode kanan. Panel dalam kartu/tabel tidak mempunyai border/pola ganda; padding sel pertama/terakhir dilepas pada kondisi kosong. Header kolom dan minimum width tabel dilepas hanya ketika tabel kosong pada HP.

Label audit ledger ramah pengguna diturunkan dari ID asli melalui helper presentasi. Status, jumlah pelanggaran, key dan rincian tetap menggunakan data server. Pemetaan lengkap tersedia pada [standar visual workspace](workspace-visual-consistency.md).

## Batas fungsi dan pemeriksaan

Auth, role, permission, query, action, endpoint, model ID, tarif, saldo, ledger, pembayaran dan publikasi tidak diubah. Fallback `safeDb` tetap mengikuti kontrak semula; daftar kosong tidak ditafsirkan sebagai kegagalan database atau pembayaran selesai.

UI test co-located meliputi rendering, metadata, route, angka nol/panjang, kondisi kosong, error/retry, pagination, form dan navigasi tab/URL. Preview browser memakai komponen asli, fixture serta action mock. Integrasi provider, pembayaran, publikasi dan perubahan izin produksi tidak dijalankan. Hasil verifikasi dan manifest file aktif tersedia di [standar visual workspace](workspace-visual-consistency.md).

Hasil verifikasi, kontrak props dan daftar komponen tersedia di [standar header dan empty state Admin](admin-header-empty-state-ui.md).
