import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import type { Service } from "@/lib/services-data";

type ServicesGridProps = {
  services: Service[];
};

export function ServicesGrid({ services }: ServicesGridProps) {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-14 sm:py-20">
        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <StaggerItem key={service.slug}>
              <ServiceCard service={service} featured={index === 1 || index === 4} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  featured,
}: {
  service: Service;
  featured: boolean;
}) {
  return (
    <Card
      className={
        featured
          ? "group h-full gap-0 rounded-xl border-[#0b6bff]/40 bg-[#0b6bff] p-6 text-white transition-all hover:-translate-y-1 hover:shadow-xl lg:p-8"
          : "editorial-card group h-full gap-0 rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl lg:p-8"
      }
    >
      <div
        className={
          featured
            ? "mb-5 flex size-14 items-center justify-center rounded-lg border border-white/20 bg-white text-[#0b6bff] transition-transform group-hover:scale-105"
            : "mb-5 flex size-14 items-center justify-center rounded-lg border border-black/10 bg-white/80 text-[#0b6bff] transition-transform group-hover:scale-105"
        }
      >
        <service.icon className="size-7" />
      </div>
      <h2 className="mb-2 text-2xl font-black">{service.title}</h2>
      <p
        className={
          featured
            ? "mb-5 text-sm leading-relaxed text-white/72"
            : "mb-5 text-sm leading-relaxed text-black/62"
        }
      >
        {service.description}
      </p>
      <ul className="mb-6 space-y-2">
        {service.deliverables.map((deliverable) => (
          <li key={deliverable} className="flex items-start gap-2 text-sm">
            <Check
              className={
                featured
                  ? "mt-0.5 size-4 shrink-0 text-white"
                  : "mt-0.5 size-4 shrink-0 text-[#0b6bff]"
              }
            />
            <span>{deliverable}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant={featured ? "default" : "outline"}
        className={
          featured
            ? "w-full bg-black text-white hover:bg-black/90 group/btn"
            : "w-full border-black/15 bg-white/70 group/btn"
        }
      >
        <Link href={PUBLIC_ROUTES.contactWithService(service.slug)}>
          Minta Penawaran
          <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </Button>
    </Card>
  );
}
