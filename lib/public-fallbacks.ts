export type PublicCaseStudy = {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  challenge: string;
  solution: string;
  result: string;
  featuredImage: string | null;
  techStack: string[];
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  published: boolean;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  views: number;
  draftContent: string | null;
  draftSavedAt: Date | null;
  authorId: string;
  author: { name: string; avatar: string | null } | null;
  categoryId: string | null;
  category: { name: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

const fallbackDate = new Date("2026-03-18T09:00:00.000Z");

export const publicCaseStudies: PublicCaseStudy[] = [
  {
    id: "fallback-case-technova",
    slug: "technova-b2b-platform",
    title: "TechNova: Platform B2B yang Men-Triple Revenue",
    client: "TechNova Indonesia",
    industry: "B2B SaaS",
    summary:
      "Platform B2B enterprise dengan self-serve onboarding dan analytics yang mempercepat pipeline sales.",
    challenge:
      "TechNova mengelola proses onboarding enterprise secara manual. Tim sales sulit memprioritaskan lead, tim operasional bekerja dari spreadsheet terpisah, dan calon pelanggan tidak mendapat pengalaman self-serve yang konsisten.",
    solution:
      "Kami merancang platform B2B berbasis Next.js dengan onboarding mandiri, workflow approval, dashboard analytics, dan integrasi billing. Setiap milestone dikirim sebagai sprint kecil agar tim TechNova bisa memberi feedback tanpa menunggu fase besar selesai.",
    result:
      "Konversi demo ke trial naik 3x, waktu onboarding turun dari 10 hari menjadi 2 hari, dan tim leadership mendapat visibilitas funnel langsung untuk mengambil keputusan komersial lebih cepat.",
    featuredImage: "/generated/solvo-tech/portfolio/technova-b2b-platform.png",
    techStack: ["Next.js", "PostgreSQL", "Prisma", "Stripe"],
    published: true,
    order: 1,
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: "fallback-case-kopi-kita",
    slug: "kopi-kita-ecommerce",
    title: "Kopi Kita: E-Commerce yang Menggandakan Penjualan",
    client: "Kopi Kita",
    industry: "F&B E-Commerce",
    summary:
      "Storefront custom dengan checkout cepat, payment gateway, dan integrasi kurir untuk brand kopi lokal.",
    challenge:
      "Kopi Kita bergantung pada marketplace sehingga margin tipis, data pelanggan tersebar, dan promosi sulit dipersonalisasi. Checkout di kanal lama juga terlalu panjang untuk pembelian repeat order.",
    solution:
      "Kami membangun storefront mobile-first dengan katalog modular, checkout dua langkah, Midtrans, integrasi kurir, dan CMS promo. Sistem dibuat ringan agar campaign flash sale tetap cepat diakses dari mobile.",
    result:
      "Penjualan direct-to-consumer naik 2.1x dalam tiga bulan, repeat order meningkat 38%, dan tim marketing mulai menjalankan promo berbasis segmentasi pelanggan.",
    featuredImage: "/generated/solvo-tech/portfolio/kopi-kita-ecommerce.png",
    techStack: ["Next.js", "Prisma", "Midtrans", "Tailwind CSS"],
    published: true,
    order: 2,
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: "fallback-case-finsmart",
    slug: "finsmart-mobile-app",
    title: "FinSmart: Mobile App dengan 100K+ Download",
    client: "FinSmart",
    industry: "FinTech",
    summary:
      "Aplikasi finance personal dengan onboarding jelas, insight pengeluaran, dan rating 4.8 di store.",
    challenge:
      "FinSmart memiliki konsep kuat, tetapi pengguna baru sering berhenti sebelum menautkan data keuangan pertama. Tim produk juga belum punya sistem eksperimen untuk memahami titik drop-off.",
    solution:
      "Kami menyusun ulang onboarding, membangun design system mobile, menambahkan insight pengeluaran yang mudah dipindai, dan memasang analytics event untuk tiap langkah aktivasi.",
    result:
      "Aktivasi pengguna baru naik 52%, aplikasi mencapai 100K+ download, dan rating store stabil di 4.8 berkat pengalaman onboarding yang lebih jelas.",
    featuredImage: "/generated/solvo-tech/portfolio/finsmart-mobile-app.png",
    techStack: ["React Native", "TypeScript", "Firebase", "Recharts"],
    published: true,
    order: 3,
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

export const publicBlogPosts: PublicBlogPost[] = [
  {
    id: "fallback-blog-modern-website",
    slug: "kenapa-bisnis-anda-butuh-website-modern",
    title: "Kenapa Bisnis Anda Butuh Website Modern",
    excerpt:
      "Website bukan sekadar etalase digital. Ini mesin pertumbuhan 24/7 yang membantu calon pelanggan percaya, paham, lalu mengambil tindakan.",
    content: `
      <h2>Website modern bekerja seperti sales system</h2>
      <p>Website yang baik tidak hanya menampilkan profil perusahaan. Ia menjawab pertanyaan calon pelanggan, menunjukkan bukti kerja, dan mengarahkan orang ke aksi yang jelas.</p>
      <h2>Kecepatan memengaruhi trust</h2>
      <p>Halaman yang lambat membuat bisnis terlihat kurang siap. Dengan struktur konten yang padat, gambar yang dioptimasi, dan Core Web Vitals yang sehat, pengalaman pertama terasa jauh lebih profesional.</p>
      <h2>Konten harus mudah dipindai</h2>
      <p>Pengunjung jarang membaca semuanya dari awal sampai akhir. Mereka memindai judul, bukti sosial, harga, layanan, dan CTA. Karena itu struktur halaman perlu membantu mereka mengambil keputusan tanpa banyak friksi.</p>
      <h2>Website adalah aset yang bisa diukur</h2>
      <p>Dengan analytics, formulir yang benar, dan funnel yang rapi, website menjadi sumber data. Tim bisa melihat halaman mana yang bekerja, penawaran mana yang menarik, dan bagian mana yang perlu diperbaiki.</p>
    `,
    featuredImage: "/generated/solvo-tech/blog/modern-website-strategy.png",
    published: true,
    publishedAt: fallbackDate,
    scheduledAt: null,
    views: 1280,
    draftContent: null,
    draftSavedAt: null,
    authorId: "fallback-author-solvo",
    author: { name: "Solvo Admin", avatar: null },
    categoryId: "fallback-category-business",
    category: { name: "Business", slug: "business" },
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

export function getFallbackCaseStudy(slug: string) {
  return publicCaseStudies.find((item) => item.slug === slug) ?? null;
}

export function resolveCaseStudyImage(slug: string, image: string | null) {
  if (image && image !== "/logo.png") return image;
  return getFallbackCaseStudy(slug)?.featuredImage ?? image;
}

export function getFallbackBlogPost(slug: string) {
  return publicBlogPosts.find((item) => item.slug === slug) ?? null;
}

const blogImageBySlug: Record<string, string> = {
  "kenapa-bisnis-anda-butuh-website-modern":
    "/generated/solvo-tech/blog/modern-website-strategy.png",
  "next-js-16-apa-yang-baru":
    "/generated/solvo-tech/blog/nextjs-16-development.png",
  "micro-interactions-yang-meningkatkan-ux":
    "/generated/solvo-tech/blog/micro-interactions-ux.png",
};

export function resolveBlogPostImage(slug: string, image: string | null) {
  if (
    image &&
    image !== "/logo.png" &&
    !image.startsWith("/generated/solvo-tech/portfolio/")
  ) {
    return image;
  }
  return (
    blogImageBySlug[slug] ?? getFallbackBlogPost(slug)?.featuredImage ?? image
  );
}
