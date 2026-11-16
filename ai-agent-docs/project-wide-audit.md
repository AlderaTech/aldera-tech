# Audit menyeluruh Aldera Tech

## Baseline dan kesimpulan

Pemeriksaan 16 November 2026 terhadap `origin/staging` pada commit `c0a720ac9c6f4306358a695cefe4c657ccfbc5e8`, dengan branch audit `chore/project-wide-audit`.

Aplikasi staging dapat diakses dan pemeriksaan otomatis yang tersedia lulus. Namun masih ada bug integritas pembayaran, persaingan pembaruan proposal, pencatatan waktu, penanganan kegagalan, dan penyajian grafik. Konsistensi visual belum menyeluruh pada FAQ, Testimoni, serta sebagian alur autentikasi. Laporan ini mengidentifikasi masalah; kode aplikasi, data staging, dependensi, dan konfigurasi deployment tidak diubah dalam task audit.

## Metode dan cakupan

- Inventaris `app/`, `components/`, dan `lib/`: 597 berkas sumber TypeScript, 57 halaman, 17 route handler, 28 modul action, dan 407 berkas TSX.
- Pemeriksaan sumber mencakup seluruh kelompok menu publik, autentikasi, pengguna, Admin, proposal publik, handler API, validasi, izin, pembayaran/refund, ledger, unggahan, kalkulator, deployment, dan dokumentasi. Inventaris halaman dan API tercantum di bawah.
- Staging: 71 pemeriksaan HTTP tanpa mutasi, 32 halaman privat tetap mengarahkan sesi anonim ke Login, 89 aset berhasil dimuat, tanpa kegagalan server/proteksi pada kasus tersebut.
- Health staging HTTP 200: database utama/router, storage, upload storage, billing router, dan 9Router berstatus `up`. Katalog billing staging HTTP 200. Robots, metadata dan header staging tetap `noindex`.
- Database aplikasi/router sementara dan akun Admin, Client, Developer sintetis dipakai secara lokal. Sebanyak 41 pemeriksaan render berautentikasi/detail menghasilkan HTTP 200: 35 halaman privat dan enam detail/editor/proposal, memakai ID fixture yang benar-benar ada di database pengujian.
- Browser Chrome headless tanpa ekstensi: 28 tangkapan publik awal; 17 pemeriksaan lanjutan untuk viewport publik 390 px, OTP, dan pengulangan Beranda/Blog desktop; 37 pemeriksaan privat mencakup seluruh delapan tab AI Relay pengguna dan lima tab Admin.
- Semua 37 pemeriksaan privat dan 17 pemeriksaan publik lanjutan menghasilkan metrik DOM. Tidak ditemukan overflow halaman pada kasus tersebut. Tab yang diminta melalui URL tampil aktif. Tiga tangkapan publik awal tidak menghasilkan metrik; pemeriksaan lanjutan menggantikannya. Viewport awal yang diminta 390 px ternyata dibatasi Chrome menjadi 500 px; pemeriksaan lanjutan memakai frame berukuran 390 px yang terukur.
- Browser memeriksa salinan respons melalui proxy lokal untuk pengukuran DOM dan screenshot. Server staging tidak diubah. Cookie fixture hanya diteruskan ke aplikasi fixture lokal. Panggilan AI, pengiriman pesan, pembayaran, perubahan izin, dan publikasi sungguhan tidak dilakukan.
- Probe bug menggunakan action asli dengan provider mock; pencatatan waktu juga diverifikasi terhadap PostgreSQL fixture. Perubahan data uji dibatasi pada database sementara.

## Temuan yang perlu diperbaiki

P1 berarti prioritas tinggi untuk integritas/keamanan. P2 berarti bug fungsional atau informasi yang menyesatkan. P3 berarti konsistensi, aksesibilitas, atau pemeliharaan. Prioritas bukan pernyataan bahwa eksploitasi telah terjadi di produksi.

### A01 — P1: Invoice draf masih dapat meminta sesi pembayaran

- Lokasi: `lib/actions/payment.ts`, `createInvoicePaymentSnapAction`.
- Action menolak `PAID` dan `CANCELLED`, tetapi tidak menolak `DRAFT`. Daftar invoice pengguna, PDF, serta unggah bukti sudah membatasi invoice draf.
- Reproduksi offline: invoice milik pengguna berstatus `DRAFT` menghasilkan `ok: true`, satu panggilan provider mock dan satu Payment `PENDING`.
- Dampak: invoice yang belum diterbitkan dapat melewati jalur Snap bila action menerima ID-nya. Ini bukan kebocoran ID atau bypass kepemilikan; pemeriksaan owner/Admin tetap berjalan.
- Perbaikan: satu kebijakan status invoice yang boleh dibayar untuk seluruh kanal; tambahkan kasus draf pada `lib/actions/payment-actions.test.ts`.

