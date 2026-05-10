import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";

export type PublicTestimonial = {
  id: string;
  clientName: string;
  clientRole: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatar: string | null;
};

const fallbackTestimonials: PublicTestimonial[] = [
  {
    id: "1",
    clientName: "Andi Wijaya",
    clientRole: "CEO",
    company: "TechNova Indonesia",
    content:
      "Solvo Tech benar-benar mengerti visi kami. Dashboard yang transparan bikin saya selalu tahu progres tanpa harus chat berkali-kali.",
    rating: 5,
    avatar: null,
  },
  {
    id: "2",
    clientName: "Linda Kusuma",
    clientRole: "Founder",
    company: "Kopi Kita",
    content: "Tim profesional dan komunikatif. Semuanya on time dan on budget.",
    rating: 5,
    avatar: null,
  },
  {
    id: "3",
    clientName: "Ridho Pratama",
    clientRole: "Product Manager",
    company: "FinSmart",
    content: "Kualitas kode dan desainnya jempolan. Worth every rupiah.",
    rating: 5,
    avatar: null,
  },
];

export async function getPublicTestimonials() {
  return safeDb<PublicTestimonial[]>(async () => {
    const data = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        clientName: true,
        clientRole: true,
        company: true,
        content: true,
        rating: true,
        avatar: true,
      },
    });
    return data.length ? data : fallbackTestimonials;
  }, fallbackTestimonials);
}
