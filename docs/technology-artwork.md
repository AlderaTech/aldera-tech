# Ilustrasi Teknologi Aldera Tech

Enam aset dekoratif untuk bagian teknologi halaman Tentang, dibuat menggunakan tool bawaan `imagegen`. Sumber generasi disimpan oleh tool; aplikasi memakai salinan WebP portabel di `public/images/about/technology/`. Tidak ada dependensi layanan gambar eksternal saat runtime.

Semua aset berukuran 768×768, WebP kualitas 90 dengan alpha kualitas 100. Material, sudut pandang, dan pencahayaan mengikuti satu arahan visual: putih, navy, kaca biru muda, serta aksen biru elektrik. Gambar tidak memuat klaim, label, maupun logo teknologi. Nama teknologi tetap dirender dari data aplikasi.

| Aset                                                           |      Ukuran | Bidang           |
| -------------------------------------------------------------- | ----------: | ---------------- |
| [web.webp](../public/images/about/technology/web.webp)         |  85966 byte | Frontend         |
| [backend.webp](../public/images/about/technology/backend.webp) |  86440 byte | Backend          |
| [mobile.webp](../public/images/about/technology/mobile.webp)   |  83980 byte | Mobile           |
| [cloud.webp](../public/images/about/technology/cloud.webp)     | 107462 byte | Cloud dan DevOps |
| [design.webp](../public/images/about/technology/design.webp)   |  74106 byte | UI/UX            |
| [ai.webp](../public/images/about/technology/ai.webp)           | 104688 byte | AI/LLM           |

Pemetaan enam kategori tampilan tersedia pada `app/(public)/about/_constants/tech-stack-artwork.ts`, dengan tipe `TechStackCategory`. Label sumber digabung melalui `_utils/group-tech-stack.ts` sebelum pemilihan ilustrasi, sehingga setiap kategori memakai satu aset sesuai bidangnya. Semua gambar bersifat dekoratif (`alt=""`, wrapper `aria-hidden`), dimuat secara lazy, dan memakai `next/image` dengan ukuran responsif.

## Prompt final

Setiap aset dihasilkan melalui satu panggilan terpisah. Prompt lengkap adalah arahan umum berikut yang disambung dengan subjek masing-masing aset.

### Arahan umum

```text
Use case: stylized-concept. Asset type: individual transparent 3D editorial illustration for the technology capabilities section of Aldera Tech, a professional software house and digital studio. Style: premium enterprise product illustration, refined isometric 3D render, realistic polished white ceramic, matte midnight navy, frosted translucent pale blue glass, restrained electric blue details. Clean architectural geometry, sophisticated precise edges, soft studio key light from upper left, realistic ambient occlusion and subtle reflected light. One cohesive object composition centered on a square canvas, occupies 78 percent with clear margin on all sides, slight elevated three-quarter view, balanced silhouette readable at 160px. Genuinely transparent background with alpha, no environment, no floor plane, no opaque glow or backdrop. No words, letters, digits, labels, brand logos, mascots, people or watermark. Not a whole website screenshot, not an emoji, not a flat vector.
```

### web

```text
Subject: a floating desktop browser window in frosted blue glass with a white navigation strip and beautifully arranged abstract interface blocks, layered above a slim midnight navy laptop base. One small electric blue code-bracket shaped solid object beside it. The screen contains only geometric wireframe blocks and subtle blue bars, no readable text. Precise premium software product scene.
```

### backend

```text
Subject: two offset compact midnight navy server towers with elegant white side panels, small cyan status lights, and one stacked frosted glass database cylinder linked by a short precise blue connector. Sculptural secure data infrastructure, clean and premium, no busy wires.
```

### mobile

```text
Subject: two slim modern smartphones arranged at contrasting gentle three-quarter angles, front device white with deep navy frame and abstract electric-blue app cards on the screen, second device behind it in frosted pale-blue glass. One small rounded blue app tile floating nearby. Clear refined mobile software composition.
```

### cloud

```text
Subject: a sculptural white ceramic cloud floating above three neat navy and frosted-blue modular infrastructure cubes on a subtle layered glass platform, connected by elegant thin blue routing lines. One tiny metallic electric-blue sphere as an endpoint. Restrained enterprise cloud infrastructure illustration.
```

### design

```text
Subject: two overlapping floating UI design artboards in white ceramic and frosted blue glass, featuring clean geometric layout blocks, rounded blue buttons and a small color palette of navy, pale blue and white. A sophisticated midnight navy stylus sits diagonally beside the boards. Precise professional interface-design composition, not cluttered.
```

### ai

```text
Subject: a translucent pale-blue glass cube enclosing a sculptural white neural network of a few connected nodes, levitating just above a compact midnight navy processor chip with refined electric-blue circuitry edges. Controlled subtle cyan light inside the glass, clean elegant AI infrastructure composition.
```
