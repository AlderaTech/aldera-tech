import { PUBLIC_ROUTES } from "@/lib/routes";

export type NavLink = {
  href: string;
  label: string;
  description?: string;
};

export const publicNavLinks: NavLink[] = [
  { href: PUBLIC_ROUTES.home, label: "Beranda" },
  { href: PUBLIC_ROUTES.about, label: "Tentang" },
  { href: PUBLIC_ROUTES.services, label: "Layanan" },
  { href: PUBLIC_ROUTES.portfolio, label: "Portfolio" },
  { href: PUBLIC_ROUTES.pricing, label: "Harga" },
  { href: PUBLIC_ROUTES.blog, label: "Blog" },
  { href: PUBLIC_ROUTES.contact, label: "Kontak" },
];

export const footerSections: { title: string; links: NavLink[] }[] = [
  {
    title: "Perusahaan",
    links: [
      { href: PUBLIC_ROUTES.about, label: "Tentang Kami" },
      { href: PUBLIC_ROUTES.services, label: "Layanan" },
      { href: PUBLIC_ROUTES.portfolio, label: "Portfolio" },
    ],
  },
  {
    title: "Sumber Daya",
    links: [
      { href: PUBLIC_ROUTES.blog, label: "Blog" },
      { href: PUBLIC_ROUTES.testimonials, label: "Testimoni" },
      { href: PUBLIC_ROUTES.faq, label: "FAQ" },
      { href: PUBLIC_ROUTES.pricing, label: "Harga" },
    ],
  },
  {
    title: "Kontak",
    links: [
      { href: PUBLIC_ROUTES.contact, label: "Hubungi Kami" },
    ],
  },
];
