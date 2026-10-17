import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { HeroVisual } from "./hero-visual";
import shared from "../studio.module.css";
import styles from "./hero-composition.module.css";

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={shared.container}>
        <p className={styles.kicker}>Software Engineering & Digital Studio</p>
        <HeroVisual />
        <FadeUp className={styles.heroCopy}>
          <Link
            href={PUBLIC_ROUTES.contact}
            className={cn(shared.blueButton, styles.startButton)}
          >
            Mulai Proyek <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <h1 id="home-heading">
            BANGUN IDE.
            <br />
            WUJUDKAN SOLUSI DIGITAL.
          </h1>
          <p>
            Teknologi yang dirancang dengan tujuan. Pengalaman digital yang
            berarti.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
