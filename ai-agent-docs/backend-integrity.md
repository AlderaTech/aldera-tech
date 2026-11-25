# Invarian integritas backend

Dokumen ini memuat aturan runtime lintas fitur yang penting untuk keamanan dan konsistensi data. Implementasi dan test terkait tetap menjadi sumber kebenaran.

## Sesi dan otorisasi

- Pembacaan sesi server menyelaraskan akun aktif dan role terbaru. Akun hilang/nonaktif atau sesi yang versinya dicabut harus ditolak.
- Middleware adalah pemeriksaan awal; setiap Server Action, Route Handler, dan akses data sensitif tetap memerlukan pemeriksaan sesi, permission, serta kepemilikan objek di server.
- Akun undangan administrator memakai penanda `User.invitedAt` dan tidak dianggap telah memverifikasi nomor telepon. Registrasi mandiri tetap memerlukan verifikasi.
- Login memakai counter PostgreSQL bersama: batas 10 percobaan per akun dan 120 per jaringan dalam 15 menit. Kunci disimpan sebagai HMAC, bukan email atau IP mentah. Login berhasil menghapus counter akun.
- Reset password mengonsumsi token secara atomik dan menaikkan versi keamanan sesi. OTP terikat akun/nomor, memiliki cooldown dan batas percobaan atomik.
- Provider gagal atau konfigurasi produksi yang hilang harus menghasilkan status gagal yang jujur. Simulasi tanpa provider hanya boleh dipakai di development/test.

## Pembayaran, invoice, dan proposal

- Invoice membedakan tujuan proyek dan top-up melalui field tujuan eksplisit. Catatan atau deskripsi tidak boleh dipakai untuk menyimpulkan kredit.
- Verifikasi pembayaran manual bersifat atomik dan idempoten. Invoice final tidak dapat dibuka kembali oleh unggahan atau aksi verifikasi ulang.
- Sesi pembayaran Snap hanya dibuat untuk invoice yang memenuhi status dan pemilik yang diizinkan. Reservasi memakai row lock; provider dipanggil di luar transaksi; sebelum token dikembalikan, server memeriksa ulang status, pemilik, nominal, mata uang, dan versi invoice.
- Webhook memverifikasi signature dan nominal. Event terlambat tidak boleh membalikkan status terminal.
- Efek saldo dan perubahan pembayaran disimpan konsisten. Worker rekonsiliasi memakai ID efek untuk mencegah kredit ganda. Refund yang membuat saldo kurang harus ditinjau; saldo tidak boleh menjadi negatif dan akses AI tidak dibuka sebelum rekonsiliasi selesai.
- Keputusan proposal memakai transisi status bersyarat agar tanda tangan, penolakan, atau konversi yang bersamaan tidak saling menimpa.
- Penerbitan invoice berulang mengunci template dan menyimpan invoice serta jadwal berikutnya dalam satu transaksi.

## Timesheet

- Entri waktu manual menolak durasi non-finite, nol/negatif, dan nilai di luar batas penyimpanan. `TimeEntry` dan `ActivityLog` disimpan dalam satu transaksi.
- Filter tanggal timesheet dan export memakai validasi tanggal kalender/rentang sebelum query; tanggal invalid tidak boleh diteruskan ke database.

## Berkas dan unggahan

- Unggahan memerlukan satu konteks yang diizinkan: proyek, invoice, atau top-up; server memeriksa kepemilikan dan status konteks.
- Berkas proyek dan bukti pembayaran disimpan di storage privat. Unduhan memeriksa sesi, scope, dan kepemilikan; semua rewrite URL lama harus tetap melewati kontrol ini.
- Media yang sengaja dipublikasikan memakai scope publik dan harus dirujuk konten publik.
- Validasi membaca isi berkas, bukan hanya nama atau MIME. Gambar didekode dan dikodekan ulang; ekstensi ditentukan server. PDF dan format dokumen memerlukan signature yang sesuai.
- Metadata berkas harus berhasil disimpan sebelum respons sukses. Jika penyimpanan metadata gagal, bersihkan berkas yang baru dibuat dan jangan mengembalikan URL sukses.

## Data dan integrasi

- Gagalnya query bukan hasil kosong. Fallback hanya boleh digunakan pada informasi yang memang punya nilai default; data bisnis harus menyampaikan error secara eksplisit.
- Blog dan portfolio publik memakai data terbit dari database. Fallback gambar tidak boleh membuat artikel atau proyek sintetis.
- Sinkronisasi konfigurasi ke router memakai state antrean per entitas. Kegagalan router dilaporkan tertunda dan dapat dicoba ulang; data entitas lain tidak dihapus.
- Respons AI, pemakaian token, dan katalog harus berasal dari upstream yang valid. Jangan membuat respons, model, atau harga palsu ketika upstream gagal.
- Secret cron, Turnstile, WhatsApp, dan Telegram wajib tervalidasi sesuai environment; produksi tidak boleh diam-diam memakai simulasi.

Lingkungan test lokal dijelaskan di [testing-infrastructure.md](testing-infrastructure.md). Gerbang rilis ada di [public-release-readiness.md](public-release-readiness.md).
