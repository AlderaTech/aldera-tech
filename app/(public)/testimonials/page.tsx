import type { Metadata } from "next";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { TestimonialsGrid } from "./_components/testimonials-grid";
import { TestimonialsHero } from "./_components/testimonials-hero";
import { getPublicTestimonials } from "./_data/testimonials";

export const metadata: Metadata = {
  title: "Testimoni",
  description: "Cerita dari klien yang sudah bekerja dengan Solvo Tech.",
  alternates: { canonical: PUBLIC_ROUTES.testimonials },
};

export default async function TestimonialsPage() {
  const items = await getPublicTestimonials();

  return (
    <>
      <TestimonialsHero count={items.length} />
      <TestimonialsGrid testimonials={items} />
    </>
  );
}
