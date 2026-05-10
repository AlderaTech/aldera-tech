import {
  HeartHandshake,
  Rocket,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

export type AboutValue = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type TechStackItem = {
  name: string;
  category: string;
};

export const aboutValues: AboutValue[] = [
  {
    icon: Target,
    title: "Hasil, bukan hanya output",
    description:
      "Kami mengukur sukses dari dampak bisnis, bukan dari seberapa banyak fitur yang kami tulis.",
  },
  {
    icon: Sparkles,
    title: "Craft yang serius",
    description:
      "Kode bersih, dokumentasi rapi, dan ketelitian detail adalah standar minimum kami.",
  },
  {
    icon: HeartHandshake,
    title: "Transparansi radikal",
    description:
      "Dashboard langsung, pembaruan mingguan, dan bebas tanya kapan saja. Tidak ada pertanyaan bodoh.",
  },
  {
    icon: Rocket,
    title: "Kemitraan jangka panjang",
    description:
      "Kami bukan sekali jadi. Kami partner yang bisa Anda andalkan untuk iterasi bertahun-tahun.",
  },
];

export const techStack: TechStackItem[] = [
  { name: "Next.js", category: "Framework" },
  { name: "TypeScript", category: "Language" },
  { name: "React", category: "Library" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Prisma", category: "ORM" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "React Native", category: "Mobile" },
  { name: "Node.js", category: "Runtime" },
  { name: "AWS", category: "Cloud" },
  { name: "Figma", category: "Design" },
  { name: "Framer Motion", category: "Animation" },
  { name: "Docker", category: "DevOps" },
];
