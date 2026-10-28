# Aldera Tech: System Roles & Features Specification

Dokumen spesifikasi teknis arsitektur peran (_Role-Based Access Control_), hak akses (_permissions_), rute (_routes_), dan fitur sistem Aldera Tech. Dirancang untuk referensi deterministik bagi agen kecerdasan buatan (AI / LLM).

---

## 1. Definisi Peran Sistem (System Roles Registry)

Sistem mengimplementasikan 3 peran terautentikasi dan 1 peran publik (_unauthenticated_):

```yaml
roles:
  ADMIN:
    label: "Admin"
    description: "Super Admin dengan wewenang penuh atas seluruh operasional agensi, finansial, keamanan, dan konfigurasi sistem."
    auth_boundary: "Internal Staff"
    entry_route: "/admin"
    allowed_routes:
      - "/admin/*"
      - "/api/admin/*"
      - "/dashboard/*"
    permission_policy: "ALL"
    responsibilities:
      - "Manajemen pengguna & hak akses"
      - "Invoicing, penagihan recurring, & pengiriman tagihan multi-channel"
      - "Analisis profitabilitas proyek, revenue, & Client LTV"
      - "Manajemen proposal & konversi otomatis ke proyek"
      - "Tinjauan order requests & konfigurasi master kalkulator"
      - "Publikasi artikel blog & taxonomy kategori"
      - "Audit log keamanan sistem & monitoring IP"
      - "Pengaturan brand, kontak, SEO, dan CMS website"

  DEVELOPER:
    label: "Developer"
    description: "Staf produksi teknis dan kreatif yang bertanggung jawab atas eksekusi dan delivery proyek."
    auth_boundary: "Internal Staff"
    entry_route: "/admin"
    allowed_routes:
      - "/admin/projects/*"
      - "/admin/timesheet"
      - "/admin/users"
      - "/admin/files"
      - "/admin/blog"
      - "/admin/blog/new"
      - "/admin/blog/[id]/edit"
      - "/api/admin/export/timesheet"
      - "/api/admin/export/projects"
    permission_policy: "RESTRICTED_STAFF"
    permissions:
      - "project.viewAll"
      - "project.create"
      - "project.edit"
      - "file.manage"
      - "blog.view"
      - "blog.create"
      - "blog.edit"
      - "timesheet.view"
      - "team.view"
      - "portfolio.view"
      - "portfolio.manage"
      - "testimonial.view"
    responsibilities:
      - "Pelaksanaan delivery proyek dan manajemen milestone"
      - "Manajemen tugas teknis & desain pada Kanban Board"
      - "Pencatatan waktu kerja (time tracking) & monitoring timesheet tim"
      - "Pemantauan kapasitas beban kerja tim (team workload)"
      - "Pengelolaan berkas dan aset proyek"
      - "Penyusunan dan pengeditan draf artikel blog"
      - "Komunikasi terstruktur dalam forum diskusi proyek"

  CLIENT:
    label: "Client"
    description: "Klien terdaftar yang berkolaborasi dalam proyek dan mengelola faktur pembayaran."
    auth_boundary: "Client Portal"
    entry_route: "/dashboard"
    allowed_routes:
      - "/dashboard/*"
      - "/api/invoices/[id]/pdf"
    permission_policy: "CLIENT_PORTAL"
    permissions: []
    responsibilities:
      - "Pemantauan progres dan tahapan proyek pribadi"
      - "Review dan persetujuan/penolakan milestone proyek (Milestone Approval)"
      - "Tinjauan tugas tim pada Kanban task board"
      - "Unduh deliverable dan unggah dokumen kebutuhan proyek"
      - "Komunikasi langsung pada tab diskusi proyek"
      - "Tinjauan faktur pembayaran dan unduh PDF invoice"
      - "Simulasi kalkulator harga mandiri & pengajuan order request"
      - "Pengelolaan profil akun dan kata sandi"

  GUEST:
    label: "Guest / Public"
    description: "Pengunjung umum tanpa autentikasi."
    auth_boundary: "Public"
    entry_route: "/"
    allowed_routes:
      - "/"
      - "/about"
      - "/services"
      - "/portfolio/*"
      - "/pricing"
      - "/faq"
      - "/blog/*"
      - "/testimonials"
      - "/contact"
      - "/proposal/[token]"
      - "/login"
      - "/register"
      - "/forgot-password"
      - "/reset-password"
    permission_policy: "PUBLIC"
    permissions: []
    responsibilities:
      - "Membaca profil perusahaan, portofolio, dan studi kasus"
      - "Membaca artikel blog publik"
      - "Melihat paket harga publik"
      - "Mengirimkan pesan kontak / pesan konsultasi WhatsApp"
      - "Meninjau dan menandatangani proposal resmi secara digital via token"
      - "Melakukan registrasi akun klien atau login sistem"
```

