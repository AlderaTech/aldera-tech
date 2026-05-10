import {
  Code2,
  Smartphone,
  Palette,
  Search,
  BrainCircuit,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  description: string;
  deliverables: string[];
};

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Pengembangan Web",
    icon: Code2,
    summary: "Website kustom yang cepat, siap SEO, dan mudah dikembangkan.",
    description:
      "Dari landing page hingga aplikasi web kompleks. Kami memakai Next.js, TypeScript, dan praktik modern agar website mudah ditemukan, nyaman dipakai, dan siap dirawat tim Anda.",
    deliverables: [
      "Landing page hingga SaaS kompleks",
      "Performance Core Web Vitals hijau",
      "Responsif dari layar kecil hingga besar",
      "Dokumentasi dan handoff lengkap",
    ],
  },
  {
    slug: "mobile-app",
    title: "Mobile App",
    icon: Smartphone,
    summary: "Aplikasi iOS dan Android dengan pengalaman pengguna yang jelas.",
    description:
      "Pengalaman setara aplikasi native dengan React Native. Satu basis kode, biaya lebih efisien, tanpa mengorbankan performa atau tampilan.",
    deliverables: [
      "iOS dan Android dari satu basis kode",
      "Deploy ke App Store & Play Store",
      "Notifikasi dan deep link",
      "Pemantauan setelah rilis",
    ],
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    icon: Palette,
    summary: "Desain yang bukan cuma cantik, tapi berstrategi.",
    description:
      "Riset pengguna, wireframe, prototype, hingga design system. Setiap keputusan visual punya alasan bisnis.",
    deliverables: [
      "Riset pengguna dan persona",
      "Wireframe dan prototype interaktif",
      "Design system dan handoff",
      "Usability testing",
    ],
  },
  {
    slug: "ecommerce",
    title: "E-Commerce",
    icon: ShoppingCart,
    summary: "Platform jualan online dengan konversi yang terukur.",
    description:
      "Storefront kustom dengan integrasi payment gateway, kurir, dan manajemen inventori. Aset digital milik Anda, bukan sewa.",
    deliverables: [
      "Storefront kustom dan CMS",
      "Integrasi Midtrans/Xendit/Stripe",
      "Manajemen pesanan dan inventori",
      "Otomasi email marketing",
    ],
  },
  {
    slug: "seo-optimization",
    title: "Optimasi SEO",
    icon: Search,
    summary: "Teknik + konten strategi untuk ranking yang bertahan.",
    description:
      "Audit SEO teknis, strategi konten, dan penguatan otoritas. Kami menargetkan kata kunci yang benar-benar mendatangkan pelanggan.",
    deliverables: [
      "Audit SEO teknis mendalam",
      "Riset kata kunci dan strategi",
      "Optimasi konten",
      "Laporan bulanan dan iterasi",
    ],
  },
  {
    slug: "consulting",
    title: "Konsultasi Teknologi",
    icon: BrainCircuit,
    summary: "Arsitektur, code review, dan guidance untuk tim internal.",
    description:
      "Punya tim sendiri tapi butuh sudut pandang kedua? Kami bantu review arsitektur, audit kode, dan memandu tim internal Anda.",
    deliverables: [
      "Review arsitektur dan rekomendasi",
      "Audit kode dan rencana refactor",
      "Pendampingan tim",
      "Peta jalan strategi teknologi",
    ],
  },
];
