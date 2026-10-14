import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import type { PublicTestimonial } from "../_data/testimonials";

type TestimonialCardProps = {
  testimonial: PublicTestimonial;
};

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="editorial-card-dark relative h-full gap-0 rounded-xl p-6 text-white transition-all hover:-translate-y-1">
      <Quote
        aria-hidden
        className="absolute top-4 right-4 size-6 text-[#0b6bff]/30"
      />
      <div className="mb-3 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={
              index < testimonial.rating
                ? "size-4 fill-[#0b6bff] text-[#0b6bff]"
                : "size-4 text-white/20"
            }
          />
        ))}
      </div>
      <p className="mb-5 text-sm leading-relaxed text-white/70">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <div className="flex items-center gap-3 border-t border-white/10 pt-4">
        <Avatar className="size-10">
          {testimonial.avatar ? (
            <AvatarImage
              src={testimonial.avatar}
              alt={testimonial.clientName}
            />
          ) : null}
          <AvatarFallback className="bg-[#0b6bff] text-xs text-white">
            {getInitials(testimonial.clientName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">
            {testimonial.clientName}
          </div>
          {testimonial.clientRole && (
            <div className="truncate text-xs text-white/64">
              {testimonial.clientRole}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
