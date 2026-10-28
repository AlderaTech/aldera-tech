# Serah terima integrasi panel Profil

## Batas implementasi aktif

Identitas dan Edit Profil sudah memakai backend akun yang tersedia. Tiga panel di bawahnya (proyek, pembayaran, aktivitas) masih **Demo**, atas permintaan rancangan frontend. Tidak ada endpoint, tabel, query, gateway, atau pembayaran baru. Panel paket/langganan tidak ada pada rancangan Profil aktif.

Komposisi utama: `app/dashboard/profile/_components/profile-content.tsx` dan `profile-preview-workspace.tsx`. Fixture terpusat: `app/dashboard/profile/_data/profile-preview-data.ts`. Kontrak tipe: `app/dashboard/profile/_types/profile-preview.ts`. Jangan menggabungkan fixture dengan data akun atau menampilkan Demo sebagai data nyata.

## Identitas yang sudah terhubung

Query server tetap memilih `id, name, email, phone, avatar, roles, createdAt` berdasarkan ID sesi. Slot `ProfileEditor` menerima hanya name/phone. `use-profile-form.ts` memanggil action `updateProfile` yang sudah ada; payload, validasi, izin, dan revalidasi tetap. Email read-only. Foto/peran/tanggal tidak dapat diubah dari rancangan ini.

Pembaruan nyata harus tetap mengikuti konfirmasi server dan alur sesi/header yang sudah tersedia. Pengujian UI menggunakan action mock; tidak ada profil produksi yang diubah.

## Proyek

- Lokasi UI: `_components/profile-projects-panel.tsx`.
- Penggantian mock: ganti resource default berbasis `PROFILE_PREVIEW_PROJECTS` dengan props dari data pengguna yang diotorisasi; perbarui pemasangan di `profile-preview-workspace.tsx`.
- Field: `id, name, description, kind, status, progress, startDate, targetDate, deliverables[]`.
- Kind saat ini: web/mobile/dashboard. Status preview: IN_PROGRESS/REVIEW/COMPLETED; petakan status backend secara eksplisit tanpa menyimpulkan status dari label atau persen.
- Progress harus nilai asli 0–100; jangan menghitungnya dari status. Tanggal mulai/target memakai tanggal ISO. Sesuaikan tipe nullable dan fallback jika kontrak backend mengizinkan tanggal kosong.
- Tindakan: daftar proyek milik pengguna; detail yang memverifikasi izin pengguna. Lihat Detail sekarang dialog lokal. Jangan menggantinya dengan URL ID contoh. Link Lihat Semua Proyek sudah memakai konstanta route resmi.
- Resource loading/empty/error/retry tersedia. Batas preview tiga item dengan catatan jumlah; jika membutuhkan daftar besar, hubungkan pagination/URL melalui pola dashboard yang tersedia.

## Pembayaran

- Lokasi UI: `_components/profile-payment-panel.tsx`.
- Mock: `PROFILE_PREVIEW_PAYMENTS`. Pilihan lokal dikelola `_hooks/use-preview-selection.ts`.
- Field yang dipakai UI: `id, name, kind (bank/card), maskedNumber, description`.
- Jika backend mendukung metode tersimpan, sediakan hanya metadata tersamarkan serta ID/referensi aman; kebutuhan seperti defaultMethodId harus berasal dari kontrak terotorisasi.
- Tindakan sekarang: buka dialog, pilih radio, Terapkan di Preview, Batal. Tidak ada persistensi; reload mengembalikan contoh awal.
- Integrasi mendatang perlu menetapkan mekanisme pengelolaan yang didukung sistem dan konfirmasi hasil server. Jika ada data kartu sensitif, gunakan alur provider yang sesuai; jangan memasukkan nomor kartu mentah ke komponen ini.
- Rancangan tidak meminta nomor kartu, tidak menggunakan localStorage, tidak menambah gateway, dan tidak menampilkan sukses pembayaran.

## Aktivitas

- Lokasi UI: `_components/profile-activity-panel.tsx`.
- Mock: `PROFILE_PREVIEW_ACTIVITIES`, default resource ready.
- Field: `id, kind (progress/document/status), description, occurredAt` (ISO timestamp).
- Backend perlu memasok riwayat aktivitas yang boleh dilihat akun aktif dengan urutan konsisten. Jika memakai metadata proyek/file, gunakan data dan route terotorisasi.
- Tampilan waktu menggunakan Asia/Jakarta secara eksplisit. Batas preview lima item; integrasikan pagination/cursor sesuai pola yang tersedia jika riwayat panjang.
- Tindakan retry bersifat opsional melalui `onRetry`; tidak ada tombol retry palsu jika callback belum disuplai.
- Maskot bantuan bersifat dekoratif dan tidak membawa status akun.

## Susunan frontend

Identitas memenuhi lebar atas. Pada desktop proyek berada di kiri; pembayaran dan aktivitas ditumpuk di kanan, lalu menjadi vertikal pada HP. Maskot baru di kartu identitas dan header aktivitas bersifat dekoratif. Sumber data dan resource panel tidak bergantung pada susunan grid.

## Kontrak state dan transisi integrasi

`PreviewResource<T>` saat ini:

```ts
{ status: "loading" }
{ status: "ready"; items: readonly T[] } // [] berarti kondisi kosong
{ status: "error"; message: string }
```

Panel proyek/aktivitas menerima resource dan callback retry sebagai props. Pembayaran menerima array readonly; pada preview tidak ada fetch atau kegagalan jaringan sehingga hanya tersedia data contoh/kosong. Saat menambah fetch nyata, perluas state panel ini mengikuti status loading/error/empty dari sumber sebenarnya, bukan mensimulasikan respons.

`usePreviewSelection` hanya untuk opsi statis demo. Ganti default selection dan aksi apply dengan data tersimpan/server pada integrasi; tangani opsi yang berubah, pending, rollback/retensi draft, serta pesan error dari sistem.

Label **Demo**, **Belum terhubung**, **contoh**, dan disclaimer jangan dihapus sampai sumber nyata serta tindakan server telah selesai dan terverifikasi. Fixtures harus dikeluarkan dari komposisi runtime yang terintegrasi. Tidak ada perubahan backend yang dilakukan oleh tugas frontend ini.

## Pengujian saat integrasi

- Pertahankan UI tests co-located; ganti fixture integration test dengan akun/DB terisolasi.
- Verifikasi izin per akun, data kosong, error/retry, dataset panjang, status/tanggal/progres asli, dan navigasi detail.
- Verifikasi simpan profil dan refresh data akun dengan akun uji.
- Untuk pembayaran, gunakan lingkungan provider pengujian serta konfirmasi resmi server; jangan menggunakan akun produksi untuk tes.
- Periksa modal/keyboard/HP dan jangan mengirim ID demo, data kartu mentah, atau aksi transaksi dari preview.
