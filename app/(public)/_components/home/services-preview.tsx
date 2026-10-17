import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Smartphone,
  Cloud,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Search,
  ShoppingCart,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { services } from "@/lib/services-data";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { cn } from "@/lib/utils";
import { ServicePreviewCard } from "./service-preview-card";
import shared from "../studio.module.css";
import styles from "./services-preview.module.css";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";

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
};

function resolveServiceIcon(icon: string | LucideIcon | undefined): LucideIcon {
  if (typeof icon === "function") return icon;
  if (typeof icon === "string" && iconMap[icon]) return iconMap[icon];
  return Code2;
}

const deliveryNotes = [
  "Scope Terencana",
  "Board Progres Transparan",
  "Review Rutin Mingguan",
  "Handoff Kode Rapi",
];

type PreviewItem = {
  slug: string;
  title: string;
  summary: string;
  icon: LucideIcon;
};

export async function ServicesPreview() {
  const fallbackItems: PreviewItem[] = services.slice(0, 6).map((item) => ({
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    icon: item.icon,
  }));

  const preview = await safeDb<PreviewItem[]>(async () => {
    const data = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 6,
    });
    if (!data || data.length === 0) {
      return fallbackItems;
    }
    return data.map((item) => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      icon: resolveServiceIcon(item.icon),
    }));
  }, fallbackItems);
  return (
    <section
      className={styles.section}
      aria-labelledby="services-preview-heading"
    >
      <div className={shared.container}>
        <FadeUp className={styles.header}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              <Layers className="size-3.5" aria-hidden="true" />
              Keahlian studio
            </p>
            <h2 id="services-preview-heading" className={styles.heading}>
              Enam Jalur Layanan, <span>Satu Standar Rekayasa.</span>
            </h2>
          </div>
          <div className={styles.overview}>
            <p className={styles.description}>
              Setiap layanan dirancang seperti sprint produk: terukur
              cakupannya, jelas timeline pengerjaannya, dan rapi serah
              terimanya.
            </p>
            <Link
              href={PUBLIC_ROUTES.services}
              className={cn(shared.outlineLink, styles.allServices)}
            >
              Lihat Semua Layanan
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>

        <StaggerContainer className={styles.grid}>
          {preview.map((service, index) => (
            <StaggerItem key={service.slug} className={styles.cardWrap}>
              <ServicePreviewCard service={service} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp className={styles.delivery}>
          <p className={styles.deliveryHeading}>
            <ShieldCheck className="size-4" aria-hidden="true" />
            Standar di setiap layanan
          </p>
          <ul className={styles.deliveryNotes}>
            {deliveryNotes.map((note) => (
              <li key={note}>
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}
