# UI Blog Aldera Tech

Halaman daftar `/blog` dan detail `/blog/[slug]` memakai tema studio Aldera Tech: Plus Jakarta Sans, navy, biru elektrik, biru es, putih, navbar kaca, dan footer slate. `PublicShell` serta `Navbar` mengaktifkan tampilan ini hanya pada kedua rute Blog. Styling halaman dibatasi oleh CSS Modules lokal.

## Daftar artikel

Hero dua kolom memuat judul dan deskripsi asli di kiri serta mini maskot membaca di kanan. Tinggi hero dibuat ringkas agar daftar artikel segera terlihat. Pada HP, maskot berukuran kecil berada setelah copy tanpa menutupi teks. Bagian daftar memakai judul, filter kategori, dan formulir pencarian GET dengan parameter `q`; kategori aktif mempertahankan kata kunci saat berpindah filter. Pagination mempertahankan parameter kategori dan pencarian, serta muncul ketika tersedia tautan sebelum atau berikutnya.

Artikel tetap berasal dari `getBlogList`, dalam urutan `publishedAt` menurun. Filter presentasional memastikan artikel fallback yang tidak cocok dengan kategori atau kata kunci tidak tampil sebagai hasil pencarian. Sumber data Blog tidak memiliki penanda artikel unggulan, sehingga seluruh item memakai kartu setara tanpa label popularitas. Kartu menampilkan gambar, kategori, judul, ringkasan, penulis, tanggal, waktu baca, dan tautan detail dari data asli. Thumbnail memakai rasio 16:10, `next/image`, ukuran responsif, dan lazy loading. Jika gambar kosong, kartu menampilkan ilustrasi buku berbasis CSS/ikon. Jika daftar kosong, tautan kembali ke semua artikel tersedia.

## Detail artikel

Halaman detail memakai heading sans-serif dengan ukuran responsif, ringkasan, metadata asli, gambar 16:9, dan area baca maksimal 68ch. Gaya HTML artikel mencakup heading, paragraf, daftar, kutipan, tautan, gambar, blok kode, dan tabel yang bisa digulir di dalam area kontennya. Daftar isi tetap memakai logika scroll spy yang sudah ada dan tampil di sisi artikel pada layar lebar. Panel CTA memakai gradasi biru-abu terang yang sejalan dengan tema halaman dan footer; tombol konsultasi tetap menuju `PUBLIC_ROUTES.contact`.

`loading.tsx` pada daftar dan detail menyediakan skeleton saat navigasi. `not-found.tsx` pada detail memberi jalan kembali ke Blog ketika slug tidak tersedia. Metadata SEO, JSON-LD, penghitung tampilan, pemilihan data, dan mekanisme pencarian server tidak diubah.

## Aset mini maskot

[aldera-cat-reading.webp](../public/images/blog/aldera-cat-reading.webp) adalah WebP transparan 450 × 675 piksel, 65.226 byte. Aset dibuat memakai tool bawaan **imagegen** dengan [maskot Tentang](../public/images/about/aldera-cat-about.webp) dan [mini maskot AI Relay](../public/images/ai-relay/aldera-cat-relay-connect.webp) sebagai referensi identitas, lalu diperkecil dan dikompresi menggunakan Sharp. Gambar dekoratif memakai alt kosong, `aria-hidden`, dan static import.

Prompt final:

```text
Use case: stylized-concept. Asset type: small transparent decorative mascot cutout for the Aldera Tech Blog hero. Input images: Image 1 and Image 2 are identity, clothing, proportion, and 3D material references only, not edit targets. Generate exactly ONE white Aldera cat with the same fluffy face, pink ears and nose, black sunglasses, oversized black/navy headphones with electric blue rings, sporty white hoodie and shorts with fine red and blue stripes, white navy sneakers. New pose: comfortably seated, slightly angled three-quarters, holding and reading a small open dark-navy book with both paws, friendly curious expression, entire head, ears, book, tail and footwear inside frame. Polished soft 3D studio render, restrained cool blue rim light, premium materials, compact readable silhouette suitable at 140-180 px. Genuine fully transparent alpha background; no backdrop, floor, environment, floating UI, letters, words, logos, other characters, or watermark. Preserve character identity very closely.
```
