# Ilustrasi layanan Beranda

## Aset aktif

| Properti   | Nilai                                                                              |
| ---------- | ---------------------------------------------------------------------------------- |
| File       | [aldera-digital-products.webp](../public/images/home/aldera-digital-products.webp) |
| Pemakai    | `ServicesShowcase` pada pengenalan layanan Beranda                                 |
| Generator  | Tool bawaan imagegen, mode generate, transparent background                        |
| Sumber     | PNG 1536 × 1024 dengan kanal alpha                                                 |
| Distribusi | WebP 1200 × 800, 162668 byte, quality 90, alpha quality 100                        |
| Optimasi   | Sharp, tanpa flatten; transparansi dipertahankan                                   |
| Visual     | Laptop putih/navy, aplikasi mobile, panel desain dan kode biru/cyan                |

Ilustrasi menyatu ke gradasi CSS biru muda/putih tanpa panel latar gambar. Bayangan dan tiga badge layanan dirender terpisah dalam komponen. Antarmuka di layar bersifat abstrak, tanpa angka atau klaim bisnis. Aset ini tidak menambahkan maskot; maskot utama tetap berada di hero.

Gambar dirender dengan Next Image memakai static import, `object-contain`, `sizes` responsif, kualitas 90, dan lazy loading. Animasi floating mengikuti `prefers-reduced-motion`. PNG asli disimpan oleh tool pembuat gambar; aplikasi hanya memakai WebP pada tautan di atas.

## Prompt final

```text
Use case: stylized-concept. Asset type: production transparent 3D illustration for the services introduction section of Aldera Tech, an Indonesian software engineering and digital studio. Primary request: a fresh, premium and visually compelling digital-product ecosystem that blends into a pale blue-white gradient website, with no rectangular image background. Subject: one beautifully designed open pearl-white laptop in a three-quarter isometric view, its screen showing a clean abstract light web dashboard with electric-blue modular interface cards; a sleek navy-and-white smartphone standing slightly in front on the right with a complementary blue mobile interface; two small floating frosted-glass UI panels, one with simple vector-design nodes and one with minimalist code-bracket geometry, connected subtly to the devices by a thin luminous blue curve. Compose all objects as one cohesive elegant product sculpture, with a clear visual hierarchy and generous breathing room. Style: polished high-end 3D studio render, precise device proportions, soft rounded materials, satin white metal, deep navy trim, translucent blue glass, carefully controlled reflections, crisp edges and rich but restrained detail. Palette: pure white, soft slate, deep navy #102651, electric blue #245FE5 and a restrained cyan glow. Lighting: soft white key light with subtle cool-blue rim lighting and natural ambient occlusion. Composition: landscape 3:2 canvas, entire subject centered, all devices and panels fully visible with 8 percent transparent margin, no object clipped; broad flowing silhouette suitable for the right column of a professional landing page. Background must be genuine transparent alpha with no solid white rectangle, no environmental scene, no wall, no backdrop card, no floor plane, no baked opaque gradient or halo. All interface shapes are abstract: no readable text, letters, numbers, currency, percentages, logos, fake metrics or brand marks. No cat, no person, no mascot, no extra devices, no busy particles, no watermark. The final image should feel refined and useful for a serious software house, with the laptop and phone as the unmistakable focus.
```
