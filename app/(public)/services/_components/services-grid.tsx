import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  Smartphone,
  Cloud,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Search,
  ShoppingCart,
  Layers,
  Globe,
  Server,
  Cpu,
  Terminal,
  Database,
  Zap,
  Box,
  Boxes,
  Shield,
  GitBranch,
  Layout,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import {
  services as fallbackServices,
  type Service as StaticService,
} from "@/lib/services-data";

const iconMap: Record<string, LucideIcon> = {
  Code2,
  Smartphone,
  Cloud,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Search,
  ShoppingCart,
  Layers,
  Globe,
  Server,
  Cpu,
  Terminal,
  Database,
  Zap,
  Box,
  Boxes,
  Shield,
  GitBranch,
  Layout,
  BookOpen,
  Sparkles,
};

function resolveServiceIcon(icon: string | LucideIcon | undefined): LucideIcon {
  if (typeof icon === "function") return icon;
  if (typeof icon === "string" && iconMap[icon]) return iconMap[icon];
  return Code2;
}

export type GridServiceItem = {
  id?: string;
  slug: string;
  title: string;
  icon: string | LucideIcon;
  summary?: string;
  description: string;
  deliverables: string[];
  order?: number;
  active?: boolean;
};

type ServicesGridProps = {
  services?: (GridServiceItem | StaticService)[];
};

export async function ServicesGrid({ services }: ServicesGridProps = {}) {
  let items = services;
  if (!items || items.length === 0) {
    items = await safeDb(async () => {
      const data = await prisma.service.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      });
      return data && data.length > 0 ? data : fallbackServices;
    }, fallbackServices);
  }

  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-14 sm:py-20">
        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((service, index) => (
            <StaggerItem key={service.slug}>
              <ServiceCard
                service={service}
                featured={index === 1 || index === 4}
              />
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
  service: GridServiceItem | StaticService;
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
        {React.createElement(resolveServiceIcon(service.icon), { className: "size-7" })}
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
            ? "group/btn w-full cursor-pointer bg-black text-white hover:bg-black/90"
            : "group/btn w-full cursor-pointer border-black/15 bg-white/70"
        }
      >
        <Link
          href={PUBLIC_ROUTES.contactWithService(service.slug)}
          className="cursor-pointer"
        >
          Minta Penawaran
          <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </Button>
    </Card>
  );
}
