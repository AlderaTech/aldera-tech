# UI Profil Saya

## Cakupan dan data

Rute tepat `/dashboard/profile` memakai shell dashboard yang tersedia. Identitas dan Edit Profil tetap memakai akun terautentikasi serta action asli. Tiga panel tambahan (proyek, pembayaran, aktivitas) adalah preview frontend berlabel **Demo**, bukan data akun.

Tidak ada panel paket/langganan, fixture paket, tipe paket, atau dialog pilihan paket pada halaman ini. Backend, API, autentikasi, query profil, validasi, header/sidebar bersama, dan halaman lainnya tetap. Kontrak integrasi tersedia di [Serah terima backend Profil](dashboard-profile-integration.md).

## Susunan dan corak

- Kartu identitas memenuhi lebar bagian atas. Foto akun/fallback inisial tetap berada di kiri; nama, peran, email, telepon, dan tanggal bergabung memakai data asli. Email read-only dan telepon kosong ditampilkan sebagai Belum ditambahkan.
- Pose maskot guide berada bersama tombol Edit Profil pada sisi kanan kartu desktop. Pada HP maskot menjadi aksen kecil di samping tombol. Keduanya tetap terpisah dari avatar akun.
- Pada container minimal 54rem, proyek berada di kiri (1,65 bagian) dan pembayaran disusul aktivitas ditumpuk di kanan (1 bagian). Tepi bawah Aktivitas Terbaru sejajar dengan kartu Proyek (pemeriksaan browser pada 1280/1440px menunjukkan selisih 0px): grid desktop meregangkan kedua kolom, sementara pembayaran mengikuti isi dan aktivitas mengisi sisa tinggi dengan batas minimum sesuai konten. Isi setiap kartu tetap rata atas. Tidak ada tinggi piksel tetap atau pemotongan konten.
- Pada container 40–54rem, proyek penuh di atas; pembayaran dan aktivitas menjadi dua kolom di bawah dengan tepi bawah sejajar. Pada HP seluruh panel vertikal.
- Aktivitas memakai header dengan mini maskot duduk membawa papan progres, lalu linimasa. Tidak ada panel bantuan terpisah yang memanjangkan halaman.
- Kartu putih, teks navy, aksen biru, radius 24px, border navy 18%, teks sekunder navy 72%, serta bayangan halus mengikuti token `--overview-*`.
- Corak titik dan orbit dibatasi di sisi kanan identitas. Panel lain mendapat gradasi sudut dan garis geometris tipis. Corak memakai pseudo-element, tidak menghalangi klik, dan berada di belakang konten. Hover proyek hanya memperjelas border/bayangan.
- CSS Modules privat mencegah perubahan pada halaman lain. Maskot bergerak mengambang 3px hanya saat prefers-reduced-motion mengizinkan. Tidak ada tinggi konten yang dikunci.

## Edit Profil asli

`ProfileContent` mempertahankan `prisma.user.findUnique` berdasarkan ID sesi dengan select `id, name, email, roles, avatar, phone, createdAt` dan fallback `safeDb`. Identitas dirender di server; editor client hanya menerima name/phone.

| Field                         | Kontrak                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `name`, ID `name`             | Wajib, nilai awal akun, autocomplete name, placeholder dan label bintang |
| `phone`, ID `phone`           | Opsional, null menjadi string kosong, autocomplete tel, inputMode tel    |
| Email, avatar, peran, tanggal | Hanya ditampilkan; tidak menjadi payload pembaruan                       |

Edit Profil membuka dialog Radix. `ProfileForm`, `useProfileForm`, dan `updateProfile(formData)` mempertahankan payload name/phone, validasi server, trimming, konversi telepon kosong, izin, revalidasi, toast, pending/disabled, guard submit ganda, dan retensi input saat gagal. Sukses hanya diumumkan setelah respons ok. Draft tidak mengganti identitas akun secara lokal.

Label selalu terlihat, input 16px, tombol minimal 44px, fokus terlihat dan tidak terpotong. Dialog dapat digulir pada viewport pendek. Escape menutup dialog dan mengembalikan fokus. Tidak ada fitur upload avatar, ubah password, atau keamanan baru.

Skeleton mengikuti identitas dan grid tiga panel. Jika pengguna tidak ditemukan/query gagal, halaman menampilkan kondisi tidak tersedia dengan retry, bukan profil contoh.

## Preview frontend

Fixture terpusat: `app/dashboard/profile/_data/profile-preview-data.ts`. Tipe: `_types/profile-preview.ts`.

| Panel                | Tampilan dan tindakan                                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seluruh Proyek Saya  | Tiga proyek contoh dengan status, progres, tanggal, dan deliverables. Lihat Detail membuka dialog lokal; tidak mengirim ID contoh ke route proyek. Lihat Semua Proyek memakai `DASHBOARD_ROUTES.projects`. |
| Informasi Pembayaran | Dua metode fiktif tersamarkan. Kelola membuka pilihan lokal; Terapkan di Preview tidak menyimpan ke server/browser. Batal membuang draft. Tidak ada input kartu asli, gateway, atau transaksi.             |
| Aktivitas Terbaru    | Tiga event contoh dengan waktu ISO tetap, diformat memakai Asia/Jakarta. Tidak digabung dengan riwayat akun.                                                                                               |

