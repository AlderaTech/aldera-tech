# Pemeriksaan dan perbaikan menyeluruh Aldera Tech

## Status aktif

Branch perbaikan: `fix/project-wide-audit-findings`, berasal dari `origin/staging`. Status deployment mengikuti workflow GitHub dan pemeriksaan VPS; bukti lokal tidak menggantikan E2E staging.

## Kontrak yang diperbaiki

| ID  | Area                | Perilaku aktif dan regresi                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | Pembayaran draf     | Snap hanya menerima invoice SENT/OVERDUE milik pengguna atau Admin. DRAFT, lunas, dibatalkan, dan verifikasi manual ditolak sebelum provider dipanggil.                                                                                                                                                                                                                          |
| A02 | Sesi Snap bersamaan | Reservasi di bawah row lock; panggilan provider di luar transaksi; finalisasi memeriksa status, pemilik, nominal, mata uang, dan versi invoice. Sesi yang sesuai dapat dipakai ulang; lease pembuatan dua menit mencegah panggilan bersamaan. Reservasi kedaluwarsa digagalkan sebelum percobaan baru, sehingga respons lama tidak dikembalikan sebagai sesi yang dapat dibayar. |
| A03 | Keputusan proposal  | Tanda tangan dan penolakan memakai pembaruan status bersyarat. Hanya satu keputusan yang dapat berhasil pada konflik paralel.                                                                                                                                                                                                                                                    |
| A04 | Isolasi pengujian   | Runner membuat container PostgreSQL miliknya sendiri, port loopback acak, database bernama test, tanpa seed/destructive push pada database aplikasi. Setup gagal menghentikan test; container milik runner dibersihkan. Environment provider tidak diwarisi.                                                                                                                     |
| A05 | Dependensi          | Versi patch/minor kompatibel dan override transitif disimpan dalam lockfile v3. Bun minimal 1.4.4 wajib agar selector override berbasis versi diterapkan. Image Docker dan CI memakai Bun 1.4.4.                                                                                                                                                                                 |
| A06 | Grafik Ringkasan    | Donat menghitung jumlah milestone/tugas per status dari seluruh proyek milik pengguna. Grafik pembayaran membandingkan jumlah invoice terbit per status dengan denominator yang sama. Tidak ada persentase progres buatan atau pesan lunas ketika data kosong.                                                                                                                   |
| A07 | Pencatatan waktu    | TimeEntry dan aktivitas disimpan dalam satu transaksi. Kegagalan log membatalkan pencatatan waktu; percobaan ulang setelah kegagalan tidak menggandakan data yang sudah terlanjur tersimpan.                                                                                                                                                                                     |
| A08 | Durasi invalid      | Validasi Zod terpusat menolak NaN, Infinity, durasi nol/negatif, deskripsi kosong, dan durasi di luar kapasitas integer penyimpanan.                                                                                                                                                                                                                                             |
| A09 | Error vs kosong     | Kegagalan query runtime menuju error boundary atau panel error nullable yang eksplisit. Fallback branding dibatasi pada informasi situs. Gangguan binding Telegram mempunyai status error dan retry, bukan dianggap belum terhubung.                                                                                                                                             |
| A10 | Parameter query     | Parser halaman menerima integer positif terbatas. Timesheet menggunakan schema tanggal kalender/rentang yang sama dengan export dan menampilkan kesalahan parameter sebelum query.                                                                                                                                                                                               |
| A11 | Publikasi           | Blog dan Portfolio memakai sumber database dan status publikasi asli. Daftar kosong tetap kosong; slug yang tidak terbit menghasilkan not-found. Fallback hanya memetakan aset gambar, tanpa teks/proyek/artikel sintetis.                                                                                                                                                       |
| A12 | Login               | Pembatas percobaan bersama di PostgreSQL: 10 per akun dan 120 per jaringan dalam 15 menit. Identitas counter berupa HMAC, bukan email/IP mentah. Keberhasilan login membersihkan counter akun; respons kredensial tetap generik. Cleanup memeriksa ulang kedaluwarsa setelah row lock agar counter yang baru diperbarui tidak ikut dihapus.                                      |
| A13 | Dataset besar       | Pengguna/beban kerja dipaginasi 20 baris. Timesheet melakukan agregasi database dan paginasi independen untuk pengguna/proyek. Analytics mengagregasi invoice/waktu di database dengan hasil klien/profitabilitas dibatasi sepuluh.                                                                                                                                              |
| A14 | Tema                | FAQ/Testimoni memakai navbar/footer studio dan heading sans-serif. Reset Password/OTP memakai komposisi autentikasi terbaru, satu h1, serta label password wajib.                                                                                                                                                                                                                |
| A15 | Tab mobile          | Tab AI Relay pengguna/Admin memakai satu track horizontal pada layar sempit. Tab aktif diungkap pada track dalam tanpa menggulir seluruh halaman secara horizontal. Nilai tab tetap mengikuti URL.                                                                                                                                                                               |
| A16 | Bahasa/aset         | Label utama Admin, navigasi, dan deskripsi pemeriksaan ledger memakai Bahasa Indonesia. ID teknis/data ledger tidak berubah. Seluruh permintaan quality gambar memakai nilai yang didukung Next config.                                                                                                                                                                          |
| A17 | Pemeliharaan        | Admin AI Relay dipisahkan menjadi hook, lima tab dan lima dialog. Binding Telegram dipisahkan menjadi hook serta panel terhubung/belum terhubung. Semua halaman memiliki test pendamping langsung; regresi baru mencakup kontrak yang diperbaiki. Formatter seluruh repo menjadi gerbang pemeriksaan.                                                                            |

