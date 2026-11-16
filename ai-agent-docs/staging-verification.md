# Verifikasi integritas staging

## Cakupan

- Lingkungan: `https://staging.aldera.tech`; pemeriksaan 16 November 2026 (WIB).
- Pemeriksaan HTTP tanpa mutasi mencakup 71 kasus rute/API, 89 aset, proteksi anonim, serta health database/storage/upstream. Pemeriksaan sesi/CSRF dan mutasi memakai fixture terisolasi.
- Pengujian mutasi memakai database aplikasi/router terisolasi dan provider mock; tidak ada completion berbayar, transaksi, OTP, atau pesan sungguhan.
- Pemulihan credential menggunakan API key upstream staging aktif yang sudah tersedia, tanpa membuat key atau mengubah ledger. [Hasil pemulihan](https://github.com/AlderaTech/aldera-tech/actions/runs/43773038895).

## Kontrak perbaikan aktif

| Area                | Perilaku                                                                                                                                                     | Pengujian                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Upstream AI         | Bearer memakai API key upstream, bukan password dashboard; health tidak memalsukan sukses.                                                                   | GET health staging; lima test guard/rollback pemulihan. |
| Endpoint IDE/publik | `getRelayApiBaseUrl` memilih produksi `https://api.aldera.tech` atau staging `https://api-staging.aldera.tech`. Panduan dan dialog memakai sumber yang sama. | Deployment environment dan preset modal.                |
| CSV                 | Teks formula dinetralkan termasuk prefix whitespace/control dan lebar penuh; angka serta string desimal keuangan murni tetap utuh.                           | `lib/csv.test.ts`.                                      |
| Timesheet           | Tanggal kalender dan urutan rentang divalidasi sebelum query; input salah 400, gangguan database 503 tanpa detail internal.                                  | Export range dan route timesheet.                       |
| Pencarian           | Gangguan database 503 berbeda dari hasil kosong 200; dialog menampilkan alert, toast dan retry. Request abort tidak memperbarui hasil lama.                  | Route search, hook dan command palette.                 |
| Indexing            | Hanya origin produksi HTTPS boleh diindeks. Staging memakai robots Disallow, metadata noindex/nofollow, dan X-Robots-Tag global.                             | Robots dan root layout.                                 |

## Runtime dan deployment

- Container web staging berjalan tanpa restart berulang. Database utama, database router, storage yang diprobing, dan upstream berstatus `up` pada health staging.
- Kelima cron menolak request tanpa secret; API privat menolak request tanpa sesi. Seluruh 32 halaman statis Dashboard/Admin yang diperiksa mempertahankan redirect Login beserta callback.
- Sesi anonim tidak mengandung identitas. Cookie yang diperiksa memakai Secure, HttpOnly dan SameSite=Lax; token tidak dicatat.
- Deployment staging merekonsiliasi credential secara idempoten dari key aktif yang sudah ada, memverifikasi Login tiga kali, lalu mewajibkan full health HTTP 200. Dependency gagal menggagalkan deployment.
- Password awal dashboard bukan bearer API. Template/vault infrastruktur perlu mempertahankan pemisahan ini; reprovision menggunakan template lama perlu disinkronkan pengelola infrastruktur. Lihat [deployment](deployment.md).
- Konfigurasi dan credential produksi tidak diubah.

## Pengujian

- `bun test`: **920 pass, 0 fail**, 219 berkas, menggunakan PostgreSQL aplikasi/router terisolasi.
- Fokus startup/schema/permissions: **28 pass, 0 fail**, empat berkas.
- `python3 -B docker/staging-relay-auth-test.py`: **5 test lulus**, mencakup isolasi staging, format key, penulisan atomik, idempotensi, dan rollback.
- Lint, Next typegen, TypeScript, formatter berkas task, dan pemeriksaan diff lulus.
- Regresi autentikasi/sesi, OTP, pembayaran/refund, ledger, izin, unggahan, sanitasi konten, dan kalkulator tetap lulus.
- Risiko formula dan strategi sanitasi CSV merujuk [OWASP](https://owasp.org/www-community/attacks/CSV_Injection). Tidak ada formula eksternal yang dieksekusi saat pengujian.

## Batas verifikasi

- Katalog/health HTTP 200 tidak membuktikan completion, streaming, atau tagihan provider; AI berbayar tidak diuji.
- Belum ada E2E browser dengan akun pengujian Client/Admin di VPS. Redirect anonim dan fixture izin bukan penggantinya.
- Visual publik desktop/390 px, 37 tampilan privat dan seluruh tab Relay pengguna/Admin telah diperiksa melalui browser; akun dan detail privat memakai fixture lokal. Fokus keyboard menyeluruh, akun privat di VPS, pengiriman WhatsApp/Telegram/email, Turnstile riil, dan sandbox gateway belum diuji live.
- Ketahanan volume privat terhadap penghapusan stack penuh belum diuji. Probe hanya membuktikan akses storage pada saat pemeriksaan.

## Temuan terbuka

Health dan kelulusan suite bukan pernyataan seluruh sistem bebas bug. [Audit menyeluruh aktif](project-wide-audit.md) memuat reproduksi masalah pembayaran Snap, transisi proposal, timesheet, grafik Ringkasan, fallback/error, validasi query, advisori dependensi, dan sisa ketidakkonsistenan UI. Pemindaian formatter seluruh repo masih menemukan lima berkas baseline yang perlu dirapikan. Audit tersebut belum mengubah kode aplikasi atau deployment.
