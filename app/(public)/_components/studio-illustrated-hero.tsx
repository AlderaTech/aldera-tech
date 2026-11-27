import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import shared from "./studio.module.css";
import styles from "./studio-illustrated-hero.module.css";

type StudioIllustratedHeroProps = {
  headingId: string;
  label: string;
  title: ReactNode;
  description: string;
  illustration: StaticImageData;
  children: ReactNode;
  note?: string;
  panelTitle: string;
  panel: ReactNode;
};

export function StudioIllustratedHero({
  headingId,
  label,
  title,
  description,
  illustration,
  children,
  note,
  panelTitle,
  panel,
}: StudioIllustratedHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby={headingId}>
      <div className={cn(shared.container, styles.layout)}>
        <div className={styles.copy}>
          <p className={shared.heroKicker}>{label}</p>
          <h1 id={headingId}>{title}</h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>{children}</div>
          {note && <p className={styles.note}>{note}</p>}
        </div>

        <div className={styles.stage}>
          <div className={styles.panel}>
            <h2>{panelTitle}</h2>
            {panel}
          </div>
          <div className={styles.artwork} aria-hidden="true">
            <Image
              src={illustration}
              alt=""
              fill
              sizes="(min-width: 1200px) 242px, (min-width: 900px) 20vw, (min-width: 640px) 180px, 35vw"
              quality={90}
              preload
            />
          </div>
        </div>
      </div>
    </section>
  );
}