### A02 — P1: Status invoice dapat berubah selama pembuatan sesi Snap

- Lokasi: `lib/actions/payment.ts`, setelah `await createMidtransSnapTransaction`.
- Action membaca invoice sebelum memanggil provider, lalu memakai snapshot tersebut untuk membuat/memperbarui Payment tanpa pemeriksaan status/versi terbaru.
- Reproduksi: provider mock mengubah status fixture dari `SENT` menjadi `PAID` sebelum mengembalikan token. Action tetap sukses dan membuat Payment `PENDING`.
- Dampak: sesi pembayaran kedaluwarsa secara bisnis dapat tetap ditawarkan setelah pembayaran/pembatalan lain. Probe tidak membuktikan double charge sungguhan.
- Perbaikan: koordinasi percobaan pembayaran yang idempoten, pemeriksaan status terbaru dan pengamanan konflik saat menyimpan hasil provider. Jangan menahan transaksi database panjang selama request jaringan.

### A03 — P1: Tanda tangan proposal dapat tertimpa penolakan bersamaan

- Lokasi: `lib/actions/proposal.ts`, `signProposalAction` dan `rejectProposalAction`.
- Kedua action membaca status, kemudian melakukan `update` hanya berdasarkan ID. Status prasyarat tidak menjadi bagian operasi pembaruan atomik.
- Reproduksi: dua pemanggilan membaca `SENT`; tanda tangan selesai lebih dahulu, penolakan selesai berikutnya. Keduanya mengembalikan sukses dan status akhir menjadi `REJECTED`.
- Dampak: keputusan yang saling bertentangan dapat tercatat berhasil pada proposal yang sama.
- Perbaikan: transisi status bersyarat/locking bersama, tangani konflik secara eksplisit; uji sign/reject paralel dan pengulangan request.

### A04 — P1: Test harness berpotensi menulis ke database lokal yang bukan database uji

- Lokasi: `test.sh`, `package.json`, `lib/test-prisma.ts`.
- `bun run test` memanggil `test.sh`. Jika port 5432 sudah terbuka, script memakai instance tersebut, menargetkan database bernama `aldera_tech`, menjalankan `prisma db push --accept-data-loss` dan seed. Kegagalan setup disembunyikan dengan `|| true`.
- Reproduksi aman dalam container tanpa jaringan: listener palsu pada 5432 serta stub `psql`, `bunx`, dan `bun` mencatat perintah CREATE DATABASE, db push dengan `--accept-data-loss`, seed, dan test. Tidak ada database pengguna yang disentuh.
- `getTestPrisma` juga memiliki fallback ke nama database aplikasi biasa tanpa guard nama lingkungan uji.
- Perbaikan: database unik sementara, guard URL/nama database uji, tanpa fallback ke database aplikasi; gagalkan setup jika schema/seed gagal. Audit ini menjalankan suite menggunakan harness terisolasi terpisah.

### A05 — P1: Lockfile masih memuat dependensi dengan advisori keamanan

