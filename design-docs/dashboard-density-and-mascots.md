# Kepadatan dashboard dan pose maskot kontekstual

## Profil Saya

Header halaman Profil berupa badge berikon, judul Profil Saya dan deskripsi langsung di atas latar halaman. Header tidak mempunyai kartu, grid, bayangan atau maskot. Kartu identitas tetap menjadi satu-satunya panel atas bercorak dan bermaskot.

Avatar/fallback inisial, nama, peran, email, telepon dan tanggal bergabung tetap berasal dari akun. Formulir serta mekanisme penyimpanan profil tidak berubah. Profil tidak memakai WorkspaceBanner karena kartu identitas sudah menyediakan visual utama.

## Pose banner

WorkspaceBanner menerima `mascotPose` (preset bertipe) dan `mascotImage` (sumber Next Image). Prop `mascot` tetap dapat memberikan visual kustom atau `false` untuk menyembunyikan visual. Urutan prioritas: visual kustom, gambar eksplisit, preset. Nilai default mempertahankan pose guide.

Pemetaan ada pada [workspace-mascots.ts](../components/dashboard/workspace-mascots.ts).

| Konteks                | Pose / aset                                    | Pemakaian                                                  |
| ---------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Profil                 | `aldera-profile-guide.webp`                    | Kartu identitas saja, membawa kartu dan memberi jempol     |
| Invoice                | `dashboard/banners/aldera-cat-invoice.webp`    | Header, membawa dan menunjuk dokumen invoice               |
| Kalkulator             | `dashboard/banners/aldera-cat-calculator.webp` | Header, menghitung dengan kalkulator dan membawa blueprint |
| Riwayat Estimasi       | `aldera-profile-activity.webp`                 | Header, memeriksa daftar dokumen                           |
| Proyek                 | `aldera-cat-about.webp`                        | Header daftar/detail proyek, membawa laptop                |
| Ringkasan dan AI Relay | Visual kontekstual pemanggil                   | Tetap memakai pose yang tersedia                           |

Dua aset invoice/kalkulator dibuat menggunakan referensi karakter `public/images/hero/aldera-cat-hero.webp` dan `public/images/dashboard/profile/aldera-profile-guide.webp`. Wajah, bulu putih, kacamata hitam, headphone biru/hitam, hoodie putih bergaris merah/biru dan sneakers dipertahankan. Keduanya berukuran 512 x 768, WebP dengan alpha transparan, sekitar 75–77 KB.

Sumber empty state Invoice, Estimasi Biaya dan Riwayat Estimasi tetap `public/images/about/technology/design.webp`. Komponen serta sumber gambar tersebut tidak berubah.

## Katalog AI Relay

- Segmented tab memiliki mode `density="compact"` khusus pemanggil AI Relay pengguna: teks 12px, ikon 16px, minimum tinggi 36px, padding vertikal 6px dan padding track sekitar 3px. Label panjang boleh membungkus. Mode default Admin/Kalkulator tidak berubah.
- Judul dan penjelasan bagian disusun dalam satu kelompok vertikal dengan jarak pendek.
- `ModelCatalogToolbar` memisahkan presentasi filter/search dari `ModelCatalog`. State, kategori, filtering, clipboard, model ID, tarif dan tindakan tetap memakai `useModelCatalog`.
- CSS dashboard membatasi kategori pada minimum 30px dengan teks 12px, input pencarian 36px, dan padding toolbar 10px x 12px. Kontrol chat, top-up dan dialog lain tetap memakai ukuran aslinya.
- Skeleton navigasi mengikuti delapan/empat/dua kolom dengan slot 36px.
- Query tab dan seluruh label/nilai tetap sama. Pencarian/kategori tetap memakai state lokal dari implementasi asli. Tidak ada perubahan endpoint atau aturan URL.
- Komponen toolbar bersama mempertahankan style dasar di luar workspace dashboard; CSS ringkas tidak diterapkan pada AI Relay publik.

## Tombol Riwayat Estimasi

Header Kalkulator memakai Button dengan `asChild` dan Link ke `DASHBOARD_ROUTES.orders`. Tombol mengikuti CTA dashboard: pill biru, teks putih, minimum tinggi 44px, ikon dokumen serta panah, hover/fokus dan reduced motion. Tarif, wizard dan mekanisme pengajuan tidak berubah.

## Verifikasi

- UI gabungan Admin, dashboard, komponen dashboard dan katalog: **364 pass, 0 fail**, 133 berkas.
- Suite lengkap Linux dengan database sementara bersih: **798 pass, 0 fail**, 173 berkas. Provider, pembayaran dan email tidak dikirim ke produksi.
- Browser fixture memakai komponen asli pada desktop sekitar 1440px, tablet sekitar 824px dan HP 390/320px. Profil memiliki tepat satu gambar maskot. Invoice, Kalkulator dan Riwayat menampilkan pose berbeda di header sekaligus gambar empty state asli.
- Pengukuran: kategori 30px, input 36px, toolbar desktop 58px. Trigger tab sekitar 36–46px mengikuti pembungkusan label; track desktop sekitar 54px. Tidak ada overflow halaman atau gambar gagal dimuat.
- Pencarian ID menghasilkan satu model, kategori Budget satu model, dan query tidak cocok menampilkan empty state. Seluruh delapan tab memperbarui tab aktif dan URL. Interaksi memakai mock, bukan provider atau transaksi sungguhan.
- Prettier, Next.js typegen dan typecheck lulus. ESLint 0 error; empat warning existing berada di test backend yang tidak diubah.
- Penyimpanan profil produksi dan integrasi eksternal tidak dijalankan. Validasi, state, query dan action profil tetap memakai kode semula.

## Berkas UI dan pengujian

| Kelompok      | Berkas                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banner/preset | `components/dashboard/workspace-banner.tsx`, `workspace-banner.test.tsx`, `workspace-mascots.ts`, `workspace-mascots.test.ts`                                     |
| Kepadatan tab | `components/dashboard/workspace-segmented-tabs.tsx`, CSS Module dan test pendamping                                                                               |
| Profil        | `app/dashboard/profile/_components/profile-frame.tsx`, `profile-frame.test.tsx`, `profile.module.css`                                                             |
| Header fitur  | Frame dan test Invoice/Pesanan; `app/dashboard/calculator/page.tsx`, test serta `calculator-page.module.css`; header dan test daftar Proyek; header detail Proyek |
| AI Relay      | `relay-tabs.tsx` dan test, `relay-workspace.module.css`, `relay-section-heading.test.tsx`, `relay-loading.tsx` dan test                                           |
| Katalog       | `components/ai-relay/model-catalog.tsx`, `model-catalog.test.tsx`, `_components/model-catalog-toolbar.tsx`, test pendamping                                       |
| Aset baru     | `public/images/dashboard/banners/aldera-cat-invoice.webp`, `aldera-cat-calculator.webp`                                                                           |
| Dokumentasi   | Dokumen ini, `dashboard-profile-ui.md`, `dashboard-ai-relay-ui.md`, `dashboard-calculator-ui.md`, `workspace-visual-consistency.md`                               |

Tidak ada endpoint, skema, dependency atau berkas produksi yang ditambah. Tidak ada berkas yang dihapus; JSX toolbar dipindahkan ke komponen presentasi, dan styling header kartu Profil dibersihkan.
