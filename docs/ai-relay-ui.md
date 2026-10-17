# UI halaman AI Relay

Halaman publik `/ai-relay` mengikuti identitas studio Beranda, Tentang, Layanan, dan Portofolio: Plus Jakarta Sans, navy, biru elektrik, putih, serta gradasi biru es ke slate. Informasi produk, katalog, konfigurasi IDE, dan estimasi biaya menjadi fokus utama.

## Komposisi aktif

Kartu inti Aldera AI Relay pada diagram memakai gradasi 125 derajat dari `--home-sky` melalui `--home-ice` ke `--home-slate`, dalam palet yang sama dengan footer studio yang lebih pekat. Teks navy, ikon pada permukaan putih transparan, border slate tipis, dan bayangan lembut menjaga keterbacaan serta penanda pusat alur.
Area kode di bawah label IDE/JSON memakai gradasi biru muda–abu-abu 125 derajat dari `--home-sky`, `--home-ice`, dan `--home-slate`, selaras dengan palet studio. Teks navy, penanda JSON biru, serta toolbar dan status bar putih transparan menjaga kontras pada panel terang. `RelayCodeWindow` menampilkan nomor baris, nama file preset, toolbar Salin Snippet, dan informasi format. Isi JSON serta mekanisme salin mengikuti konfigurasi IDE dan model yang dipilih.

Garis biru keabu-abuan setebal 1px dengan ujung memudar memisahkan hero, katalog, panduan konfigurasi, kalkulator, dan CTA penutup. Panel konfigurasi memakai pemisah vertikal antara pilihan IDE dan editor pada desktop, serta horizontal pada layar di bawah 900px. Toolbar, nomor baris, dan status bar editor dipisahkan garis tipis tanpa mengubah warna dasar gradasi.

- Hero dua kolom menampilkan judul dan CTA daftar/masuk di kiri. Panel HTML di kanan memperlihatkan alur aplikasi/IDE → Aldera AI Relay → model aktif. Nama model berasal dari katalog yang sama dengan daftar harga; panel merupakan ilustrasi integrasi, bukan indikator status layanan.
- Empat kartu ringkas menjelaskan API Key terpadu, pembayaran Rupiah/QRIS, preset IDE, dan respons streaming berdasarkan konten halaman yang tersedia. Judul dan deskripsi kartu, tiga langkah integrasi, label pilihan IDE, serta ringkasan biaya memakai ukuran teks yang nyaman dibaca pada desktop dan HP.
- Judul bagian memiliki ritme yang berbeda sesuai tugasnya: katalog memakai judul kiri dan penjelasan beraksen garis di kanan, panduan integrasi terpusat di atas tiga langkah, dan kalkulator menempatkan nomor bagian di sisi judul serta penjelasan. Pada layar kecil, katalog dan kalkulator kembali ke satu kolom rata kiri; panduan tetap terpusat. Isi teks dan urutan bagian tidak berubah.
- Katalog mempertahankan kategori, pencarian nama/ID/kegunaan, model aktif, context window, harga input/output per satu juta token, rekomendasi, salin ID, serta tombol Gunakan di IDE. Desktop mulai 1200px memakai tabel; layar lebih kecil memakai kartu satu/dua kolom dengan informasi dan tindakan yang sama. Kondisi hasil kosong tetap tersedia.
- Panduan tiga langkah diikuti generator konfigurasi untuk Cursor, Cline, Roo Code, Continue.dev, dan OpenWebUI. Pilihan tool/model menghasilkan JSON melalui helper asli; tombol salin memakai Clipboard API dan toast sukses/error yang sama.
- Kalkulator mempertahankan parameter, rentang, nilai awal, model A/B, rumus 30 hari, dan penghematan kondisional. Label, nilai slider, harga, serta hasil memiliki hierarki yang jelas. Pada desktop, kolom parameter dan hasil mempunyai tepi bawah sejajar; panel penghematan atau kartu biaya memakai ruang tambahan sesuai kondisi hasil. Keterangan estimasi tetap berada di bagian bawah dan menjelaskan perbedaan dengan biaya aktual.
- CTA penutup menempatkan label, judul, deskripsi, dan dua tombol dalam komposisi terpusat. Panel memakai gradasi biru es ke slate dengan cahaya biru serta garis teknologi tipis. Latar bagian CTA kembali ke putih sebelum footer studio bergradasi slate yang lebih pekat dan bergaris tepi atas tipis. Pada HP, tombol tersusun vertikal selebar panel. Seluruh CTA daftar/masuk memakai konstanta `AUTH_ROUTES` yang sama.
- Pada rute publik AI Relay, `PublicShell` mengaktifkan navbar kaca dan footer studio bersama melalui pemeriksaan pathname. Latar hero transparan di atas gradasi pembungkus yang juga terlihat di belakang navbar, sehingga tidak ada bidang warna terpisah pada awal halaman. Footer studio menggunakan warna yang sama di Beranda, Tentang, Layanan, Portofolio, AI Relay, dan Harga.

