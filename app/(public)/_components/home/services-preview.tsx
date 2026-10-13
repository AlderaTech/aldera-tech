import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/services-data";
import { PUBLIC_ROUTES } from "@/lib/routes";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";

const deliveryNotes = [
  "Scope jelas",
  "Board progres",
  "Review rutin",
  "Handoff rapi",
];

export function ServicesPreview() {
  const preview = services.slice(0, 6);
  return (
    <section className="editorial-ink">
      <div className="public-container-px mx-auto grid max-w-screen-xxxl items-center gap-5 py-14 sm:py-20 xl:grid-cols-[0.82fr_1.18fr]">
        <FadeUp className="flex flex-col">
          <div className="editorial-kicker border-white/20 text-white/64">
            Layanan
          </div>
          <h2 className="editorial-display mt-5 max-w-2xl text-4xl text-balance sm:text-5xl lg:text-6xl">
            Enam jalur layanan, satu sistem kerja.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
            Setiap layanan disusun seperti sprint produk: jelas cakupannya,
            terukur progresnya, dan rapi serah terimanya.
          </p>

          <div className="relative mt-6 hidden aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] xl:block">
            <Image
              src="/generated/solvo-tech/services-blue-suite.png"
              alt="Kolase mockup layanan web, mobile, dan e-commerce"
              fill
              sizes="(min-width: 1280px) 34vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {deliveryNotes.map((note) => (
              <span
                key={note}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white/78"
              >
                <CheckCircle2 className="size-3.5 text-[#61a3ff]" />
                {note}
              </span>
            ))}
          </div>

          <Button
            asChild
            variant="outline"
            className="mt-6 w-fit border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
          >
            <Link href={PUBLIC_ROUTES.services}>
              Lihat semua layanan
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </FadeUp>

        <StaggerContainer className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {preview.map((service, index) => (
            <StaggerItem key={service.slug}>
              <Link
                href={PUBLIC_ROUTES.contactWithService(service.slug)}
                className="group block h-full"
              >
                <Card
                  className={[
                    "h-full min-h-[132px] gap-0 rounded-xl p-4 text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl xl:min-h-[176px]",
                    index === 1 || index === 4
                      ? "border-[#0b6bff]/40 bg-[#0b6bff]"
                      : "editorial-card-dark",
                  ].join(" ")}
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={[
                          "flex size-10 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105",
                          index === 1 || index === 4
                            ? "border-white/20 bg-white text-[#0b6bff]"
                            : "border-white/10 bg-white/10 text-[#61a3ff]",
                        ].join(" ")}
                      >
                        <service.icon className="size-4.5" />
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-white/64 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-auto pt-5">
                      <h3 className="text-base leading-tight font-black xl:text-lg">
                        {service.title}
                      </h3>
                      <p
                        className={[
                          "mt-2 line-clamp-2 text-xs leading-relaxed",
                          index === 1 || index === 4
                            ? "text-white/76"
                            : "text-white/68",
                        ].join(" ")}
                      >
                        {service.summary}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