## Pemetaan pengujian

| Area                       | Berkas utama                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| Snap                       | `lib/invoice-snap-session.test.ts`, `lib/actions/payment-actions.test.ts`                        |
| Proposal paralel           | `lib/proposal-transitions.test.ts`                                                               |
| Waktu/transaksi            | `lib/actions/time.test.ts`                                                                       |
| Guard database/environment | `lib/test-database-url.test.ts`, `scripts/test-environment.test.ts`                              |
| Login                      | `auth.test.ts`, `lib/login-rate-limit.test.ts`                                                   |
| Agregasi/data besar        | `lib/admin-aggregates.test.ts`, test halaman Users/Timesheet/Analytics                           |
| Publikasi                  | `lib/public-publication.test.ts`, test halaman Blog/Portfolio dan Home PortfolioPreview          |
| Query/error                | `lib/pagination.test.ts`, `lib/safe-db.test.ts`, test boundary dan panel error                   |
| Grafik                     | Test OverviewWorkChart/OverviewInvoiceChart serta helper distribusi                              |
| Tab                        | Test WorkspaceTabsList, RelayTabs, helper scroll dan hook reveal                                 |
| UI Admin Relay             | Test halaman, client view, serta seluruh tab/dialog hasil ekstraksi                              |
| Autentikasi/publik         | Test AuthShell, seluruh page, hero FAQ/Testimoni, dan quality gambar                             |
| Integrasi yang sudah ada   | Suite pembayaran/refund, ledger, izin, unggahan, OTP, kalkulator, CSV dan cron tetap wajib lulus |

Gunakan [infrastruktur pengujian](../TEST_INFRA.md). Fixture UI memakai salinan kode kerja, database sementara, akun sintetis dan provider yang dinonaktifkan. Tidak ada perubahan akun, pembayaran, OTP, pesan, atau publikasi produksi saat verifikasi.

## Verifikasi branch

Hasil akhir test, lint, formatter, typegen, typecheck, dependency audit, serta browser dicatat pada [laporan verifikasi perbaikan](project-wide-fixes.md). Pemeriksaan staging yang sudah berjalan dicatat terpisah pada [verifikasi staging](staging-verification.md).

## Batas yang tetap berlaku

- Pengujian lokal/mocked tidak membuktikan completion AI berbayar, pembayaran sandbox, settlement/refund gateway, penerimaan email/Telegram/WhatsApp atau perubahan izin di VPS. Alur eksternal tersebut perlu E2E staging sebelum promosi produksi.
- Pembatas login memerlukan tabel `AuthRateLimit` sebelum image baru berjalan. Ikuti [deployment](deployment.md). Header IP hanya dipercaya bila reverse proxy menimpanya; limiter akun tetap berlaku tanpa IP.
- Riwayat finansial dan jumlah pembayaran tidak berubah. Kebijakan penghapusan invoice, retensi keuangan, WAF/CDN, dan restore backup bukan asumsi yang dapat diputuskan oleh perubahan UI.
- Modul lama di luar perubahan masih mempunyai utang modularitas serta komponen yang diuji melalui test induk, belum semuanya memiliki companion individual. Kelulusan test bukan jaminan tidak ada bug lain atau bukti uji beban produksi.
- Tidak ada dependensi utama Next/React baru, endpoint bisnis, provider, tarif, atau kredensial produksi yang diganti oleh perubahan ini.
