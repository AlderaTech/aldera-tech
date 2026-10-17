# Ilustrasi kartu halaman Layanan

## Aset aktif

Halaman `/services` dan kartu layanan Beranda memakai seri ilustrasi 3D yang sama. Aset dibuat dengan tool bawaan `imagegen`, mode generate, lalu dikonversi menggunakan Sharp menjadi WebP transparan 1200 × 800, kualitas 90 dan alpha kualitas 100. Tidak ada latar gambar yang dipanggang ke aset, tulisan, angka, logo, atau klaim hasil bisnis.

| Aset                                                               | Layanan                                                               |       Ukuran |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- | -----------: |
| [web.webp](../public/images/services/cards/web.webp)               | `web-development` — Pengembangan Web dan Web Application Engineering  | 132.608 byte |
| [mobile.webp](../public/images/services/cards/mobile.webp)         | `mobile-app` — Mobile App                                             | 137.764 byte |
| [design.webp](../public/images/services/cards/design.webp)         | `ui-ux-design` — UI/UX Design                                         | 148.098 byte |
| [commerce.webp](../public/images/services/cards/commerce.webp)     | `ecommerce` — E-Commerce                                              | 145.688 byte |
| [seo.webp](../public/images/services/cards/seo.webp)               | `seo-optimization` — Optimasi SEO                                     | 123.188 byte |
| [consulting.webp](../public/images/services/cards/consulting.webp) | `consulting` — Konsultasi Teknologi                                   | 192.890 byte |
| [cloud.webp](../public/images/services/cards/cloud.webp)           | `enterprise-cloud-devops` — Enterprise Cloud & DevOps                 | 172.218 byte |
| [ai.webp](../public/images/services/cards/ai.webp)                 | `ai-machine-learning-solutions` — AI & Machine Learning Solutions     | 294.676 byte |
| [quality.webp](../public/images/services/cards/quality.webp)       | `maintenance-quality-engineering` — Maintenance & Quality Engineering | 146.370 byte |

## Pemakaian

Pemetaan bersama berada di `lib/service-artwork.ts` berdasarkan slug, bukan urutan kartu. Slug aktif dari database dan slug data cadangan sama-sama didukung di Beranda dan halaman Layanan. Kategori tambahan tanpa ilustrasi khusus tetap memakai ikon dari data layanan.

`ServicesGrid` mempertahankan nama, deskripsi, rincian, urutan, status aktif, dan tautan `PUBLIC_ROUTES.contactWithService(slug)` dari data yang tersedia. Gambar bersifat dekoratif (`alt=""` di dalam `aria-hidden`) sehingga teks kartu menjadi sumber nama layanan. `next/image` memakai static import, lazy loading, `fill`, `object-fit: contain`, `sizes` responsif, dan kualitas 90. Panggung ilustrasi mempunyai tinggi atau aspek rasio tetap untuk mencegah perubahan tata letak saat gambar dimuat.

## Prompt final

Setiap aset dibuat melalui satu panggilan `imagegen` dengan `transparent_background: true`. Prompt lengkap per aset adalah prompt dasar berikut, diikuti subjek sesuai bagiannya.

### Prompt dasar

```text
Use case: stylized-concept. Asset type: one production-quality service card artwork in a coordinated six-image collection for Aldera Tech, a premium Indonesian software house. Create a NEW image, not a recolor or copy. Style: polished editorial 3D product sculpture, crafted like a high-end technology campaign, precisely modeled devices, sophisticated cinematic studio lighting, impeccable sharp edges and material realism, pearly satin white metal, deep navy #102651, cobalt/electric blue #245FE5, small touches of translucent cyan glass; restrained reflections and natural soft shadow integrated into the object. Composition: landscape 3:2, tightly composed but entire object group visible with 6% clear margin, striking focal silhouette, legible at 360px card width. Genuine transparent alpha background, no rectangular panel or environmental backdrop, no baked opaque halo, no checkerboard, no floor. Interfaces may contain only clean abstract geometries; no readable text, numbers, logos, slogans, currency, people, cats, mascots, or watermarks.
```

### Pengembangan Web dan Web Application Engineering — web.webp

```text
Subject — WEB DEVELOPMENT: An exquisite open pearl-white aluminum laptop angled three-quarters to show a bright multilayered website on its display, with a rich navy header and airy abstract blue-and-white interface modules. A slim code editor pane made of cyan glass floats partly in front of the laptop's RIGHT side, with a stylized bracket glyph and a few short non-letter glowing strokes. A narrow secondary browser layer stands behind to convey a robust web platform. The laptop screen is the obvious focal point, presented as an aspirational finished product. Avoid smartphones and shopping carts.
```

### Mobile App — mobile.webp

