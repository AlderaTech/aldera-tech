# Pengujian antarmuka

Panduan ini mengatur test untuk perubahan antarmuka. Test harus memeriksa perilaku yang terlihat atau kontrak yang penting bagi pengguna; jangan menambahkan assertion yang tidak relevan hanya untuk memenuhi checklist.

## Penempatan dan runner

- Tambahkan atau perbarui test yang berdampingan dengan halaman/komponen UI yang perilakunya berubah.
- Gunakan `bun run test <path-test>` untuk test terarah. Runner membuat database sementara dan menjalankan Bun dalam isolasi; detailnya ada di [testing-infrastructure.md](testing-infrastructure.md).
- Jangan jalankan raw `bun test` kecuali database test sudah disiapkan secara eksplisit, misalnya oleh CI.

## Cakupan yang berlaku

Pilih cakupan berdasarkan jenis perubahan:

- **Halaman:** render dan data awal yang digunakan halaman; uji metadata jika halaman mengekspornya; uji tautan atau redirect yang berubah.
- **Formulir:** validasi input, pesan error, status submit/loading, dan hasil sukses/gagal. Placeholder harus memberi contoh yang membantu; required/optional harus terlihat jelas.
- **Data view:** uji loading, empty, dan error bila komponen mendukung kondisi tersebut. Untuk daftar besar, uji batas halaman, URL query, serta perilaku filter/pagination yang berubah.
- **Interaksi:** uji state aktif tab/filter/search dari URL bila fitur tersebut ada.
- **Aksi destruktif atau mutasi:** uji konfirmasi aplikasi dan feedback sukses/gagal. Jangan mengandalkan dialog browser native.
- **Aksesibilitas:** gunakan label, role, fokus keyboard, dan nama aksi yang dapat dipahami pada kontrol yang diubah.

Komponen statis tidak memerlukan test pagination, form hygiene, metadata, atau state data yang tidak dimilikinya. Jangan menduplikasi test unit untuk helper yang sudah diuji terpisah kecuali perubahan UI mengubah kontraknya.

## Batas verifikasi

Mock/provider test tidak membuktikan integrasi live. Pembayaran, pengiriman pesan, email, OTP provider, dan penggunaan AI eksternal harus diverifikasi pada environment staging yang memang disiapkan untuk tujuan itu. Catat bukti run di PR/CI, bukan dengan menambahkan laporan task baru di direktori ini.
