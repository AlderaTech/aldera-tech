import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { FadeUp } from "@/components/shared/motion";
import styles from "../studio.module.css";
import {
  TestimonialsCarousel,
  type TestimonialCard,
} from "./testimonials-carousel";
import testimonialStyles from "./testimonials.module.css";

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
    <section className={testimonialStyles.section}>
      <div className={styles.container}>
        <FadeUp className={testimonialStyles.trustPanel}>
          <div className={testimonialStyles.trustCopy}>
            <p className={testimonialStyles.eyebrow}>
              <span aria-hidden="true">01</span>
              Kepercayaan Klien & Dampak Terukur
            </p>
            <div>
              <h3 className={testimonialStyles.trustHeading}>
                Founder, CTO, dan Pimpinan Produk
                <span>Memilih Aldera Tech</span>
              </h3>
              <p className={testimonialStyles.trustDescription}>
                Kami tidak sekadar menyerahkan kode, kami memastikan sistem
                beroperasi stabil, performa tinggi, dan menjadi fondasi
                pertumbuhan bisnis.
              </p>
            </div>
          </div>

          <div className={testimonialStyles.processCard}>
            <span className={testimonialStyles.processLabel}>Alur kerja</span>
            <div className={testimonialStyles.processSteps}>
              {[
                ["01", "Scope"],
                ["02", "Sprint"],
                ["03", "Rilis"],
              ].map(([number, step]) => (
                <span key={step} className={testimonialStyles.processStep}>
                  <span aria-hidden="true">{number}</span>
                  {step}
                </span>
              ))}
            </div>
            <div className={testimonialStyles.processLine} aria-hidden="true">
              <span />
            </div>
          </div>
        </FadeUp>

        <FadeUp className={testimonialStyles.sectionHeader}>
          <div className={testimonialStyles.headingBlock}>
            <p className={testimonialStyles.eyebrow}>
              <span aria-hidden="true">02</span>
              Cerita dari Mitra Kami
            </p>
            <h2 className={testimonialStyles.heading}>
              Apa Kata Mereka <span>Tentang Kami</span>
            </h2>
          </div>
          <p className={testimonialStyles.sectionDescription}>
            Dengar langsung pengalaman founder dan manajer teknologi yang telah
            bermitra dan mempercepat produk digital mereka bersama Aldera Tech.
          </p>
        </FadeUp>

        <TestimonialsCarousel items={items} />
      </div>
    </section>
  );
}
