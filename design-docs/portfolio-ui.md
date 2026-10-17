# Antarmuka Portofolio Publik

Halaman daftar `/portfolio` dan seluruh detail `/portfolio/[slug]` memakai tema studio Aldera Tech yang sama dengan Beranda, Tentang, dan Layanan: gradasi biru muda ke putih, teks navy, aksen biru, navbar kaca, dan footer studio. Tema diaktifkan untuk pathname `PUBLIC_ROUTES.portfolio` serta turunannya; halaman publik lain mempertahankan tampilan masing-masing.

## Sumber data dan tautan

`PortfolioPage` memanggil `getPortfolioItems()` satu kali, lalu memberikan hasilnya ke `PortfolioHero` dan `PortfolioGrid`. Query Prisma untuk studi kasus terpublikasi, urutan, resolver gambar, serta fallback di `_data/portfolio.ts` tetap menjadi sumber data. Hero memilih paling banyak dua item pertama yang memiliki `featuredImage`; panel kiri dan kanan memuat gambar proyek secara terpisah dari maskot. Setiap panel dan kartu grid menuju `PUBLIC_ROUTES.portfolioDetail(item.slug)`. Tautan konsultasi menuju `PUBLIC_ROUTES.contact` dan tautan jelajah menuju `#daftar-proyek`.

Grid mempertahankan semua item terpublikasi, termasuk item tanpa thumbnail. Kartu menampilkan industri, klien, judul, ringkasan, dan maksimal tiga teknologi dari data aktif. Komponen `PortfolioImage` menampilkan fallback visual ketika gambar kosong atau gagal dimuat, tanpa mengubah data proyek. Tidak ada filter atau pagination pada halaman daftar saat ini.

Studi kasus Medikare memakai ilustrasi konsep dashboard rumah sakit dan telekonsultasi pada `public/images/portfolio/medikare-hospital.webp`, mengikuti `featuredImage` yang tersedia pada data proyek. Spesifikasi, referensi gaya, dan prompt tercatat pada [medikare-artwork.md](medikare-artwork.md).

## Halaman detail studi kasus

- Seluruh slug memakai komponen bersama di `portfolio/[slug]/_components/`. `getPortfolioItem`, `getPortfolioStaticParams`, `resolveCaseStudyImage`, metadata, async params, dan penanganan `notFound` tetap menjadi alur data yang sama.
- Hero menampilkan tombol kembali ke daftar, industri, judul asli, ringkasan, dan nama klien. Pada desktop teks berada di kiri dan pratinjau proyek di kanan; di bawah 1024px susunannya menjadi vertikal dengan teks terlebih dahulu. Gambar memakai `object-fit: contain` pada bidang berasio tetap agar aset tetap utuh. Jika tidak ada sumber gambar, hero memakai satu kolom.
- `PortfolioFeaturedImage` berada di dalam hero dan memakai `PortfolioImage` bersama. Properti `preload` opsional bernilai `false` secara default sehingga kartu daftar tetap memakai lazy loading; gambar hero detail mengaktifkannya. Gambar yang gagal dimuat memakai fallback yang sama.
- Tantangan, Solusi, dan Hasil dirender dalam tiga kartu dengan isi lengkap dari data. Kartu Hasil memakai gradasi biru es ke slate. Seluruh teknologi proyek ditampilkan dalam panel samping yang sticky pada desktop, kemudian berada setelah cerita pada layar kecil.
- CTA penutup memakai panel biru keabu-abuan, copy konsultasi yang tersedia, tombol `PUBLIC_ROUTES.contact`, dan tautan `PUBLIC_ROUTES.portfolio`. Tombol kembali dan CTA memiliki fokus keyboard; gerak masuk dan transisi mengikuti `prefers-reduced-motion`.
- Styling detail dibatasi pada `portfolio-detail.module.css`. Pemeriksaan keluarga rute pada `PublicShell` dan `Navbar` mengaktifkan navbar serta footer studio untuk seluruh detail tanpa mengubah routing atau halaman di luar Portofolio.

## Maskot dan komposisi

- Aset: [aldera-cat-portfolio.webp](../public/images/portfolio/aldera-cat-portfolio.webp), WebP transparan 900 × 1350, 191.578 byte.
- Maskot memakai karakter kucing putih Aldera Tech yang sama: kacamata hitam, headphone navy bercahaya biru, hoodie dan celana pendek putih bergaris merah-biru, serta sneakers yang serasi.
- Judul asli "Proyek yang kami banggakan" dirender sebagai satu `h1` solid di belakang maskot. Maskot tampil utuh dalam satu lapisan gambar, tanpa teks di depannya. Deskripsi dan tombol jelajah berada di bawah visual.
- Padding atas dan jarak antarteks dibuat ringkas. Tinggi maskot dan bidang visual menyesuaikan tinggi viewport melalui `svh` agar tombol jelajah terlihat pada layar desktop umum dan HP. Pada HP dengan tinggi maksimal 700px, tinggi maskot serta jarak teks dipadatkan lagi. Jarak deskripsi, tombol jelajah, dan baris penutup memakai ritme vertikal yang rapat.
- Dua panel proyek berada di sisi kiri dan kanan dengan sedikit rotasi perspektif, tanpa panel yang menutupi tubuh maskot. Di bawah 1024px panel samping disembunyikan; maskot dan judul tetap di tengah, sementara seluruh proyek tetap tersedia pada grid di bawah hero.
- `next/image` memakai static import untuk maskot, `preload` untuk visual hero utama, `sizes` responsif, dan gambar proyek memakai `object-fit: contain` agar tidak terdistorsi. Gerak masuk memakai komponen bersama; transisi hover dimatikan untuk `prefers-reduced-motion`.

## Prompt aset maskot

Tool bawaan `imagegen` digunakan dalam mode generate dengan dua aset maskot sebagai referensi identitas: `public/images/hero/aldera-cat-hero.webp` dan `public/images/services/aldera-cat-services.webp`. Prompt final:

```text
Use case: stylized-concept. Transparent Aldera Tech portfolio hero mascot cutout. Preserve the exact same white 3D cat identity and style shown in the two reference images: black sunglasses, large navy headphones with electric-blue rings, white hoodie and white shorts with red-blue stripes, white navy red sneakers. New front-facing pose, full-body, friendly and confident, with BOTH paws extended forward at lower chest level and cupped UPWARD, left paw at left side and right paw at right side, leaving a broad open horizontal space between them to hold a real portfolio preview board that will be overlaid separately in CSS. No board or screens generated. Clean precise edges and premium studio 3D lighting. Genuine transparent background, no text, logo, other character or backdrop.
```

Gambar keluaran dikonversi ke WebP dengan Sharp, kualitas 90 dan kualitas alpha 100. Screenshot proyek tidak digabungkan ke aset maskot.
