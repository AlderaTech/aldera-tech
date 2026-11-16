# Kesiapan akses publik

Tanggal pemeriksaan: **16 November 2026**.

**Keputusan: belum siap untuk membuka seluruh fitur kepada umum.** Halaman
pemasaran dapat diakses, tetapi kesiapan akun, pembayaran, OTP, dan AI tidak
dapat disimpulkan dari keberhasilan halaman publik atau unit test.

## Temuan yang menghalangi rilis penuh

| Prioritas           | Temuan                                                           | Bukti                                                                                                                                                            | Kriteria penyelesaian                                                                                                                        |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Tinggi              | Dependensi AI produksi gagal autentikasi                         | `https://aldera.tech/api/health` HTTP 503; database dan storage aktif, `upstreamRouter` dan `upstream9router` melaporkan HTTP 401                                | Cocokkan autentikasi upstream produksi, dapatkan health 200, lalu uji permintaan AI menggunakan akun serta anggaran pengujian yang disetujui |
| Tinggi              | Kandidat produksi belum mencakup perbaikan staging               | `origin/main` menunjuk `13c236f`, sedangkan staging terverifikasi menunjuk `6cbc33b`; versi dependensi dan perbaikan keamanan pada kedua ref berbeda             | Verifikasi E2E staging, buat Release PR staging ke main, lalu cocokkan image/SHA produksi dengan rilis tersebut                              |
| Tinggi              | Permintaan reset password tidak mempunyai pembatasan pada action | Mock offline menjalankan delapan permintaan berurutan ke akun fixture: delapan token dibuat dan delapan pemanggilan pengiriman WhatsApp dilakukan                | Tambahkan pembatasan bersama/cooldown pada server dan regression test; pastikan respons tetap menjaga privasi akun                           |
| Belum terverifikasi | Alur Client/Admin dan provider sandbox menyeluruh                | Pengguna mengonfirmasi akun uji dan konfigurasi berada di VPS. Diagnostik yang dijalankan hanya membaca metadata upstream; kredensial tidak diambil atau dicetak | Jalankan login, hak akses lintas akun, OTP/reset, pengajuan proyek, pembayaran/refund, serta penggunaan AI pada akun dan sandbox khusus      |

Perbandingan ref Git bukan bukti langsung image yang sedang berjalan di VPS
produksi. Verifikasi digest deployment tetap diperlukan. Tidak ada promosi ke
main atau perubahan konfigurasi produksi dalam pemeriksaan ini.

## Pemeriksaan live yang lulus

Pemeriksaan HTTP GET dilakukan terhadap **55 URL per environment**, total
**110 URL**, tanpa cookie akun, submit formulir, atau transaksi:

| Jenis                              | Produksi             | Staging                                       |
| ---------------------------------- | -------------------- | --------------------------------------------- |
| Halaman publik                     | 10/10 HTTP 200       | 10/10 HTTP 200                                |
| Halaman autentikasi                | 4/4 HTTP 200         | 4/4 HTTP 200                                  |
| Halaman dashboard/admin tanpa sesi | 33/33 redirect Login | 33/33 redirect Login                          |
| API ekspor/pencarian tanpa sesi    | 5/5 HTTP 401         | 5/5 HTTP 401                                  |
| File konfigurasi Git/environment   | 2/2 HTTP 404         | 2/2 HTTP 404                                  |
| Health dependensi                  | HTTP 503             | HTTP 200, seluruh enam dependency check aktif |

Ini menguji akses tanpa sesi, bukan membuktikan pembatasan setiap role atau
kepemilikan data setelah login. Endpoint katalog model publik yang merespons
200 juga tidak membuktikan permintaan inferensi berbayar berhasil.

Staging mempunyai `X-Robots-Tag: noindex, nofollow, noarchive` dan robots yang
melarang indexing. Produksi menyediakan robots dan sitemap. HSTS tersedia
pada kedua environment.

Diagnostik staging melalui GitHub Actions selesai sukses tanpa deployment
atau perubahan data. Metadata menunjukkan API key upstream dikonfigurasi;
nilai credential tidak dicetak. Detail pemeriksaan:
[run diagnostik staging](https://github.com/AlderaTech/aldera-tech/actions/runs/43872765061).

## Hardening dan bukti operasional yang masih diperlukan

- Respons HTML yang diperiksa tidak mempunyai `Content-Security-Policy`,
  `X-Frame-Options`, maupun `X-Content-Type-Options`. Ini celah hardening,
  bukan bukti eksploitasi. Pilih kebijakan yang kompatibel dengan script,
  payment gateway, dan konten aplikasi sebelum menerapkannya.
- Healthcheck Compose repositori memeriksa `/`, sedangkan Dockerfile memeriksa
  `/api/health`. Halaman `/` dapat tetap 200 saat dependensi gagal. Cocokkan
  healthcheck runtime VPS dengan kebutuhan readiness dan monitoring.
- Backup dan restore database/upload, pemantauan error, alert pembayaran,
  serta rekonsiliasi setelah kegagalan perlu bukti pengujian operasional.
- Status sandbox Midtrans/WhatsApp/Telegram dan captcha produksi belum
  diverifikasi melalui transaksi atau pengiriman langsung. Nilai `.env`
  lokal tidak digunakan untuk menyimpulkan konfigurasi VPS.

## Bukti pengujian kode

Suite pada baseline staging menjalankan **1.016 test, nol gagal**, di database
PostgreSQL aplikasi/router yang terisolasi. Pengujian ini mencakup transaksi,
otorisasi, webhook pembayaran, debit/refund saldo, upload, serta rendering dan
kontrak UI. Layanan eksternal menggunakan mock, sehingga hasil tersebut tidak
menggantikan E2E provider staging.

Pipeline memiliki runner terpisah serta aturan sharding berdasar durasi yang
dijelaskan dalam [panduan CI testing](ci-testing.md). Seluruh gate CI tetap
menjadi syarat build/deploy, tetapi CI hijau bukan persetujuan otomatis untuk
promosi ke produksi.

## Gerbang menuju rilis

1. Perbaiki upstream produksi dan pembatasan permintaan reset password.
2. Jalankan E2E menggunakan akun Client/Admin khusus serta layanan sandbox
   yang sudah tersedia di VPS; simpan bukti tanpa secret/data pribadi.
3. Pastikan nilai invoice, status resmi pembayaran, saldo dan ledger, akses
   file privat, serta pembatasan antar akun benar sebelum dan sesudah retry.
4. Uji backup/restore dan tetapkan health monitoring yang mendeteksi
   kegagalan dependency, bukan hanya halaman pemasaran yang masih terbuka.
5. Setelah hasil staging lulus dan diverifikasi, lakukan promosi melalui
   Release PR, verifikasi digest produksi, dan ulangi smoke test.
