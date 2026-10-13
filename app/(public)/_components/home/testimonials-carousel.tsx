"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export type TestimonialCard = {
  id: string;
  clientName: string;
  clientRole: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatar: string | null;
};

export function TestimonialsCarousel({ items }: { items: TestimonialCard[] }) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(true);

  const onSelect = React.useCallback(() => {
    if (!embla) return;
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  React.useEffect(() => {
    if (!embla) return;
    // Subscribe first, then let embla emit initial state to avoid a
    // synchronous setState during the effect body.
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    // Sync initial values on next microtask.
    const timer = setTimeout(onSelect, 0);
    return () => {
      clearTimeout(timer);
      embla.off("select", onSelect);
      embla.off("reInit", onSelect);
    };
  }, [embla, onSelect]);

  if (!items.length) return null;

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="-ml-4 flex">
          {items.map((t) => (
            <div
              key={t.id}
              className="w-full shrink-0 pl-4 xxxl:w-1/4 sm:w-1/2 lg:w-1/3"
            >
              <Card className="editorial-card-dark relative h-full gap-0 rounded-xl p-6 text-white transition-all duration-200 hover:-translate-y-1">
                <Quote
                  className="absolute top-4 right-4 size-6 text-[#0b6bff]/30"
                  aria-hidden
                />
                <div
                  className="mb-3 flex items-center gap-0.5"
                  aria-label={`${t.rating} dari 5 bintang`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < t.rating
                          ? "size-4 fill-[#0b6bff] text-[#0b6bff]"
                          : "size-4 text-white/20"
                      }
                    />
                  ))}
                </div>
                <p className="mb-5 min-h-20 text-sm leading-relaxed text-white/72">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <Avatar className="size-10">
                    {t.avatar ? (
                      <AvatarImage src={t.avatar} alt={t.clientName} />
                    ) : null}
                    <AvatarFallback className="bg-[#0b6bff] text-xs text-white">
                      {getInitials(t.clientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {t.clientName}
                    </div>
                    <div className="truncate text-xs text-white/64">
                      {[t.clientRole, t.company].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          onClick={() => embla?.scrollPrev()}
          disabled={!canPrev}
          aria-label="Testimoni sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          onClick={() => embla?.scrollNext()}
          disabled={!canNext}
          aria-label="Testimoni berikutnya"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
