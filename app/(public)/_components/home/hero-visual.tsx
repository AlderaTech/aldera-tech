import Image from "next/image";
import { ArrowUpRight, Code2, Smartphone } from "lucide-react";
import mascot from "@/public/images/hero/aldera-cat-hero.webp";
import globe from "@/public/images/hero/aldera-tech-globe.webp";
import { cn } from "@/lib/utils";
import styles from "./hero-composition.module.css";

export function HeroVisual() {
  return (
    <div className={styles.scene}>
      <p className={styles.wordmark} aria-hidden="true">
        ALDERA TECH
      </p>
      <svg
        className={styles.connections}
        viewBox="0 0 1200 520"
        fill="none"
        aria-hidden="true"
      >
        <path d="M130 320H300L430 195H525M1060 160H925L800 305H710M215 440H360L460 345" />
        <circle cx="130" cy="320" r="4" />
        <circle cx="525" cy="195" r="4" />
        <circle cx="1060" cy="160" r="4" />
        <circle cx="710" cy="305" r="4" />
        <circle cx="215" cy="440" r="4" />
      </svg>
      <div className={styles.mascot}>
        <Image
          src={mascot}
          alt="Maskot kucing putih Aldera Tech berkacamata hitam, memakai headphone, hoodie putih, celana pendek, dan sneakers"
          fill
          quality={90}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 340px, 78vw"
          className="object-contain"
          preload
        />
      </div>
      <aside className={styles.insight}>
        <div className={styles.insightIcon} aria-hidden="true">
          <Image
            src={globe}
            alt=""
            fill
            sizes="64px"
            quality={90}
            className="object-contain"
          />
        </div>
        <p>
          Ide besar.
          <br />
          <strong>Fondasi digital yang tepat.</strong>
        </p>
        <span>Web, aplikasi, dan pengalaman yang saling terhubung.</span>
      </aside>
      <div className={styles.mockupStack} aria-hidden="true">
        <div className={styles.mockupBack} />
        <div className={styles.mockupWindow}>
          <div className={styles.windowBar}>
            <i />
            <i />
            <i />
            <span>aldera.tech / studio</span>
          </div>
          <div className={styles.mockupImage}>
            <Image
              src="/images/services/services-suite.webp"
              alt=""
              fill
              sizes="280px"
              quality={90}
              className="object-cover"
            />
          </div>
        </div>
        <span className={styles.previewCaption}>
          Digital products, thoughtfully built.{" "}
          <ArrowUpRight className="size-3" />
        </span>
      </div>
      <div className={cn(styles.serviceBadge, styles.webBadge)}>
        <Code2 className="size-4" aria-hidden="true" />
        Web Development
      </div>
      <div className={cn(styles.serviceBadge, styles.mobileBadge)}>
        <Smartphone className="size-4" aria-hidden="true" />
        Mobile Apps
      </div>
      <div className={cn(styles.serviceBadge, styles.designBadge)}>
        <span aria-hidden="true" className={styles.badgeDot} />
        UI/UX Design
      </div>
    </div>
  );
}
