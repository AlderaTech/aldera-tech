import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import type { PublicTestimonial } from "../_data/testimonials";
import { TestimonialCard } from "./testimonial-card";

type TestimonialsGridProps = {
  testimonials: PublicTestimonial[];
};

export function TestimonialsGrid({ testimonials }: TestimonialsGridProps) {
  return (
    <section className="editorial-ink">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-14 sm:py-20">
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
