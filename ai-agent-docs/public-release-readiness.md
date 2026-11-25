# Gerbang kesiapan rilis produksi

Dokumen ini adalah checklist rilis yang berlaku. Dokumen ini tidak menyimpan status deployment, hasil test, SHA image, atau temuan live tertentu; simpan bukti tersebut pada PR dan workflow yang menjalankannya.

## Sebelum release PR

- Seluruh required check CI lulus: lint, typecheck, test, konfigurasi, dan build image.
- Perubahan sudah ter-deploy ke staging dengan image dari commit yang diuji.
- Health check staging memeriksa dependency penting, bukan hanya halaman pemasaran.
- Skenario Client/Admin yang terdampak diverifikasi dengan akun uji. Pastikan kepemilikan data, permission, dan alur pemulihan tetap benar.
- Pembayaran, refund, OTP, pengiriman pesan, AI berbayar, serta integrasi eksternal diuji hanya melalui akun/provider sandbox yang disiapkan untuk pengujian.
- Untuk perubahan storage atau database, verifikasi backup/restore atau prosedur pemulihan yang relevan.
- Tidak ada secret, data pribadi, atau bukti transaksi nyata di artifact maupun laporan.

## Promosi produksi

1. Buat Release PR dari staging ke main setelah verifikasi staging selesai.
2. Pastikan image produksi dibangun dari commit yang disetujui; verifikasi digest/SHA setelah deploy.
3. Jalankan smoke test produksi yang aman tanpa membuat transaksi atau mengubah akun.
4. Pantau error dan dependency setelah rilis; lakukan rollback sesuai prosedur deployment bila health menurun.

CI hijau dan test mock tidak membuktikan integrasi provider live. Bukti setiap rilis berada pada PR/CI dan sistem monitoring, bukan pada salinan laporan di `ai-agent-docs/`.