### 1.1 Arsitektur Multi-Role per User

Sistem mengadopsi model **Multi-Role**: setiap akun pengguna (`User`) dapat memiliki **satu atau lebih role** secara simultan (`roles: Role[]`), misalnya kombinasi `["ADMIN", "DEVELOPER"]`.

- **Evaluasi Hak Akses (Union Permissions)**: Pengguna memiliki seluruh izin (_permissions_) yang merupakan gabungan (_union_) dari seluruh peran yang diembannya (`getEffectivePermissions(roles)`).
- **Hierarki Primary Role**: Untuk kebutuhan presentasi tunggal atau fallback kompatibilitas sesi (`session.user.role`), primary role dihitung berdasarkan hierarki: `ADMIN` > `DEVELOPER` > `CLIENT`.
- **Akses Boundary**: Jika salah satu peran pengguna termasuk dalam `STAFF_ROLES` (`ADMIN` atau `DEVELOPER`), pengguna memiliki hak akses penuh ke area internal `/admin`. Pengguna dengan role `["ADMIN", "DEVELOPER"]` memiliki akses ganda baik fungsi manajerial admin maupun operasional teknis pengembang.

---

## 2. Registry Izin Sistem (Permission Constants Registry)

Daftar izin baku yang didefinisikan dalam `lib/permissions.ts`:

```yaml
permissions_registry:
  user.manage:
    description: "Membuat, mengedit, mengubah role, dan menonaktifkan pengguna."
    module: "Users"
    granted_to: ["ADMIN"]

  project.viewAll:
    description: "Melihat seluruh daftar proyek di agensi."
    module: "Projects"
    granted_to: ["ADMIN", "DEVELOPER"]

  project.create:
    description: "Membuat proyek baru."
    module: "Projects"
    granted_to: ["ADMIN", "DEVELOPER"]

  project.edit:
    description: "Mengedit proyek, tugas Kanban, milestones, dan progres."
    module: "Projects"
    granted_to: ["ADMIN", "DEVELOPER"]

  project.delete:
    description: "Menghapus proyek secara permanen dari sistem."
    module: "Projects"
    granted_to: ["ADMIN"]

  invoice.view:
    description: "Melihat daftar dan detail seluruh faktur pembayaran agensi."
    module: "Invoices"
    granted_to: ["ADMIN"]

  invoice.create:
    description: "Membuat invoice baru dan template recurring invoice."
    module: "Invoices"
    granted_to: ["ADMIN"]

  invoice.edit:
    description: "Memperbarui invoice, menandai lunas, dan mengubah status."
    module: "Invoices"
    granted_to: ["ADMIN"]

  invoice.delete:
    description: "Menghapus invoice dari sistem."
    module: "Invoices"
    granted_to: ["ADMIN"]

  invoice.send:
    description: "Mengirimkan invoice ke klien via WhatsApp API (Fonnte)."
    module: "Invoices"
    granted_to: ["ADMIN"]

  blog.view:
    description: "Melihat daftar artikel blog pada panel admin."
    module: "Blog"
    granted_to: ["ADMIN", "DEVELOPER"]

  blog.create:
    description: "Menulis artikel blog baru dan menyimpan draf."
    module: "Blog"
    granted_to: ["ADMIN", "DEVELOPER"]

  blog.edit:
    description: "Menyunting artikel blog yang sudah ada."
    module: "Blog"
    granted_to: ["ADMIN", "DEVELOPER"]

  blog.publish:
    description: "Mempublikasikan artikel blog secara langsung atau terjadwal."
    module: "Blog"
    granted_to: ["ADMIN"]

  blog.delete:
    description: "Menghapus artikel blog dari sistem."
    module: "Blog"
    granted_to: ["ADMIN"]

  file.manage:
    description: "Mengunggah, menghubungkan, dan menghapus berkas aset proyek."
    module: "Files"
    granted_to: ["ADMIN", "DEVELOPER"]

  proposal.manage:
    description: "Membuat proposal, generate token, dan konversi ke proyek."
    module: "Proposals"
    granted_to: ["ADMIN"]

  analytics.view:
    description: "Melihat metrik omset, profitabilitas proyek, dan Client LTV."
    module: "Analytics"
    granted_to: ["ADMIN"]

  timesheet.view:
    description: "Melihat akumulasi jam kerja tim dan ekspor timesheet CSV."
    module: "Timesheet"
    granted_to: ["ADMIN", "DEVELOPER"]

  team.view:
    description: "Melihat pemantauan kapasitas dan beban kerja tim mingguan pada modul Pengguna & Tim."
    module: "Team"
    granted_to: ["ADMIN", "DEVELOPER"]

  audit.view:
    description: "Melihat riwayat audit log keamanan dan alamat IP pengguna."
    module: "Audit"
    granted_to: ["ADMIN"]

  settings.manage:
    description: "Mengelola profil brand, SEO, dan kontak."
    module: "Settings"
    granted_to: ["ADMIN"]
```