## Batas fungsi dan komponen

`page.tsx`, metadata, `getModelCatalog`, sumber data/fallback, autentikasi, pembayaran, router, serta integrasi upstream tidak diubah. Tidak ada dependensi, endpoint, atau variabel lingkungan baru.

`client-view.tsx` menyusun komponen dalam `_components/`. State dan handler halaman dipisahkan ke `_hooks/use-relay-showcase.ts` dengan nama, nilai awal, perhitungan, dan efek penyalinan yang sama. `_data/relay-content.ts` menyimpan kategori, nama IDE, dan base URL konfigurasi; URL ini tidak digunakan untuk request baru. ID `catalog-section` dan `quickstart-guide` dipertahankan. Navigasi Gunakan di IDE menghormati reduced motion.

CSS Modules membatasi styling pada AI Relay. Komponen Select, Button, Input, Table, FadeUp, serta tombol studio yang sudah tersedia digunakan kembali. Kontrol memiliki label, area sentuh minimal 44px, indikator fokus, dan tombol kategori/IDE memakai `aria-pressed`. JSON memiliki scroll internal agar halaman tidak melebar.

## Mini maskot

Dua variasi dibuat memakai tool bawaan **imagegen**, dengan [maskot Beranda](../public/images/hero/aldera-cat-hero.webp) dan [maskot Layanan](../public/images/services/aldera-cat-services.webp) sebagai referensi identitas. PNG sumber dikonversi menggunakan Sharp menjadi WebP kualitas 88, alpha kualitas 100; file sumber tidak disertakan dalam repositori.

| Aset                                                                                     | Ukuran    | Besar       | Penempatan                                                                                      |
| ---------------------------------------------------------------------------------------- | --------- | ----------- | ----------------------------------------------------------------------------------------------- |
| [aldera-cat-relay-peek.webp](../public/images/ai-relay/aldera-cat-relay-peek.webp)       | 443 × 480 | 54.420 byte | Mengintip pada sudut panel koneksi, lebar 104px desktop / 88px mobile                           |
| [aldera-cat-relay-connect.webp](../public/images/ai-relay/aldera-cat-relay-connect.webp) | 300 × 480 | 44.648 byte | Duduk membawa simbol koneksi pada sidebar konfigurasi, lebar 84px, disembunyikan di bawah 900px |

Keduanya menggunakan static import dan `next/image` dengan dimensi intrinsik, sizes, kualitas 90, alpha transparan, dan pemuatan lazy. Gambar dekoratif memakai alt kosong, pembungkus `aria-hidden`, serta `pointer-events: none`. Animasi ringan dihentikan pada `prefers-reduced-motion`; gambar tidak menutupi tombol, judul, maupun catatan hero.

## Prompt final aset

### Mengintip