- `bun audit --json` menghasilkan 73 catatan pada 18 paket. Setelah pencocokan rentang versi lockfile dan deduplikasi URL advisori: **67 advisori unik: 26 high, 36 moderate, 5 low**.
- Angka tersebut merupakan hasil pemindaian dependensi, bukan 67 celah yang telah dieksploitasi pada aplikasi. Sebagian dependensi adalah alat build/lint/Prisma CLI.
- Zod `4.4.3` termasuk rentang terdampak konsumsi memori berlebih menurut [advisori Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). Schema array invoice/proposal perlu batas ukuran yang sesuai selain pembaruan dependensi.
- ProseMirror utama `1.42.6` sudah melewati versi patch, tetapi lockfile juga memuat `1.41.8` di bawah `prosemirror-gapcursor`, `prosemirror-state`, dan `prosemirror-tables`, yang masuk rentang [advisori paste XSS](https://github.com/advisories/GHSA-c8x8-7fp4-3x9w). Reachability pada bundle editor perlu diperiksa; versi utama saja tidak cukup untuk menutup temuan lockfile.
- MySQL2 `3.15.3` masuk melalui Prisma CLI; database aplikasi tetap PostgreSQL. Temuan MySQL2 bukan bukti bahwa web memakai koneksi MySQL yang rentan.
- Perbaikan: triase runtime/tooling, deduplikasi dan update terkontrol, lalu regresi editor, validasi, PDF, build dan Prisma. Jangan melakukan upgrade massal tanpa pemeriksaan kompatibilitas.

| Paket dengan advisori      | Versi pada lockfile                                                 |
| -------------------------- | ------------------------------------------------------------------- |
| `@babel/core`              | 7.29.0                                                              |
| `@hono/node-server`        | 1.19.14                                                             |
| `baseline-browser-mapping` | 2.10.28                                                             |
| `brace-expansion`          | 1.1.14, 5.0.6                                                       |
| `browserslist`             | 4.28.2                                                              |
| `deepmerge-ts`             | 7.1.5                                                               |
| `fast-uri`                 | 3.1.2                                                               |
| `fflate`                   | 0.8.2                                                               |
| `hono`                     | 4.12.18                                                             |
| `js-yaml`                  | 4.1.1                                                               |
| `minimatch`                | 3.1.5, 10.2.5; versi terdampak berbeda menurut advisori             |
| `mysql2`                   | 3.15.3                                                              |
| `nanoid`                   | 3.3.12                                                              |
| `postcss`                  | 8.5.14                                                              |
| `prosemirror-view`         | 1.42.6 dan salinan transitif 1.41.8; advisori mengenai salinan lama |
| `source-map-js`            | 1.2.1                                                               |
| `valibot`                  | 1.2.0                                                               |
| `zod`                      | 4.4.3                                                               |

### A06 — P2: Grafik Ringkasan pengguna tidak merepresentasikan distribusi data yang disebutkan

- Lokasi: `app/dashboard/_components/overview-charts.tsx`, `app/dashboard/page.tsx`.
- Grafik berjudul “Distribusi Status Milestone & Tugas” menghitung rata-rata progres maksimal tiga proyek terbaru. Bagian berjalan diambil dari 60% sisa progres dengan batas minimum 15%, lalu sisanya disebut pending. Tidak ada query jumlah milestone/tugas per status untuk grafik tersebut.
- Fixture satu proyek berprogres 45%, tanpa milestone/tugas, tetap menampilkan 45% selesai, 33% berjalan, 22% pending.
- Bar “Total Dibayarkan” memakai progres proyek sebagai tinggi, sedangkan nol tetap memiliki tinggi 12%. Satuan rupiah dan jumlah proyek/tagihan tidak memiliki denominator perbandingan yang dijelaskan.
- Teks “Semua lunas” ditentukan hanya dari jumlah invoice `SENT`/`OVERDUE` nol, termasuk saat query Ringkasan memakai fallback karena gagal.
- Perbaikan: pakai agregasi data yang sesuai atau ubah label menjadi informasi yang benar-benar didukung. Jangan menyajikan pembagian perkiraan sebagai distribusi aktual.

### A07 — P2: Pencatatan waktu tidak atomik terhadap log aktivitas

- Lokasi: `lib/actions/time.ts`, `addManualEntryAction`.
- `timeEntry.create` dan `activityLog.create` dilakukan terpisah. Kegagalan log menghasilkan exception setelah waktu sudah tersimpan.
- Reproduksi terhadap PostgreSQL fixture: dua percobaan dengan log yang sengaja gagal menghasilkan dua TimeEntry persisten, walaupun kedua action gagal.
- Dampak: pengguna dapat mengulangi input yang sebenarnya sudah tersimpan, menggandakan waktu dan biaya analitik.
- Perbaikan: satu transaksi untuk pencatatan waktu dan log, serta strategi pencegahan duplikasi jika aksi diulang. Pola serupa pada action proyek perlu ditinjau, bukan diasumsikan aman hanya karena test umum lulus.

### A08 — P2: Input durasi non-finite lolos validasi action

- Lokasi: `lib/actions/time.ts`.
- `Number(minutes)` hanya diperiksa dengan `minutes <= 0`. `NaN` dan `Infinity` melewati kondisi tersebut.
- Reproduksi PostgreSQL fixture: nilai `abc` dan `Infinity` mencapai Prisma dan menghasilkan `PrismaClientValidationError`, bukan error field yang ramah pengguna.
- Perbaikan: validasi terpusat dengan angka finite, batas durasi yang disepakati, dan hasil error terstruktur. Kontrol HTML bukan validasi server.

### A09 — P2: Gangguan database masih disamarkan sebagai data kosong/belum terhubung

- Lokasi: `lib/safe-db.ts`, sejumlah daftar `app/admin/`, `app/dashboard/page.tsx`, `lib/actions/binding.ts`.
- Daftar Admin memakai fallback seperti `[[], 0]`. Karena itu kegagalan query dapat menampilkan empty state dan hitungan nol. Detail tertentu juga dapat menjadi not-found ketika database sedang gagal.
- Reproduksi pada Admin yang memiliki data fixture: parameter pagination yang memicu error Prisma menghasilkan HTTP 200 dengan “Belum ada proyek”. Ini membuktikan jalur error dan kosong belum dibedakan.
- Reproduksi binding: `queryRouter` melempar error; `getBindingStatusAction` tetap mengembalikan `{ isBound: false }`. Komponen tidak mendapat status kegagalan layanan.
- Perbaikan: hasil sukses/kosong/error yang terpisah, retry, dan observabilitas produksi. Dashboard Projects sudah mempunyai fallback `null` dan komponen error; pola yang lebih jujur itu belum diterapkan merata.

### A10 — P2: Parameter halaman dan tanggal belum divalidasi konsisten

- Lokasi: daftar Admin yang memakai `Math.max(1, Number(page) || 1)`, daftar Dashboard dengan `parseInt` tanpa batas, serta `app/admin/timesheet/page.tsx`.
- `page=1.55`, `page=Infinity`, dan angka sangat besar dapat menghasilkan offset fractional/non-finite/di luar rentang integer database. Contoh fixture: `/admin/projects?page=1.55`, `/admin/invoices?page=Infinity`, `/dashboard/projects?page=999999999999999999999999`.
- `/admin/timesheet?from=abc&to=2026-11-16` menghasilkan error render `Invalid time value` pada `toISOString`. Rentang tanggal terbalik juga diterima.
- API export timesheet sudah memakai validasi tanggal kalender/rentang, tetapi halaman Timesheet belum menggunakan kontrak yang sama.
- Perbaikan: parser pagination finite, integer positif dan berbatas; satu schema tanggal untuk UI/query/API serta error parameter yang jelas.

### A11 — P2: Fallback konten mengabaikan akhir pagination dan status publikasi

- Lokasi: `app/(public)/blog/_data/blog-list.ts`, `app/(public)/blog/[slug]/_data/blog-detail.ts`, `app/(public)/portfolio/_data/portfolio.ts`.
- Query Blog yang sukses tetapi kosong tetap diganti artikel fallback pada halaman lanjutan. Probe `page=1` dan `page=2` dengan nol baris mengembalikan artikel fallback yang sama.
- Detail Blog/Portfolio memakai `item ?? fallback(slug)` setelah query `published: true`. Jika slug bawaan disimpan sebagai tidak terbit, query tidak menemukannya dan versi fallback tetap dapat muncul di URL publik.
- Ini bukan bypass untuk seluruh artikel draf: kasus tersebut terbatas pada slug yang tersedia di fallback. Konten draf database tidak dibocorkan oleh probe ini.
- Perbaikan: bedakan bootstrap/demo dari publikasi aktual; jangan menimpa hasil kosong yang sah, akhir pagination, atau keputusan tidak terbit dari CMS.

### A12 — P2: Pembatasan percobaan login belum terlihat pada jalur Credentials

- Lokasi: `auth.ts`, `lib/actions/auth.ts`.
- Jalur provider Credentials dan `loginAction` tidak memanggil limiter atau pencatatan gagal login. Rate limiter kontak/komentar dan kontrol OTP tidak otomatis melindungi endpoint login.
- Ini temuan sumber/kesenjangan kontrol, bukan hasil brute force. Aturan CDN/reverse proxy dan kebijakan pembatasan di luar repo belum diverifikasi.
- Perbaikan: validasi perlindungan edge; jika belum ada, pembatasan terpusat dengan strategi akun/IP yang tidak membuka enumerasi dan tidak mudah menyebabkan penguncian korban.

### A13 — P2: Penanganan data besar belum merata

- `app/admin/users/_data/get-users-and-workload.ts` mengambil seluruh pengguna serta relasi beban kerja tanpa pagination server.
- `app/admin/timesheet/page.tsx` memuat semua time entry dalam rentang; rentang arbitrer belum dibatasi.
- `app/admin/analytics/page.tsx` memuat seluruh invoice, proyek, dan time entry ke memori sebelum agregasi serta pemotongan hasil.
- Ini risiko kapasitas dari kode, bukan bukti timeout pada dataset produksi. Fixture kecil tidak mengukur kapasitas operasional.
- Perbaikan: agregasi database, pagination/limit per area, rentang terukur, dan uji beban pada dataset representatif.

### A14 — P3: Tema publik dan autentikasi belum seragam

- `components/shared/navbar.tsx` dan `app/(public)/_components/public-shell.tsx` tidak memasukkan FAQ/Testimoni ke varian studio. Browser mengonfirmasi heading Georgia/serif dan footer navy lama, dibanding Plus Jakarta Sans dan footer studio pada halaman utama.
- Reset Password dan Verifikasi OTP masih menggunakan `AuthShell` lama: formulir di kiri pada desktop, aksen cyan, susunan kartu berbeda dari Login/Register/Forgot Password baru.
- `AuthCard` memakai `CardTitle` tanpa heading `h1`. Browser tidak menemukan `h1` pada Reset Password maupun Verifikasi OTP.
- Label password wajib pada Reset Password belum memakai tanda bintang sesuai standar input proyek.
- Perbaikan: migrasikan varian chrome/auth dan hierarki heading tanpa mengubah mekanisme autentikasi.

### A15 — P3: Tab AI Relay mobile masih terlalu tinggi

- Lokasi: `components/dashboard/workspace-segmented-tabs.module.css`, `app/dashboard/ai-relay/_components/relay-tabs.tsx`.
- Pada viewport 390 px, delapan tab menjadi dua kolom × empat baris. Wrapper bernama `tabScroll` dan logika reveal scroll tersedia, tetapi grid bersama membungkus tab sehingga tidak menjadi satu baris horizontal.
- Label tetap terbaca dan tidak ada overflow halaman; masalahnya kepadatan vertikal dan ketidaksesuaian dengan arahan tab mobile yang dapat digulir.
- Perbaikan: varian horizontal untuk jumlah tab besar, tetap jaga label, keyboard, indikator aktif dan state URL.

### A16 — P3: Bahasa dan token visual belum terpusat menyeluruh

- Contoh yang terlihat: “Order Requests”, “File Manager”, “AI Operations & Admin Portal”, “Live Database Invariant Audit Runner”, “Recurring”, “Export CSV”, serta grup “Project Conventional”, di antara menu dan deskripsi Indonesia.
- Judul pemeriksaan ledger sudah ramah pengguna, tetapi deskripsi hasil pemeriksaan masih berbahasa Inggris. Ini tidak mengubah hasil audit ledger.
- Beberapa aset masih meminta quality `85`/`88`, sementara `next.config.ts` hanya mengizinkan `[50, 75, 90, 100]`. Dev server mengeluarkan peringatan quality yang tidak dikonfigurasi. Aset yang diperiksa tetap dimuat; jangan menyebut semuanya rusak.
- Perbaikan: kamus label UI dan pemakaian token/quality yang konsisten; pertahankan nama produk dan ID teknis yang memang perlu asli.

### A17 — P3: Standar modularitas, test pendamping, dan formatter belum terpenuhi

- Ada 46 berkas sumber di atas 250 baris, termasuk 30 TSX. Contoh: Admin AI Relay 1.833 baris, Admin Telegram 998 baris, balance top-up 623 baris, dan usage analytics 561 baris.
- Sebanyak 20 dari 57 halaman dan 267 dari 407 TSX tidak memiliki test pendamping dengan nama file langsung yang sama. Ini ukuran kepatuhan co-location, **bukan** klaim bahwa semuanya sama sekali tidak diuji; test induk/integrasi juga tersedia.
- `bun run format:check` gagal pada lima berkas baseline: `app/dashboard/_components/onboarding-checklist.test.tsx`, `app/dashboard/page.test.tsx`, `app/dashboard/profile/page.test.tsx`, `lib/actions/payment-actions.test.ts`, `lib/validations/validations.test.ts`.
- Perbaikan: ekstraksi komponen/hook berdasarkan tanggung jawab, lengkapi kontrak UI dan regresi kasus di laporan ini, lalu format berkas terkait pada branch perbaikan. Audit tidak melakukan format massal pada kode yang tidak diubah.

## Pemetaan test dan hasil verifikasi

| Pemeriksaan                                                          | Hasil                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Suite Bun dengan PostgreSQL utama/router sementara dan provider mock | **920 pass, 0 fail**, 219 berkas; 75.629 assertion                              |
| Fokus startup/schema/permissions                                     | **28 pass, 0 fail**, empat berkas                                               |
| Python guard/rollback credential staging                             | **5 pass**                                                                      |
| `bun run lint`                                                       | Lulus, tanpa error/warning                                                      |
| `bunx next typegen`                                                  | Lulus                                                                           |
| `bunx tsc --noEmit`                                                  | Lulus                                                                           |
| `bun run format:check` seluruh repo                                  | Gagal pada lima berkas baseline yang dirinci pada A17                           |
| Prettier berkas dokumentasi audit                                    | Dijalankan terpisah pada berkas task                                            |
| Pemindaian dependensi                                                | Masih ada advisori; lihat A05                                                   |
| HTTP staging tanpa mutasi                                            | 71 kasus; 89/89 aset; tanpa kegagalan server/proteksi pada kasus yang diuji     |
| Render lokal akun/detail fixture                                     | 41/41 HTTP 200                                                                  |
| Browser privat                                                       | 37/37 metrik berhasil; seluruh tab Relay pengguna/Admin; tanpa overflow halaman |
| Browser publik lanjutan                                              | 17/17 metrik berhasil; viewport 390 px dan pengulangan desktop                  |

Test terkait yang ditelusuri meliputi `lib/actions/payment-actions.test.ts`, `invoice.test.ts`, `invoice-actions.test.ts`, `binding.test.ts`, `auth-actions.test.ts`, `calculator.test.ts`, `calculator-permissions.test.ts`, `admin-ai-relay.test.ts`, `adversarial-stress.test.ts`, test route API, validasi, middleware, upload, sesi, UI banner/tab/empty state, serta `app/dashboard/_components/overview-charts.test.tsx`.

Test pembayaran yang ada mencakup autentikasi, kepemilikan, invoice tidak ditemukan, status PAID/CANCELLED, dan pembulatan. Kasus DRAFT serta perubahan status selama request provider belum ada. Test grafik saat ini memeriksa tampilan nol, termasuk teks “Semua lunas”, sehingga kelulusan suite belum membuktikan definisi grafik benar. Tidak ada kode aplikasi yang diperbaiki atau test regresi baru yang ditambahkan dalam audit ini; kasus reproduksi menjadi spesifikasi perbaikan berikutnya.

## Batas verifikasi dan hal yang tidak dinyatakan sebagai bug

- Katalog/health sehat bukan bukti completion berbayar, streaming, penagihan provider, top-up, refund sandbox, atau penerimaan pesan. Alur eksternal tersebut tidak dijalankan live.
- Render lokal dan pengukuran browser bukan pengganti pengujian klik lengkap, fokus keyboard, pembaca layar, semua ukuran tablet, semua dialog, seluruh kombinasi filter, atau load test produksi.
- Perbandingan akses akun nyata di VPS staging, CDN/WAF, konfigurasi runtime bot Telegram, restore backup dan penghapusan stack/volume penuh belum diverifikasi.
- Nilai fallback username bot `AlderaRelayBot` berbeda dari nama bot staging/produksi dalam dokumentasi. Variabel tersebut belum tercatat di `.env.example`, tetapi nilai runtime belum diperiksa; belum dinyatakan sebagai tautan bot staging yang terbukti salah.
- Penghapusan invoice memiliki izin Admin dan relasi Payment cascade. Kebijakan retensi dokumen keuangan perlu diputuskan sebelum menyebut penghapusan permanen itu sebagai bug; tidak ada penghapusan yang dijalankan.
- `ensureDefaultSettings` tidak digunakan. Jangan menyimpulkan ekspor action yang dieliminasi saat build sebagai endpoint publik aktif tanpa membuktikan referensinya.
- Query pengguna yang memuat lebih banyak kolom dari kebutuhan tetap berada pada Server Component; probe HTML fixture tidak menemukan hash password atau securityVersion. Tidak ada temuan kebocoran password dari kasus tersebut.
- Pemeriksaan awal maskot Beranda sempat terpengaruh timing pemuatan. Pengulangan desktop dan 390 px berhasil menampilkan aset; tidak diklasifikasikan sebagai bug aset hilang.
- `bis_skin_checked` dan atribut ekstensi lain bukan bagian sumber aplikasi. Browser audit bersih tidak memasang ekstensi tersebut; jangan menutupi seluruh hydration warning aplikasi untuk mengakomodasi perubahan DOM ekstensi.
- Rute `/dashboard/settings` memang telah dihapus menurut kode, test, dan dokumentasi aktif. Itu tidak dihitung sebagai halaman hilang tanpa sengaja.

## Urutan penanganan yang disarankan

1. Tutup A01–A04 dan siapkan regresi concurrency serta isolasi database.
2. Triase A05 menurut reachability runtime, lalu lakukan update terukur dan uji ulang.
3. Perbaiki data grafik, transaksi timesheet, validasi parameter dan status error (A06–A10).
4. Rapikan publikasi/fallback, perlindungan login dan data besar (A11–A13).
5. Seragamkan chrome publik/auth, tab mobile, bahasa, modularitas dan test UI (A14–A17).

Setiap perbaikan dicabangkan dari `origin/staging`, memiliki dokumentasi dan test regresi, serta melewati PR ke `staging` dengan squash merge. Promosi `main` memerlukan pengujian staging yang terverifikasi.

## Inventaris halaman dan route handler

Matriks berikut memetakan berkas yang tersedia, bukan menjanjikan semua cabang interaksi telah diuji end-to-end. Detail dinamis menggunakan ID/slug/token fixture lokal; token pemulihan/OTP tidak digunakan untuk pengiriman nyata.

| Rute                          | Pemeriksaan runtime           | Test pendamping langsung  |
| ----------------------------- | ----------------------------- | ------------------------- |
| /forgot-password              | HTTP/browser publik           | Tidak; periksa test induk |
| /login                        | HTTP/browser publik           | Tidak; periksa test induk |
| /register                     | HTTP/browser publik           | Tidak; periksa test induk |
| /reset-password               | HTTP/browser publik           | Tidak; periksa test induk |
| /verify-otp                   | HTTP/browser publik           | Tidak; periksa test induk |
| /about                        | HTTP/browser publik           | Tidak; periksa test induk |
| /ai-relay                     | HTTP/browser publik           | Ada                       |
| /blog/[slug]                  | SSR fixture lokal 200         | Tidak; periksa test induk |
| /blog                         | HTTP/browser publik           | Tidak; periksa test induk |
| /calculator                   | Redirect staging 308 ke Harga | Tidak; periksa test induk |
| /contact                      | HTTP/browser publik           | Tidak; periksa test induk |
| /faq                          | HTTP/browser publik           | Tidak; periksa test induk |
| /                             | HTTP/browser publik           | Tidak; periksa test induk |
| /portfolio/[slug]             | SSR fixture lokal 200         | Tidak; periksa test induk |
| /portfolio                    | HTTP/browser publik           | Tidak; periksa test induk |
| /pricing                      | HTTP/browser publik           | Tidak; periksa test induk |
| /services                     | HTTP/browser publik           | Tidak; periksa test induk |
| /testimonials                 | HTTP/browser publik           | Tidak; periksa test induk |
| /admin/ai-relay               | SSR fixture lokal 200         | Ada                       |
| /admin/analytics              | SSR fixture lokal 200         | Ada                       |
| /admin/audit                  | SSR fixture lokal 200         | Ada                       |
| /admin/blog/[id]/edit         | SSR fixture lokal 200         | Ada                       |
| /admin/blog/categories        | SSR fixture lokal 200         | Ada                       |
| /admin/blog/new               | SSR fixture lokal 200         | Ada                       |
| /admin/blog                   | SSR fixture lokal 200         | Ada                       |
| /admin/calculator             | SSR fixture lokal 200         | Ada                       |
| /admin/files                  | SSR fixture lokal 200         | Ada                       |
| /admin/invoices/[id]          | SSR fixture lokal 200         | Ada                       |
| /admin/invoices/new           | SSR fixture lokal 200         | Ada                       |
| /admin/invoices               | SSR fixture lokal 200         | Ada                       |
| /admin/invoices/recurring/new | SSR fixture lokal 200         | Ada                       |
| /admin/invoices/recurring     | SSR fixture lokal 200         | Ada                       |
| /admin/orders                 | SSR fixture lokal 200         | Ada                       |
| /admin                        | SSR fixture lokal 200         | Ada                       |
| /admin/portfolio/[id]/edit    | SSR fixture lokal 200         | Ada                       |
| /admin/portfolio/new          | SSR fixture lokal 200         | Ada                       |
| /admin/portfolio              | SSR fixture lokal 200         | Ada                       |
| /admin/projects/[id]          | SSR fixture lokal 200         | Ada                       |
| /admin/projects/new           | SSR fixture lokal 200         | Ada                       |
| /admin/projects               | SSR fixture lokal 200         | Ada                       |
| /admin/proposals/[id]         | SSR fixture lokal 200         | Ada                       |
| /admin/proposals/new          | SSR fixture lokal 200         | Ada                       |
| /admin/proposals              | SSR fixture lokal 200         | Ada                       |
| /admin/settings               | SSR fixture lokal 200         | Ada                       |
| /admin/telegram-bot           | SSR fixture lokal 200         | Tidak; periksa test induk |
| /admin/testimonials           | SSR fixture lokal 200         | Ada                       |
| /admin/timesheet              | SSR fixture lokal 200         | Ada                       |
| /admin/users                  | SSR fixture lokal 200         | Ada                       |
| /dashboard/ai-relay           | SSR fixture lokal 200         | Tidak; periksa test induk |
| /dashboard/calculator         | SSR fixture lokal 200         | Ada                       |
| /dashboard/invoices           | SSR fixture lokal 200         | Ada                       |
| /dashboard/orders             | SSR fixture lokal 200         | Ada                       |
| /dashboard                    | SSR fixture lokal 200         | Ada                       |
| /dashboard/profile            | SSR fixture lokal 200         | Ada                       |
| /dashboard/projects/[id]      | SSR fixture lokal 200         | Ada                       |
| /dashboard/projects           | SSR fixture lokal 200         | Ada                       |
| /proposal/[token]             | SSR fixture lokal 200         | Tidak; periksa test induk |

### API

| Route handler                    | Area pemeriksaan                                             |
| -------------------------------- | ------------------------------------------------------------ |
| /api/admin/export/analytics      | Guard anonim, CSV/rentang tanggal dan test export            |
| /api/admin/export/invoices       | Guard anonim, CSV/rentang tanggal dan test export            |
| /api/admin/export/projects       | Guard anonim, CSV/rentang tanggal dan test export            |
| /api/admin/export/timesheet      | Guard anonim, CSV/rentang tanggal dan test export            |
| /api/auth/[...nextauth]          | Sesi/CSRF dan login fixture; tanpa akun produksi             |
| /api/cron/balance-guard          | Guard secret, test cron terkait; pekerjaan live tidak dipicu |
| /api/cron/invoice-reminder       | Guard secret, test cron terkait; pekerjaan live tidak dipicu |
| /api/cron/issue-recurring        | Guard secret, test cron terkait; pekerjaan live tidak dipicu |
| /api/cron/publish-scheduled      | Guard secret, test cron terkait; pekerjaan live tidak dipicu |
| /api/cron/reconcile-integrations | Guard secret, test cron terkait; pekerjaan live tidak dipicu |
| /api/files/[id]                  | Guard anonim dan regresi akses/storage                       |
| /api/files/legacy/[...path]      | Guard anonim dan regresi akses/storage                       |
| /api/health                      | Health staging 200                                           |
| /api/invoices/[id]/pdf           | Guard anonim dan regresi invoice/PDF                         |
| /api/search                      | Guard sesi, hasil kosong/error dan regresi pencarian         |
| /api/upload                      | Regresi otorisasi, validasi konten dan storage               |
| /api/webhooks/payment            | Regresi mock signature, pembayaran/refund dan rekonsiliasi   |

### Modul action

Seluruh berkas sumber berikut masuk inventaris action/helper yang ditelusuri. Pengujian mutasi memakai mock atau database sementara; tidak ada tindakan administratif pada akun produksi.

- `lib/actions/admin-ai-relay.ts`
- `lib/actions/admin.ts`
- `lib/actions/ai-relay.ts`
- `lib/actions/auth.ts`
- `lib/actions/binding.ts`
- `lib/actions/blog-category.ts`
- `lib/actions/blog.ts`
- `lib/actions/bulk.ts`
- `lib/actions/calculator.ts`
- `lib/actions/contact.ts`
- `lib/actions/invoice-reconciliation.ts`
- `lib/actions/invoice.ts`
- `lib/actions/message.ts`
- `lib/actions/milestone.ts`
- `lib/actions/password-reset.ts`
- `lib/actions/payment.ts`
- `lib/actions/portfolio.ts`
- `lib/actions/profile.ts`
- `lib/actions/project-helpers.ts`
- `lib/actions/project.ts`
- `lib/actions/proposal.ts`
- `lib/actions/recurring-invoice.ts`
- `lib/actions/settings.ts`
- `lib/actions/task.ts`
- `lib/actions/team.ts`
- `lib/actions/telegram-bot.ts`
- `lib/actions/testimonial.ts`
- `lib/actions/time.ts`
