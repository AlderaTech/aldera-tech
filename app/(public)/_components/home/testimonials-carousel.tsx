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
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
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
        <div className="-ml-5 flex">
          {items.map((t) => (
            <div key={t.id} className="w-full shrink-0 pl-5 sm:w-1/2 lg:w-1/3">
              <Card className="relative flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00B1E1]/40 hover:shadow-xl sm:p-7">
                <Quote
                  className="absolute top-6 right-6 size-7 text-[#00B1E1]/20"
                  aria-hidden
                />
                <div>
                  <div
                    className="mb-4 flex items-center gap-1"
                    aria-label={`${t.rating} dari 5 bintang`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < t.rating
                            ? "size-4 fill-[#00B1E1] text-[#00B1E1]"
                            : "size-4 text-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-slate-700">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <Avatar className="size-11 border border-slate-200">
                    {t.avatar ? (
                      <AvatarImage src={t.avatar} alt={t.clientName} />
                    ) : null}
                    <AvatarFallback className="bg-[#0F263A] text-xs font-bold text-white">
                      {getInitials(t.clientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-[#0F263A]">
                      {t.clientName}
                    </div>
                    {t.clientRole && (
                      <div className="truncate text-xs font-medium text-slate-500">
                        {t.clientRole}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-slate-200 bg-white text-[#0F263A] shadow-sm hover:border-[#00B1E1] hover:text-[#00B1E1]"
          onClick={() => embla?.scrollPrev()}
          disabled={!canPrev}
          aria-label="Testimoni sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-slate-200 bg-white text-[#0F263A] shadow-sm hover:border-[#00B1E1] hover:text-[#00B1E1]"
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