```text
Use case: stylized-concept.
Asset type: small transparent decorative mascot cutout for Aldera Tech AI Relay website.
Input images: Image 1 and Image 2 are character identity and material references, not edit targets.
Primary request: create ONE new pose of exactly the same white Aldera cat. The cat peeks over an invisible horizontal panel ledge: just head, shoulders, and both little paws curled resting along the same horizontal baseline, facing camera with a subtle friendly head tilt. No physical panel in the image, the paws will rest on a real HTML card.
Subject identity invariants: white fluffy cat, pink inner ears and tiny pink nose, black sunglasses, oversized dark navy/black headphones with electric blue rings, white cotton hoodie with narrow red and electric blue racing stripes. Match reference facial proportions and high quality soft fur and fabric materials. Do not redesign character.
Composition: isolated single character, centered, compact bust silhouette, entire ears/headphones/paws visible, generous small padding, square canvas, transparent background with genuine alpha. Suitable for display at 100px. Soft studio light, restrained cool blue rim, clean readable silhouette.
Constraints: no words, logos, panels, scenery, extra characters, background, floor, or huge glow. Keep paws on identical horizontal baseline.
```

### Duduk membawa simbol koneksi

```text
Use case: stylized-concept.
Asset type: small transparent decorative mascot cutout for Aldera Tech AI Relay developer panel.
Input images: Image 1 and Image 2 are character identity/material references, not edit targets.
Primary request: ONE new pose of exactly the same Aldera white cat, sitting casually on an invisible ledge, legs dangling together slightly turned to the left, holding a small electric blue connection symbol made of two simple linked chain loops with both paws near its lap. A welcoming helpful expression. Keep symbol small.
Identity invariants: same fluffy white cat, pink nose/inner ears, black sunglasses, dark oversized headphones with electric blue rings, white cotton sporty hoodie and white shorts with narrow red and blue racing stripes, white/navy sneakers with red details, fluffy white tail. Match reference proportions, materials, facial shape, and polished soft 3D studio illustration.
Composition: isolated single seated figure, entire ears, feet and tail in frame, compact silhouette suitable for 120px display, square canvas with small padding, genuine transparent alpha background. Soft studio lighting and subtle blue rim.
Constraints: no actual ledge, panels, furniture, words, logos, scenery, extra characters, floor, or background. Do not create a new character or exaggerated chibi proportions.
```

## Pemeriksaan UI

Pemeriksaan browser lokal mencakup lebar 320, 390, 768, 1024, dan 1440px; kategori Coding; pencarian DeepSeek; hasil kosong; salin ID; Gunakan di IDE; kelima preset JSON; pergantian model; salin konfigurasi; slider; model pembanding; kondisi tanpa selisih biaya; navigasi mobile; CTA; dan reduced motion. Perubahan request harian 100 → 200 menggandakan estimasi dengan rumus yang sama, dan pilihan model sama menyembunyikan panel penghematan.

Pemeriksaan UI tidak mengirim permintaan inferensi AI, membuat akun, melakukan top up, atau mengubah data server. Lint, Prettier, dan typecheck digunakan untuk verifikasi statis; test suite serta build produksi mengikuti persetujuan pengguna sesuai AGENTS.md.

## Berkas antarmuka

- Entry antarmuka: `app/(public)/ai-relay/client-view.tsx`.
- Komponen lokal: `relay-hero.tsx`, `relay-connection.tsx`, `relay-mini-mascot.tsx`, `relay-section-heading.tsx`, `relay-catalog.tsx`, `relay-model-table.tsx`, `relay-model-actions.tsx`, `relay-model-select.tsx`, `relay-quickstart.tsx`, `relay-range-field.tsx`, `relay-simulator.tsx`, dan `relay-cta.tsx` di `app/(public)/ai-relay/_components/`.
- Stylesheet lokal: `relay.module.css`, `relay-hero.module.css`, `relay-catalog.module.css`, serta `relay-tools.module.css` di folder komponen yang sama.
- Panel editor kode: `relay-code-window.tsx` dan `relay-code-window.module.css` di folder komponen yang sama.
- State dan konten: `app/(public)/ai-relay/_hooks/use-relay-showcase.ts` dan `app/(public)/ai-relay/_data/relay-content.ts`.
- Aktivasi chrome khusus rute: `app/(public)/_components/public-shell.tsx`, `public-shell.module.css`, `components/shared/navbar.tsx`, dan `studio-navbar.module.css`.
- Aset: dua WebP di `public/images/ai-relay/` yang dirinci di atas.
- Dokumentasi: panduan ini serta `docs/brand-context.md`.
