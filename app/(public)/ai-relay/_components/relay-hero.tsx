import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  KeyRound,
  Radio,
  Terminal,
} from "lucide-react";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { AUTH_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/shared/motion";
import shared from "../../_components/studio.module.css";
import { RelayConnection } from "./relay-connection";
import base from "./relay.module.css";
import styles from "./relay-hero.module.css";

const FEATURES = [
  {
    icon: KeyRound,
    title: "Satu API Key, banyak model",
    description: "Akses model global melalui satu endpoint kompatibel OpenAI.",
  },
  {
    icon: CreditCard,
    title: "Rupiah & QRIS lokal",
    description:
      "Top up saldo dengan pembayaran lokal tanpa kartu kredit luar negeri.",
  },
  {
    icon: Terminal,
    title: "Terhubung ke IDE favorit",
    description:
      "Preset untuk Cursor, Cline, Roo Code, Continue, dan OpenWebUI.",
  },
  {
    icon: Radio,
    title: "Respons dengan streaming",
    description:
      "Upstream relay aggregator mendukung alur respons token streaming.",
  },
];

export function RelayHero({ models }: { models: ModelCatalogItem[] }) {
  return (
    <section className={styles.hero} aria-labelledby="relay-heading">
      <div className={shared.container}>
        <div className={styles.heroGrid}>
          <FadeUp className={styles.heroCopy}>
            <p className={base.eyebrow}>
              <span aria-hidden="true" />
              AI Relay / Aldera Tech
            </p>
            <h1 id="relay-heading">
              Akses model AI dunia.
              <br />
              <span>Pembayaran Rupiah & QRIS lokal.</span>
            </h1>
            <p className={styles.description}>
              Satu API Key terpadu untuk model AI global. Tanpa perlu kartu
              kredit luar negeri, bayar instan pakai Rupiah & QRIS dengan
              transparansi biaya per token.
            </p>
            <div className={styles.actions}>
              <Link href={AUTH_ROUTES.register} className={shared.blueButton}>
                Mulai Sekarang — Daftar Gratis
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={AUTH_ROUTES.login} className={shared.outlineLink}>
                Masuk ke Portal
              </Link>
            </div>
            <p className={styles.heroNote}>
              <span aria-hidden="true" />
              Multi-model. Satu koneksi. Bayar sesuai pemakaian.
            </p>
          </FadeUp>
          <FadeUp delay={0.1} className="min-w-0">
            <RelayConnection models={models} />
          </FadeUp>
        </div>
        <div className={styles.features}>
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className={styles.feature}>
              <div className={styles.featureTop}>
                <span>
                  <Icon
                    className="size-5"
                    aria-hidden="true"
                    strokeWidth={1.6}
                  />
                </span>
                <small aria-hidden="true">0{index + 1}</small>
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <div
          className={cn(base.divider, styles.heroDivider)}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
