# Ilustrasi layanan di Beranda

Enam kartu `ServicesPreview` memakai ilustrasi yang sama dengan halaman Layanan. Aset WebP transparan berukuran 1200 × 800 tersimpan di [`public/images/services/cards/`](../public/images/services/cards/). Pemetaan slug aktif database dan data cadangan berada di [`lib/service-artwork.ts`](../lib/service-artwork.ts), sehingga gambar tetap sesuai saat urutan layanan berubah. Layanan baru tanpa gambar khusus menampilkan ikon dari data layanan.

| Layanan                 | Slug yang didukung                               | Ilustrasi                                                          |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| Web                     | `web-application-engineering`, `web-development` | [web.webp](../public/images/services/cards/web.webp)               |
| Aplikasi mobile         | `mobile-app-development`, `mobile-app`           | [mobile.webp](../public/images/services/cards/mobile.webp)         |
| UI/UX                   | `ui-ux-product-design`, `ui-ux-design`           | [design.webp](../public/images/services/cards/design.webp)         |
| Cloud dan DevOps        | `enterprise-cloud-devops`                        | [cloud.webp](../public/images/services/cards/cloud.webp)           |
| AI dan machine learning | `ai-machine-learning-solutions`                  | [ai.webp](../public/images/services/cards/ai.webp)                 |
| Maintenance dan quality | `maintenance-quality-engineering`                | [quality.webp](../public/images/services/cards/quality.webp)       |
| E-commerce              | `ecommerce`                                      | [commerce.webp](../public/images/services/cards/commerce.webp)     |
| SEO                     | `seo-optimization`                               | [seo.webp](../public/images/services/cards/seo.webp)               |
| Konsultasi              | `consulting`                                     | [consulting.webp](../public/images/services/cards/consulting.webp) |

`ServicePreviewCard` mempertahankan judul, ringkasan, dan tujuan tautan `PUBLIC_ROUTES.contactWithService(slug)`. Query aktif, urutan, serta batas enam kartu tidak berubah. Gambar dekoratif memakai `alt=""` di dalam `aria-hidden`, `next/image` dengan static import dan `sizes` responsif; teks kartu tetap menjadi nama aksesibel tautan. Grid satu kolom di HP, dua di tablet, tiga di desktop, lalu membentuk mozaik 5/4/3 dan 3/4/5 kolom mulai 1280px. Efek hover mengikuti `prefers-reduced-motion`.

Spesifikasi aset dan prompt pembuatan berada di [dokumentasi ilustrasi halaman Layanan](service-page-artwork.md).