---

## 3. Matriks Rute & Otorisasi (Route Authorization Matrix)

> [!IMPORTANT]
> Dalam kode program, **dilarang menulis rute URL secara langsung (_hardcoded string_)**. Seluruh rute dan endpoint sistem didaftarkan secara terpusat pada [`lib/routes.ts`](../lib/routes.ts). Silakan merujuk ke [`ai-agent-docs/routes-and-navigation.md`](routes-and-navigation.md) untuk panduan implementasi.

Pemetaan pola URL ke peran dan izin yang disyaratkan:

| Pola URL                                      | Akses Peran                             | Izin Diperlukan                  | Aksi yang Tersedia                                                                                                          |
| :-------------------------------------------- | :-------------------------------------- | :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `/*` (Public marketing)                       | `GUEST`, `CLIENT`, `DEVELOPER`, `ADMIN` | `-`                              | Akses publik landing page, about, services, faq, testimonials.                                                              |
| `/portfolio`, `/portfolio/[slug]`             | `GUEST`, `CLIENT`, `DEVELOPER`, `ADMIN` | `-`                              | Baca etalase portofolio dan studi kasus proyek.                                                                             |
| `/pricing`                                    | `GUEST`, `CLIENT`, `DEVELOPER`, `ADMIN` | `-`                              | Tinjau paket harga publik, komparasi fitur, dan kalkulator estimasi proyek (#calculator).                                   |
| `/blog`, `/blog/[slug]`                       | `GUEST`, `CLIENT`, `DEVELOPER`, `ADMIN` | `-`                              | Baca artikel blog publik, pencarian judul, filter kategori.                                                                 |
| `/contact`                                    | `GUEST`, `CLIENT`, `DEVELOPER`, `ADMIN` | `-`                              | Kirim pesan kontak, klik CTA WhatsApp konsultasi.                                                                           |
| `/proposal/[token]`                           | `GUEST`, `CLIENT`, `DEVELOPER`, `ADMIN` | Token Unik                       | Tinjau proposal resmi, tanda tangan digital via canvas, terima/tolak.                                                       |
| `/login`, `/register`                         | `GUEST` (redirect jika login)           | `-`                              | Autentikasi sesi dan pembuatan akun klien baru.                                                                             |
| `/forgot-password`, `/reset-password`         | `GUEST`                                 | Token Reset                      | Pemulihan akses kata sandi via WhatsApp API (Fonnte).                                                                       |
| `/dashboard`                                  | `CLIENT`                                | `-`                              | Overview portal klien, KPI proyek aktif, tagihan unpaid.                                                                    |
| `/dashboard/calculator`                       | `CLIENT`, `ADMIN`                       | `-`                              | Kalkulator estimasi proyek terintegrasi di dalam tata letak dashboard portal klien.                                         |
| `/dashboard/orders`                           | `CLIENT`                                | `-`                              | Riwayat status order request (`PENDING`, `REVIEWED`, `CONVERTED`).                                                          |
| `/dashboard/projects`                         | `CLIENT`                                | `-`                              | Daftar proyek pribadi klien dan ringkasan progres.                                                                          |
| `/dashboard/projects/[id]`                    | `CLIENT` (Khusus Pemilik Proyek)        | `-`                              | Timeline milestone, persetujuan milestone, Kanban, diskusi, files, invoice.                                                 |
| `/dashboard/invoices`                         | `CLIENT`                                | `-`                              | Daftar invoice klien, rincian biaya, unduh PDF.                                                                             |
| `/dashboard/profile`                          | `CLIENT`                                | `-`                              | Identitas akun, edit nama/telepon asli, serta preview UI proyek, pembayaran, dan aktivitas berlabel Demo (belum terhubung). |
| `/dashboard/settings`                         | `CLIENT`                                | `-`                              | Informasi ketersediaan notifikasi (belum dapat diubah) dan tautan ke Profil.                                                |
| `/admin`                                      | `ADMIN`, `DEVELOPER`                    | `-`                              | Overview metrik operasional dan aktivitas agensi.                                                                           |
| `/admin/projects`                             | `ADMIN`, `DEVELOPER`                    | `project.viewAll`                | Pipeline delivery proyek, filter status, form proyek baru.                                                                  |
| `/admin/projects/[id]`                        | `ADMIN`, `DEVELOPER`                    | `project.viewAll`                | Detail overview, Kanban tasks, milestones, timesheet jam kerja, files, chat.                                                |
| `/admin/timesheet`                            | `ADMIN`, `DEVELOPER`                    | `timesheet.view`                 | Laporan akumulasi jam kerja staf/proyek, filter tanggal, export CSV.                                                        |
| `/admin/files`                                | `ADMIN`, `DEVELOPER`                    | `file.manage`                    | File manager, filter mime type, unggah aset, hapus berkas.                                                                  |
| `/admin/blog`                                 | `ADMIN`, `DEVELOPER`                    | `blog.view`                      | Daftar artikel blog internal, status draft/scheduled/published.                                                             |
| `/admin/blog/new`, `/admin/blog/[id]/edit`    | `ADMIN`, `DEVELOPER`                    | `blog.create`, `blog.edit`       | Editor TipTap rich text, simpan draf, upload featured image.                                                                |
| `/admin/blog/categories`                      | `ADMIN`                                 | `blog.delete` (Admin-only)       | CRUD kategori blog dan manajemen slug.                                                                                      |
| `/admin/invoices`                             | `ADMIN`                                 | `invoice.view`                   | Manajemen tagihan, filter status, dispatch WhatsApp (Fonnte).                                                               |
| `/admin/invoices/new`, `/admin/invoices/[id]` | `ADMIN`                                 | `invoice.create`, `invoice.edit` | Pembuatan & penyuntingan invoice, input line items, mark paid.                                                              |
| `/admin/invoices/recurring`                   | `ADMIN`                                 | `invoice.create`                 | Konfigurasi jadwal invoice berulang (mingguan s/d tahunan).                                                                 |
| `/admin/proposals`                            | `ADMIN`                                 | `proposal.manage`                | Manajemen proposal penawaran, dispatch link token, konversi ke proyek.                                                      |
| `/admin/orders`                               | `ADMIN`                                 | `project.viewAll`                | Tinjau order request dari kalkulator, ubah status, konversi proposal.                                                       |
| `/admin/calculator`                           | `ADMIN`                                 | `settings.manage`                | Single source of truth: Project Types, Feature Options, Add-on, Kebijakan DP.                                               |
| `/admin/analytics`                            | `ADMIN`                                 | `analytics.view`                 | Analitik Revenue, Profitabilitas Proyek (Revenue vs Cost of Time), LTV Klien.                                               |
| `/admin/users`                                | `ADMIN`, `DEVELOPER`                    | `team.view`, `user.manage`       | Manajemen pengguna, role tabs (All/Admin/Dev/Client), monitoring kapasitas tim.                                             |
| `/admin/settings`                             | `ADMIN`                                 | `settings.manage`                | Identitas brand, SEO, kontak, jam operasional, link sosial media.                                                           |
| `/admin/audit`                                | `ADMIN`                                 | `audit.view`                     | Log audit 200 aksi terakhir, timestamp presisi, user, aksi, entitas, IP address.                                            |
| `/api/invoices/[id]/pdf`                      | `CLIENT` (Pemilik Tagihan), `ADMIN`     | `-`                              | Unduh file faktur PDF resmi.                                                                                                |
| `/api/admin/export/timesheet`                 | `ADMIN`, `DEVELOPER`                    | `timesheet.view`                 | Download data timesheet berformat CSV.                                                                                      |
| `/api/admin/export/projects`                  | `ADMIN`, `DEVELOPER`                    | `project.viewAll`                | Download data rekap proyek berformat CSV.                                                                                   |
| `/api/admin/export/invoices`                  | `ADMIN`                                 | `invoice.view`                   | Download data seluruh invoice berformat CSV.                                                                                |
| `/api/admin/export/analytics`                 | `ADMIN`                                 | `analytics.view`                 | Download laporan analitik profitabilitas berformat CSV.                                                                     |
| `/api/webhooks/payment`                       | Payment Gateway (Midtrans)              | `Signature SHA-512`              | Rekonsiliasi notifikasi pembayaran otomatis Midtrans Snap real-time.                                                        |
| `/api/cron/*`                                 | Background Worker / Scheduler           | `CRON_SECRET`                    | Eksekusi otomatisasi terjadwal.                                                                                             |

---

## 4. Spesifikasi Modul Fitur (Feature Modules Specification)

### 4.1 Proyek & Pelaksanaan Teknis (Projects & Technical Delivery)

- **Status Proyek**: `PENDING` -> `IN_PROGRESS` -> `REVIEW` -> `COMPLETED` | `CANCELLED`.
- **Progres Proyek**: Persentase numerik 0–100%. Mendukung toggle `autoProgress` (otomatis berdasarkan rasio milestone selesai).
- **Kanban Task Board**:
  - Kolom status: `BACKLOG`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
  - Prioritas: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - Atribut tugas: Judul, deskripsi, batas waktu (_dueDate_), relasi milestone, penugasan staf (_assignee_).
- **Manajemen Milestone**:
  - Urutan pengerjaan (_order_), tenggat waktu, dan tanggal penyelesaian.
  - Opsi `requiresClientApproval`: Memerlukan persetujuan eksplisit klien sebelum milestone ditutup.
- **Pencatat Waktu Kerja (Time Tracking)**:
  - Pencatatan timesheet jam kerja manual (deskripsi, durasi menit, status billable) terintegrasi pada tab proyek.
  - Penandaan status jam kerja: `billable` (tertagih) atau `non-billable`.
- **Diskusi Proyek (Threaded Discussions)**:
  - Komunikasi berbalas (_parent-reply_) antara tim dan klien di dalam proyek.
  - Mendukung penyuntingan teks dan penghapusan lunak (_soft delete_).
- **Berkas Proyek (Project Files)**:
  - Penyimpanan berkas lokal (`/public/uploads/*`) dengan pencatatan nama asli, ukuran byte, tipe MIME, dan uploader.

### 4.2 Finansial & Penagihan (Financials & Billing)

- **Status Invoice**: `DRAFT` -> `SENT` -> `PAID` | `OVERDUE` | `CANCELLED`.
- **Kalkulasi Faktur**: Subtotal per line-item, persentase pajak (`taxRate`), kalkulasi nominal pajak (`taxAmount`), dan total akhir dengan mata uang IDR.
- **WhatsApp Dispatch (Fonnte API)**:
  - Pengiriman tagihan dan pengingat tempo langsung via WhatsApp Notification API (Fonnte) dengan link langsung ke portal tagihan klien.
- **Faktur Berulang (Recurring Invoices)**:
  - Template langganan dengan frekuensi: `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`.
  - Kalkulasi otomatis tanggal terbit berikutnya (`nextIssueDate`) dan masa tenggang jatuh tempo (`dueDays`).
- **Dokumen PDF Resmi**:
  - Kompilasi PDF dinamis via `@react-pdf/renderer` pada rute `/api/invoices/[id]/pdf`.
- **Payment Gateway Midtrans (Online & Manual Transfer)**:
  - Pembayaran online instan via **Midtrans Snap API** (QRIS GoPay/ShopeePay, Virtual Account BCA/Mandiri/BRI/BNI/Permata, Kartu Kredit).
  - Verifikasi otomatis secara real-time melalui webhook `/api/webhooks/payment` dengan validasi signature SHA-512 `timingSafeEqual`.
  - Dukungan jalur transfer bank manual dengan pengunggahan bukti transfer (`UploadProofDialog`) dan verifikasi oleh Admin.

### 4.3 Estimasi, Penjualan, & Proposal (Sales & Proposals)

- **Kalkulator Biaya Interaktif**:
  - Pengelolaan jenis proyek (_Project Types_): Web App, Mobile App, UI/UX, dsb., dengan harga dasar (_basePrice_).
  - Pengelolaan opsi fitur (_Feature Options_): Fitur mayor/minor dengan harga tambahan.
  - Pengelolaan opsi add-on (_AddOnOption_): Layanan berkala per bulan (server, pemeliharaan, SEO).
  - Parameter penyesuaian: Pengali proyek mendesak (_urgencyMultiplier_ misal 1.5x), threshold hari mendesak, persentase uang muka (DP 25%), dan biaya revisi tambahan.
- **Order Requests**:
  - Penampung pengajuan estimasi dari klien.
  - Status alur: `PENDING` -> `REVIEWED` -> `CONVERTED` | `CANCELLED`.
- **Proposal Penawaran Digital**:
  - Pembuatan dokumen penawaran dengan TipTap editor, rincian biaya, dan tanggal kedaluwarsa.
  - Status alur: `DRAFT` -> `SENT` -> `VIEWED` -> `SIGNED` | `REJECTED` | `CONVERTED` | `EXPIRED`.
  - **Digital Signature**: Akses publik via token unik (`/proposal/[token]`), tanda tangan digital via canvas, dengan audit trail otomatis (IP Address, User-Agent, Timestamp).
  - **One-Click Conversion**: Konversi proposal berstatus `SIGNED` langsung menjadi entitas `Project` aktif.

### 4.4 Manajemen Konten Blog (Content Management System)

- **Status Artikel**: `draft` (tersimpan draf), `scheduled` (terjadwal), `published` (terbit publik).
- **Editor**: TipTap Rich Text Editor (heading, blockquote, images, code block, formatting).
- **Taxonomy**: Kategori artikel berelasi one-to-many dengan slug unik.
- **Pelacakan Metrik**: Pencatatan otomatis jumlah pembaca (_views counter_).

### 4.5 Administrasi, Tim & Keamanan

- **Manajemen Pengguna**:
  - Akun terikat pada salah satu role: `ADMIN`, `DEVELOPER`, `CLIENT`.
  - Dukungan aktivasi/penonaktifan akun secara instan (`isActive`).
- **Monitoring Beban Kerja Tim (Team Capacity)**:
  - Terintegrasi langsung pada rute `/admin/users` (tab `Developer & Tim` -> opsi `Beban Kerja`).
  - Target kapasitas dasar: 40 jam/minggu per staf.
  - Indikator visual kapasitas: Normal (<70%), Waspada (70–90%), Overload (>90%).
  - Agregasi jumlah tugas aktif, tugas prioritas mendesak (_urgent_), dan proyek berjalan.
- **Analitik Bisnis & Profitabilitas**:
  - Penghitungan margin profitabilitas proyek riil:
    $$\text{Profit} = \text{Revenue (Paid Invoices)} - (\text{Billable Hours} \times \text{Hourly Rate})$$
  - Pemeringkatan _Client Lifetime Value (LTV)_.
- **Audit Log Keamanan**:
  - Penyimpanan catatan histori untuk setiap aksi sensitif (`USER_MANAGE`, `PROJECT_DELETED`, `INVOICE_PAID`, dll.).
  - Menyimpan metadata lengkap, entitas yang diubah, pelaku, timestamp, dan alamat IP klien.

---

## 5. Layanan Otomatisasi Terjadwal (Cron Jobs Specification)

Sistem mengoperasikan 3 worker otomatisasi terjadwal via rute API khusus yang dilindungi authorization header `Bearer $CRON_SECRET`:

```yaml
cron_workers:
  invoice_reminder:
    endpoint: "/api/cron/invoice-reminder"
    method: "GET"
    schedule_interval: "Harian (09:00)"
    execution_logic:
      - "Pindai tabel Invoice dengan status SENT atau OVERDUE yang melewati dueDate."
      - "Periksa field lastReminderSentAt agar tidak mengirim lebih dari 1 kali per interval."
      - "Kirim notifikasi pengingat pembayaran ke klien via WhatsApp API (Fonnte)."
      - "Perbarui timestamp lastReminderSentAt."

  issue_recurring:
    endpoint: "/api/cron/issue-recurring"
    method: "GET"
    schedule_interval: "Harian (00:01)"
    execution_logic:
      - "Pindai tabel RecurringInvoiceTemplate dengan status active = true dan nextIssueDate <= saat ini."
      - "Generate invoice baru dengan nomor urut format INV-YYYYMM-XXXX."
      - "Hitung dan jadwalkan nextIssueDate berikutnya sesuai frekuensi (WEEKLY/MONTHLY/QUARTERLY/YEARLY)."
      - "Kirim notifikasi pembuatan invoice baru kepada Admin dan Klien via WhatsApp."

  publish_scheduled_posts:
    endpoint: "/api/cron/publish-scheduled"
    method: "GET"
    schedule_interval: "Per 15 Menit"
    execution_logic:
      - "Pindai tabel BlogPost dengan status published = false dan scheduledAt <= saat ini."
      - "Ubah status published = true dan set publishedAt = saat ini."
      - "Revalidasi cache halaman blog publik (/blog dan /blog/[slug])."
```

---

## 6. Spesifikasi Transisi Status & Mesin Alur Kerja (Pipeline State Machines)

Format deterministik untuk transisi status antar entitas sistem:

### 6.1 Alur Penjualan ke Delivery Proyek (Sales-to-Delivery Pipeline)

|            Tahap             |       Pelaku       |         Titik Akses / Trigger         |              Data Masukan (Input)               |                    Perubahan Status (Output)                     |  Tahap Berikutnya   |
| :--------------------------: | :----------------: | :-----------------------------------: | :---------------------------------------------: | :--------------------------------------------------------------: | :-----------------: |
|       **1. Estimasi**        | `GUEST` / `CLIENT` | `/pricing#calculator` / `/calculator` | Jenis proyek, opsi fitur, add-on, tenggat waktu |                  `OrderRequest: PENDING` dibuat                  |    **2. Review**    |
|    **2. Review Estimasi**    |      `ADMIN`       |            `/admin/orders`            |           Tinjauan permohonan pesanan           |                     `OrderRequest: REVIEWED`                     |   **3. Proposal**   |
|  **3. Terbitkan Proposal**   |      `ADMIN`       |        `/admin/proposals/new`         |  Line items, nominal biaya, term, masa berlaku  |           `Proposal: DRAFT -> SENT` (Token & WA rilis)           | **4. Tanda Tangan** |
|      **4. E-Signature**      | `GUEST` / `CLIENT` |          `/proposal/[token]`          |  Canvas tanda tangan digital / nama, alamat IP  |                    `Proposal: SENT -> SIGNED`                    |   **5. Konversi**   |
|    **5. Konversi Proyek**    |      `ADMIN`       |        `/admin/proposals/[id]`        |           Tombol "Convert to Project"           |  `Proposal: SIGNED -> CONVERTED`<br/>`Project: PENDING` dibuat   |  **6. Penugasan**   |
|     **6. Penugasan Tim**     |      `ADMIN`       |        `/admin/projects/[id]`         |     Assign staf pengembang, susun milestone     | `Project: PENDING -> IN_PROGRESS`<br/>`ProjectAssignment` dibuat |  **7. Pengerjaan**  |
|   **7. Pengerjaan Teknis**   |    `DEVELOPER`     |        `/admin/projects/[id]`         |  Kerjakan task Kanban, catat jam di timesheet   |          `Task: TODO -> DONE`<br/>`TimeEntry` tersimpan          |  **8. Verifikasi**  |
| **8. Persetujuan Milestone** |      `CLIENT`      |      `/dashboard/projects/[id]`       |       Review deliverable, tombol Approve        |              `Milestone: IN_PROGRESS -> COMPLETED`               |  **9. Penagihan**   |
|  **9. Penerbitan Tagihan**   |      `ADMIN`       |         `/admin/invoices/new`         |         Input item invoice, jatuh tempo         |          `Invoice: DRAFT -> SENT` (Dispatch WA Fonnte)           | **10. Pembayaran**  |
|      **10. Pelunasan**       | `ADMIN` / `CLIENT` |        `/admin/invoices/[id]`         |           Konfirmasi pembayaran lunas           |         `Invoice: SENT -> PAID`<br/>`Project: COMPLETED`         |     **Selesai**     |

### 6.2 Alur Persetujuan Milestone (Milestone Approval Workflow)

| Kondisi Awal                  |   Pelaku    | Aksi / Trigger    | Data Masukan                           | Status Akhir                                | Dampak Sistem                                                       |
| :---------------------------- | :---------: | :---------------- | :------------------------------------- | :------------------------------------------ | :------------------------------------------------------------------ |
| `Milestone: IN_PROGRESS`      | `DEVELOPER` | Tandai Selesai    | Deliverable diunggah ke Files          | `Milestone: IN_PROGRESS` (Pending Approval) | Notifikasi terkirim ke Klien untuk review.                          |
| `Milestone: Pending Approval` |  `CLIENT`   | Setujui Milestone | Klik "Setujui Milestone"               | `Milestone: COMPLETED`                      | Progres proyek bertambah, aktivitas audit tercatat.                 |
| `Milestone: Pending Approval` |  `CLIENT`   | Tolak Milestone   | Klik "Minta Revisi" + Catatan Feedback | `Milestone: BLOCKED` / `IN_PROGRESS`        | Feedback masuk ke aktivitas proyek, staf Developer menerima revisi. |

### 6.3 Alur Penerbitan Faktur Berulang (Recurring Invoicing Workflow)

| Kondisi Pemicu                                       |             Pelaku / Worker             | Aksi                      | Data Output                                     | Status Transisi                                                  |
| :--------------------------------------------------- | :-------------------------------------: | :------------------------ | :---------------------------------------------- | :--------------------------------------------------------------- |
| `Template: active = true`<br/>`nextIssueDate <= now` | Cron Job (`/api/cron/issue-recurring`)  | Eksekusi terjadwal harian | `Invoice` baru terbuat dengan nomor faktur urut | `Invoice: SENT`<br/>Template diperbarui ke `nextIssueDate` baru. |
| `Invoice: SENT`<br/>`now > dueDate`                  | Cron Job (`/api/cron/invoice-reminder`) | Pindai tagihan overdue    | Notifikasi WA pengingat pembayaran              | `Invoice: OVERDUE`<br/>`lastReminderSentAt` diperbarui.          |
| Pembayaran diterima                                  |                 `ADMIN`                 | Klik "Mark as Paid"       | Konfirmasi pelunasan                            | `Invoice: PAID`<br/>`paidAt = now`<br/>Metrik revenue bertambah. |
