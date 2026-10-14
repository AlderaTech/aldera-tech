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
    clientRole: "CEO & Founder",
    content:
      "Aldera Tech benar-benar mengerti visi bisnis kami. Dashboard transparan membuat kami selalu tahu progres dan milestone tanpa chat berulang kali.",
    rating: 5,
    avatar: null,
  },
  {
    id: "fb-2",
    clientName: "Linda Kusuma",
    clientRole: "Head of Product",
    content:
      "Tim sangat profesional dan terstruktur. Dari discovery sampai rilis, deliverable tepat waktu dan arsitektur kodenya sangat bersih.",
    rating: 5,
    avatar: null,
  },
  {
    id: "fb-3",
    clientName: "Ridho Pratama",
    clientRole: "Chief Technology Officer",
    content:
      "Standar engineering-nya tinggi. Testing rapi, Core Web Vitals hijau semua, dan tim in-house kami sangat mudah melanjutkan codebase-nya.",
    rating: 5,
    avatar: null,
  },
];

export async function TestimonialsSection() {
  const items = await safeDb<TestimonialCard[]>(async () => {
    const data = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 9,
      select: {
        id: true,
        clientName: true,
        clientRole: true,
        content: true,
        rating: true,
        avatar: true,
      },
    });
    return data.length ? data : fallback;
  }, fallback);

  return (
    <section className="border-t border-slate-100 bg-white py-16 sm:py-24">
      <div className="public-container-px mx-auto max-w-screen-xxxl">
        {/* High-Contrast Stat Callout Inspired by Reference */}
        <FadeUp className="mb-16 overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F8FAFC] p-8 shadow-sm lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
            <div>
              <div className="mb-4 h-1.5 w-12 rounded-full bg-[#00B1E1]" />
              <div className="text-xs font-bold tracking-wider text-[#00B1E1] uppercase">
                Kepercayaan Klien & Dampak Terukur
              </div>
              <h3 className="mt-2 font-serif text-2xl font-bold text-[#0F263A] sm:text-3xl lg:text-4xl">
                Founder, CTO, dan Pimpinan Produk Memilih Aldera Tech
              </h3>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Kami tidak sekadar menyerahkan kode, kami memastikan sistem
                beroperasi stabil, performa tinggi, dan menjadi fondasi
                pertumbuhan bisnis.
              </p>
            </div>

            {/* Massive Display Serif Stat */}
            <div className="flex flex-col items-start rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:min-w-[240px] lg:items-center lg:p-8">
              <span className="font-serif text-6xl font-black text-[#0F263A] lg:text-7xl">
                98%
              </span>
              <span className="mt-2 text-center text-xs font-bold tracking-wider text-slate-500 uppercase">
                Klien Repeat & Retensi
              </span>
            </div>
          </div>
        </FadeUp>

        {/* Testimonials Header */}
        <FadeUp className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <div>
            <div className="mb-4 h-1.5 w-12 rounded-full bg-[#00B1E1]" />
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-[#0F263A] sm:text-4xl lg:text-5xl">
              Apa Kata Mereka Tentang Kami
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 lg:justify-self-end">
            Dengar langsung pengalaman founder dan manajer teknologi yang telah
            bermitra dan mempercepat produk digital mereka bersama Aldera Tech.
          </p>
        </FadeUp>

        <TestimonialsCarousel items={items} />
      </div>
    </section>
  );
}
