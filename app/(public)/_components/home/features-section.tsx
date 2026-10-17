import {
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import styles from "../studio.module.css";
import featureStyles from "./features-section.module.css";

type ChallengeCard = {
  icon: LucideIcon;
  title: string;
  badge: string;
  items: string[];
};

const challengeCards: ChallengeCard[] = [
  {
    icon: Clock,
    title: "Siklus Rilis & Waktu",
    badge: "Kecepatan Eksekusi",
    items: [
      "Sprint terencana & deliverable jelas",
      "Estimasi milestone tepat waktu",
      "Tanpa bottleneck komunikasi",
    ],
  },
  {
    icon: Layers,
    title: "Arsitektur & Skalabilitas",
    badge: "Fondasi Sistem",
    items: [
      "Clean architecture modular",
      "Performa Core Web Vitals optimal",
      "Siap menangani jutaan request",
    ],
  },
  {
    icon: Code2,
    title: "Transparansi Biaya & Scope",
    badge: "Kepastian Investasi",
    items: [
      "Rincian scope transparan tanpa hidden fee",
      "Pelacakan jam kerja & commit real-time",
      "Revisi terstruktur & terkelola",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Kualitas Kode & Standar",
    badge: "Jaminan Mutu",
    items: [
      "100% Type-safe TypeScript & Next.js 16",
      "Audit keamanan & validasi Zod ketat",
      "Dokumentasi handoff menyeluruh",
    ],
  },
];

const deliverables = [
  "Brief & Prioritas Fitur Jelas",
  "Roadmap Sprint Mingguan",
  "Dashboard Progres Real-Time",
  "Dokumentasi & Handoff Rapi",
];

const cardLayouts = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
];

export function FeaturesSection() {
  return (
    <section
      className={cn(featureStyles.section, "font-jakarta")}
      aria-labelledby="digital-engineering-heading"
    >
      <div className={styles.container}>
        <FadeUp className={featureStyles.intro}>
          <div className={featureStyles.introCopy}>
            <p className={featureStyles.eyebrow}>
              <span aria-hidden="true">01</span>
              Cara Kami Merekayasa Produk Digital
            </p>
            <h2
              id="digital-engineering-heading"
              className={cn(
                styles.heading,
                featureStyles.heading,
                "text-balance"
              )}
            >
              Tantangan &amp; Solusi <span>Rekayasa Digital</span>
            </h2>
          </div>
          <p className={featureStyles.introDescription}>
            Apakah bisnis Anda ingin mempercepat rilis tanpa mengorbankan
            kualitas arsitektur dan stabilitas jangka panjang?
          </p>
        </FadeUp>

        <StaggerContainer className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-12 lg:gap-4">
          {challengeCards.map((card, index) => (
            <StaggerItem
              key={card.title}
              className={cn("h-full min-w-0", cardLayouts[index])}
            >
              <article
                className={cn(
                  styles.bentoCard,
                  featureStyles.challengeCard,
                  index === 0
                    ? featureStyles.cardRelease
                    : index === 2
                      ? featureStyles.cardScope
                      : featureStyles.cardNeutral,
                  "group flex h-full flex-col rounded-2xl border p-5 sm:p-6"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={featureStyles.challengeIcon}>
                    <card.icon
                      className="size-5"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    className={featureStyles.challengeIndex}
                    aria-hidden="true"
                  >
                    / 0{index + 1}
                  </span>
                </div>

                <div className="mt-4">
                  <div className={featureStyles.challengeBadge}>
                    {card.badge}
                  </div>
                  <h3 className={featureStyles.challengeTitle}>{card.title}</h3>
                </div>

                <ul className="mt-4 space-y-2.5">
                  {card.items.map((item) => (
                    <li key={item} className={featureStyles.challengeItem}>
                      <CheckCircle2
                        className={featureStyles.challengeCheck}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp delay={0.15} className={featureStyles.deliverablesWrap}>
          <div className={featureStyles.deliverablesGrid}>
            {deliverables.map((item) => (
              <div key={item} className={featureStyles.deliverable}>
                <div className={featureStyles.deliverableIcon}>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
