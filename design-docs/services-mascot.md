# Maskot halaman Layanan

## Aset aktif

| Properti            | Nilai                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Aset                | [aldera-cat-services.webp](../public/images/services/aldera-cat-services.webp)                                         |
| Pemakai             | `ServicesHero` pada halaman Layanan                                                                                    |
| Referensi identitas | [Beranda](../public/images/hero/aldera-cat-hero.webp) dan [Tentang Kami](../public/images/about/aldera-cat-about.webp) |
| Pembuatan           | Tool bawaan `imagegen`, dengan dua aset referensi dan output alpha transparan                                          |
| Resolusi            | 1024 × 1536 piksel                                                                                                     |
| Distribusi          | WebP 217.608 byte, kualitas 90, alpha kualitas 100; konversi menggunakan Sharp tanpa flatten                           |
| Pose                | Membawa laptop terbuka dan menunjuk panel antarmuka untuk menjelaskan solusi digital                                   |

Karakter mempertahankan bulu putih, bentuk wajah dan proporsi, kacamata hitam, headphone hitam beraksen biru, hoodie dan celana pendek putih bergaris merah-biru, ekor, serta sneakers yang sama dengan maskot Beranda dan Tentang Kami. Laptop dan satu panel antarmuka abstrak menjadi properti ilustrasi; keduanya tidak menampilkan data klien, harga, statistik, atau klaim bisnis.

## Penyajian

- Gambar berada di kiri teks pada desktop, serta setelah teks pada tablet dan mobile.
- `next/image` memakai static import, `fill`, `object-fit: contain`, preload, kualitas 90, dan `sizes` responsif 400px/360px/75vw.
- Ukuran panggung yang sudah ditetapkan menjaga layout tetap stabil saat gambar dimuat.
- Badge Web Development, UI/UX Design, dan Mobile Apps tetap berupa elemen HTML; posisinya menghindari wajah dan panel laptop, dengan susunan lebih rendah pada mobile.
- Bayangan, garis koneksi, dan animasi floating memakai CSS halaman Layanan; `prefers-reduced-motion: reduce` menonaktifkan floating.
- Perubahan aset dan styling dibatasi pada hero Layanan. Tujuan CTA serta data layanan memakai integrasi yang sudah tersedia.

## Prompt final

```text
Use case: identity-preserve / stylized-concept.
Asset type: transparent full-body 3D mascot cutout for the Services hero of Aldera Tech.
Input images: Image 1 is the established Homepage character identity reference; Image 2 is the About page identity and material reference. They show the SAME cat, not two different characters. Create ONE new pose of this exact existing character, retaining its recognizable face, head-to-body proportions, plush white fur, triangular ears with pink interiors, pink nose, soft friendly smile, black glossy rectangular sunglasses, black over-ear headphones with electric-blue rings, white cotton hoodie with red and royal-blue stripes down the shoulders and sleeves, white drawstrings and pocket, white cargo shorts with matching stripes, fluffy curled tail, and chunky white sneakers with navy/blue/red accents.
Primary request: a confident friendly digital-solutions advisor, standing in a relaxed three-quarter front view. One paw supports a thin open navy laptop at waist level, with its screen tilted slightly toward the viewer; the other paw points naturally at a small translucent cyan interface panel floating just above the laptop, as if explaining a solution to a customer. Keep the paws anatomically coherent and the pose distinct from the greeting and closed-laptop About poses. The cat's face must remain entirely unobstructed.
Technology details: just ONE small floating blue-glass interface panel with abstract modular UI blocks and a discreet code bracket symbol, next to the laptop, below shoulder level. No other characters, screens, badges, large objects, lettering, statistics, logos or scenery.
Style: match the reference's premium 3D render, realistic fine white fur, soft knit cloth, crisp sneaker details, restrained blue edge lighting, bright soft studio key light, polished but natural materials. This is the same mascot in a new pose, not a redesign. Do not add headset microphones, change clothing, change glasses, enlarge eyes, or introduce new colors.
Composition: portrait 2:3, full body including ears, tail, laptop, panel and both shoes fully visible, around 6 percent clear padding, no cropping. Subject centered for display in the left column of a two-column hero with text on the right.
Background: genuinely TRANSPARENT ALPHA. No opaque white rectangle, no baked gradient, no grid, no halo or floor plane. Preserve clean transparent fur edges. No watermark.
```
