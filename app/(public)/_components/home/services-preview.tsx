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
  "Scope Terencana",
  "Board Progres Transparan",
  "Review Rutin Mingguan",
  "Handoff Kode Rapi",
];

export function ServicesPreview() {
  const preview = services.slice(0, 6);
  return (
    <section className="bg-[#0F263A] py-16 text-white sm:py-24">
      <div className="public-container-px mx-auto grid max-w-screen-xxxl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] xl:gap-14">
        <FadeUp className="flex flex-col">
          <div className="h-1.5 w-12 rounded-full bg-[#00B1E1]" />
          <h2 className="mt-5 font-serif text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Enam Jalur Layanan, Satu Standar Rekayasa.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
            Setiap layanan dirancang seperti sprint produk: terukur cakupannya,
            jelas timeline pengerjaannya, dan rapi serah terimanya.
          </p>

          <div className="relative mt-8 hidden aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl xl:block">
            <Image
              src="/images/services/services-suite.webp"
              alt="Kolase mockup layanan web, mobile, dan e-commerce Aldera Tech"
              fill
              sizes="(min-width: 1280px) 34vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {deliveryNotes.map((note) => (
              <span
                key={note}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-slate-200"
              >
                <CheckCircle2 className="size-3.5 text-[#00B1E1]" />
                {note}
              </span>
            ))}
          </div>

          <Button
            asChild
            size="xl"
            className="mt-8 w-fit rounded-full bg-[#00B1E1] px-8 font-bold text-[#0F263A] shadow-lg shadow-[#00B1E1]/20 transition-all hover:bg-[#0094BD]"
          >
            <Link href={PUBLIC_ROUTES.services}>
              Lihat Semua Layanan
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </FadeUp>

        <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {preview.map((service, index) => (
            <StaggerItem key={service.slug}>
              <Link
                href={PUBLIC_ROUTES.contactWithService(service.slug)}
                className="group block h-full"
              >
                <Card
                  className={[
                    "h-full min-h-[140px] gap-0 rounded-2xl p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl xl:min-h-[180px]",
                    index === 1 || index === 4
                      ? "border-[#00B1E1]/50 bg-gradient-to-br from-[#0F263A] to-[#1A3B54]"
                      : "border-white/10 bg-white/[0.04] hover:border-[#00B1E1]/30 hover:bg-white/[0.08]",
                  ].join(" ")}
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={[
                          "flex size-11 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105",
                          index === 1 || index === 4
                            ? "border-[#00B1E1]/40 bg-[#00B1E1]/15 text-[#00B1E1]"
                            : "border-white/10 bg-white/10 text-[#00B1E1]",
                        ].join(" ")}
                      >
                        <service.icon className="size-5" />
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#00B1E1]" />
                    </div>
                    <div className="mt-auto pt-5">
                      <h3 className="font-serif text-lg font-bold text-white">
                        {service.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">
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
