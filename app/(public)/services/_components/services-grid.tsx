import React from "react";
import Image from "next/image";
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
import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import {
  services as fallbackServices,
  type Service as StaticService,
} from "@/lib/services-data";
import { cn } from "@/lib/utils";
import { getServiceArtwork } from "@/lib/service-artwork";
import shared from "../../_components/studio.module.css";
import styles from "./services.module.css";

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
    <section
      className={styles.servicesSection}
      id="pilihan-layanan"
      aria-labelledby="service-options-heading"
    >
      <div className={shared.container}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Pilihan Layanan</p>
            <h2 id="service-options-heading">
              Solusi untuk setiap tahap <span>digital.</span>
            </h2>
          </div>
          <p className={styles.sectionIntro}>
            Pilih layanan yang paling sesuai. Setiap kartu merangkum ruang
            lingkup pekerjaan dan jalur untuk meminta penawaran.
          </p>
        </div>

        <StaggerContainer className={styles.serviceGrid}>
          {items.map((service, index) => (
            <StaggerItem key={service.slug} className="h-full min-w-0">
              <ServiceCard
                service={service}
                index={index}
                featured={index === 0}
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
  index,
  featured,
}: {
  service: GridServiceItem | StaticService;
  index: number;
  featured: boolean;
}) {
  const artwork = getServiceArtwork(service.slug);

  return (
    <article
      className={cn(styles.serviceCard, featured && styles.serviceCardFeatured)}
    >
      <div className={styles.cardVisual} aria-hidden="true">
        <span className={styles.cardIndex}>
          {String(index + 1).padStart(2, "0")}
        </span>
        {artwork ? (
          <div className={styles.cardArtwork}>
            <Image
              src={artwork}
              alt=""
              fill
              sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 90vw"
              quality={90}
            />
          </div>
        ) : (
          <span className={styles.artFallback}>
            {React.createElement(resolveServiceIcon(service.icon), {
              strokeWidth: 1.5,
            })}
          </span>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeading}>
          <span className={styles.cardIcon} aria-hidden="true">
            {React.createElement(resolveServiceIcon(service.icon), {
              strokeWidth: 1.7,
            })}
          </span>
          <h3>{service.title}</h3>
        </div>
        <p className={styles.cardDescription}>{service.description}</p>

        <div className={styles.deliverables}>
          <h4>Ruang lingkup</h4>
          <ul>
            {service.deliverables.map((deliverable) => (
              <li key={deliverable}>
                <Check aria-hidden="true" />
                <span>{deliverable}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={PUBLIC_ROUTES.contactWithService(service.slug)}
          className={styles.cardLink}
        >
          Minta Penawaran
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