Proyek/aktivitas menerima resource loading, ready (termasuk array kosong), dan error. Retry hanya muncul jika callback tersedia. Preview membatasi tiga proyek/lima aktivitas dengan keterangan jumlah pada dataset besar. Batas ini bukan pagination backend.

`usePreviewSelection` hanya menangani draft dan pilihan metode pembayaran lokal; reload mengembalikan contoh awal. Tidak ada langganan/checkout di halaman Profil.

## Aset maskot baru

Dua pose dibuat menggunakan skill imagegen dengan `public/images/hero/aldera-cat-hero.webp` sebagai referensi identitas. Wajah, kacamata, headphone, bulu putih, hoodie/shorts, sneakers, dan aksen merah-biru dipertahankan.

| Aset di `public/images/dashboard/profile/` | Pose dan penggunaan                                                  | Ukuran                      |
| ------------------------------------------ | -------------------------------------------------------------------- | --------------------------- |
| `aldera-profile-guide.webp`                | Berdiri, membawa folder proyek biru, memberi jempol; kartu identitas | 427 × 640px, sekitar 59 KiB |
| `aldera-profile-activity.webp`             | Duduk bersila dengan clipboard/stylus; header aktivitas              | 512 × 512px, sekitar 53 KiB |

Keduanya WebP transparan (alpha dipertahankan), memakai Next Image dengan dimensi tetap, object-fit contain, alt kosong, aria-hidden, pointer-events none, dan lazy loading. Ukuran tampilan guide 124 × 142px pada container lebar, 64 × 76px pada ukuran menengah, dan 80 × 96px di HP; aktivitas 80 × 90px. Gambar asli Beranda dan aset yang dipakai halaman lain tidak diganti.

## Berkas dan test

Semua path komponen berikut relatif terhadap `app/dashboard/profile/`.

| Berkas                                                                                      | Tanggung jawab                                                             |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `page.tsx`, `loading.tsx`, `_components/profile-content.tsx`                                | Autentikasi, query asli, Suspense, komposisi                               |
| `profile-frame.tsx`, `profile-identity.tsx`, `profile.module.css`                           | Header, identitas, penempatan guide, corak lokal                           |
| `profile-editor.tsx`, `profile-form.tsx`, `profile-dialog.tsx`, `profile-dialog.module.css` | Dialog dan formulir simpan asli                                            |
| `profile-preview-workspace.tsx`, `profile-preview.module.css`                               | Grid proyek dan kolom pembayaran/aktivitas                                 |
| `profile-projects-panel.tsx`, `profile-payment-panel.tsx`, `profile-activity-panel.tsx`     | Tiga panel demo dan dialog yang tersedia                                   |
| `profile-preview-primitives.tsx`                                                            | Header dengan slot visual, Demo, feedback state                            |
| `profile-mascot.tsx`, `profile-mascot.module.css`                                           | Dua aset baru dan animasi dekoratif                                        |
| `profile-skeleton.tsx`, `profile-unavailable.tsx`                                           | Loading dan error profil                                                   |
| `_data/profile-preview-data.ts`, `_types/profile-preview.ts`                                | Kontrak dan fixture tiga panel                                             |
| `_hooks/use-preview-selection.ts`                                                           | Pilihan metode demo lokal                                                  |
| `_hooks/use-profile-form.ts`                                                                | Mekanisme simpan asli, tidak diubah                                        |
| `page.test.tsx`, `_components/*.test.tsx`, `_data/*.test.ts`, `_hooks/*.test.tsx`           | Data/rute/form/state, regresi penghapusan paket, aset alpha, dan rendering |

Komponen `profile-plan-panel.tsx` beserta test, fixture, tipe, dan CSS paket tidak lagi digunakan dan dihapus.

`bun test app/dashboard/profile app/dashboard/settings`: **43 test lulus, 0 gagal**, termasuk regresi penghapusan paket serta pengujian dua aset alpha. Pemeriksaan juga mencakup formatter terarah, lint, Next typegen, typecheck, serta Git diff. Preview browser memakai komponen dan hook asli dengan fixture akun serta action mock untuk memeriksa desktop/HP, dialog, pilihan pembayaran, validasi, pending, error, retensi input, sukses setelah respons, serta fokus. Tidak ada overflow horizontal pada 320, 390, 768, 1024/1040, 1280, dan 1440px. Pada viewport 320 ? 500px tombol simpan tetap terjangkau dengan scroll dialog. Kedua WebP berhasil dimuat dan mendapat HTTP 200 melalui optimizer Next.js.

Penyimpanan database nyata dan penyegaran sesi setelah simpan nyata belum diverifikasi. Tiga panel tambahan belum terhubung backend. Tidak ada akun/transaksi produksi yang diubah; suite integrasi Router DB penuh tidak dijalankan dalam tugas UI ini.
