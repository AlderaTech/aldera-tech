import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { FadeUp } from "@/components/shared/motion";
import {
  TestimonialsCarousel,
  type TestimonialCard,
} from "./testimonials-carousel";

const fallback: TestimonialCard[] = [
  {
    id: "fb-1",
    clientName: "Andi Wijaya",
    clientRole: "CEO",
    company: "TechNova Indonesia",
    content:
      "Solvo Tech benar-benar mengerti visi kami. Dashboard transparan bikin saya selalu tahu progres tanpa chat berkali-kali.",
    rating: 5,
    avatar: null,
  },
  {
    id: "fb-2",
    clientName: "Linda Kusuma",
    clientRole: "Founder",
    company: "Kopi Kita",
    content:
      "Tim profesional dan komunikatif. Dari discovery sampai rilis, semuanya tepat waktu dan sesuai anggaran.",
    rating: 5,
    avatar: null,
  },
  {
    id: "fb-3",
    clientName: "Ridho Pratama",
    clientRole: "Product Manager",
    company: "FinSmart",
    content:
      "Kualitas kode dan desainnya sangat baik. Investasinya terasa sepadan.",
    rating: 5,
    avatar: null,
  },
];

export async function TestimonialsSection() {
  const items = await safeDb<TestimonialCard[]>(
    async () => {
      const data = await prisma.testimonial.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        take: 9,
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
      return data.length ? data : fallback;
    },
    fallback,
  );

  return (
    <section className="editorial-ink">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-14 sm:py-20">
        <FadeUp className="mb-10 grid gap-5 lg:grid-cols-[0.85fr_1fr] lg:items-end">
          <div>
            <div className="editorial-kicker border-white/20 text-white/55">
            Testimoni
            </div>
            <h2 className="editorial-display mt-5 text-4xl text-balance sm:text-5xl lg:text-6xl">
              Bukti kerja dari bisnis yang sudah rilis.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-white/58 lg:justify-self-end">
            Bisnis-bisnis yang telah mempercayakan transformasi digital mereka
            ke Solvo Tech.
          </p>
        </FadeUp>
        <TestimonialsCarousel items={items} />
      </div>
    </section>
  );
}