```text
Subject — MOBILE APP DEVELOPMENT: A single striking high-fidelity pearl-white smartphone held upright at a graceful 25-degree angle, showing an abstract cobalt and white mobile app interface with polished card-based navigation, a content preview, and a bottom tab bar; a slimmer second dark-navy phone behind it shows a complementary blue-on-navy app view. Three tiny floating cyan app tiles curve around the devices like a restrained orbit to suggest connected features. Phones are full-scale premium product hardware with believable glass and metal; make the front phone the compelling focal point. Avoid laptops, shopping, and SEO icons.
```

### UI/UX Design — design.webp

```text
Subject — UI/UX PRODUCT DESIGN: A large premium floating interface design board in pearl-white glass with airy composition grid, blue rounded components and wireframe layout. A navy stylus curves in the foreground beside an elegant luminous electric-blue Bezier path with exactly three visible control nodes, while two small stacked material swatches in navy and ice blue imply a design system. Let the board and pen read instantly as hands-on product design. Avoid laptops, mobile phones, shopping imagery, portraits, and readable tool labels.
```

### E-Commerce — commerce.webp

```text
Subject — E-COMMERCE: A premium pearl-white floating storefront kiosk/browser showing a curated abstract product grid with three blue-white item silhouettes; in front, a sculpted navy and blue shopping bag with elegant loop handles and one small package box, plus a compact translucent checkout card showing only a simple embossed check symbol and an abstract payment card with no numbers. Compose these into one coherent luxury commerce sculpture, with the storefront as the anchor and recognizable shopping object in foreground. Avoid laptops, phones, readable labels or price tags.
```

### Optimasi SEO — seo.webp

```text
Subject — SEARCH ENGINE OPTIMIZATION: A beautifully modeled oversized deep navy magnifying glass with luminous cobalt and cyan glass lens hovering in front of a pristine pearl-white browser results panel. The panel contains an abstract search field and three neat graphical result rows with blue shapes only, no letters. On the far side, three gently rising translucent blue bars and a thin upward curve suggest discoverability without implying specific metrics. Give the magnifier bold scale and a strong diagonal; make the whole sculpture immediately recognizable at card size. Avoid text, numeric claims, laptops, smartphones and shopping imagery.
```

### Konsultasi Teknologi — consulting.webp

```text
Subject — TECHNOLOGY CONSULTING: A distinct premium three-dimensional systems architecture sculpture: a floating pearl-white blueprint board angled three-quarters, with four elegant navy/cobalt rounded modules linked by fine luminous cyan pathways, a small stack of translucent cloud infrastructure blocks to one side and one polished compass-like strategy disc in front. The composition should communicate architecture planning, technology guidance and interconnected systems at a glance, with the board as the clear focal object and controlled blue glows. Avoid laptops, phones, web browser frames, robot heads, AI brains, human hands, readable text or performance metrics.
```

### Enterprise Cloud & DevOps — cloud.webp

```text
Subject — ENTERPRISE CLOUD & DEVOPS: A richly detailed cloud infrastructure sculpture, with a luminous translucent cobalt cloud hovering above three stacked pearl-white and dark-navy server units, a few tiny cyan glass deployment blocks moving along a clean curved connection rail and subtle linked nodes on a compact glass base. The servers and cloud are the unmistakable focal point. This should look like scalable production architecture and an elegant deployment pipeline; keep geometry realistic and neatly composed for a service card. Avoid laptops, human figures, robots, readable labels, flames, giant arrows, and charts.
```

### AI & Machine Learning Solutions — ai.webp

```text
Subject — AI & MACHINE LEARNING SOLUTIONS: A tasteful abstract machine-learning system represented by a premium navy microprocessor at the center of an elegant three-dimensional network of translucent cyan and cobalt glass nodes. Fine luminous arcs connect 8 to 12 nodes in layered depth; two small pearl-white data cards float below and beside the chip with entirely abstract blocks and no markings. Subtle intelligent flow and model inference without literal human face, brain or robot. Make the chip and organized neural network read as sophisticated engineering, not magic or science-fiction clutter. Avoid brains, robot heads, people, laptops, smartphones, text, numbers and infinity symbols.
```

### Maintenance & Quality Engineering — quality.webp

```text
Subject — MAINTENANCE & QUALITY ENGINEERING: A premium pearl-white application window mounted on a layered navy and blue technical testing platform, with a bold dimensional cobalt shield enclosing a clean white check mark as the focal point. A small thin scanning ring and connected modular test blocks suggest quality checks and dependable ongoing maintenance; include one subtle navy gear incorporated into the platform, no broken parts. Compose as a precise elegant reliability sculpture, clear at service-card scale. Avoid magnifying glasses, search fields, rankings, laptops, phones, readable text or numbers, humanoid characters and robots.
```
