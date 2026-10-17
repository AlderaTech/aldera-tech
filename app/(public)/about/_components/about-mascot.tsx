import Image from "next/image";
import { Code2, HeartHandshake, Check } from "lucide-react";
import mascot from "@/public/images/about/aldera-cat-about.webp";
import { cn } from "@/lib/utils";
import styles from "./about.module.css";

export function AboutMascot() {
  return (
    <div className={styles.mascotStage}>
      <span className={styles.backdropWord} aria-hidden="true">
        OUR
        <br />
        STUDIO.
      </span>
      <svg
        className={styles.connection}
        viewBox="0 0 500 600"
        fill="none"
        aria-hidden="true"
      >
        <path d="M45 160H125L180 215M440 380H375L330 335M80 480H155L200 435" />
        <circle cx="45" cy="160" r="3" />
        <circle cx="440" cy="380" r="3" />
        <circle cx="80" cy="480" r="3" />
      </svg>
      <div className={styles.mascotShadow} aria-hidden="true" />
      <div className={styles.mascot}>
        <Image
          src={mascot}
          alt="Maskot kucing putih Aldera Tech membawa laptop dan membuka satu tangan untuk menyambut pengunjung, dengan kacamata hitam, headphone, serta hoodie putih bergaris merah-biru"
          fill
          sizes="(min-width: 1280px) 430px, (min-width: 1024px) 36vw, (min-width: 640px) 390px, 80vw"
          quality={90}
          className="object-contain"
          preload
        />
      </div>
      <div className={cn(styles.visualBadge, styles.engineeringBadge)}>
        <Code2 className="size-4" aria-hidden="true" />
        Engineering & Design
      </div>
      <div className={cn(styles.visualBadge, styles.partnerBadge)}>
        <HeartHandshake className="size-4" aria-hidden="true" />
        Partner teknologi Anda
      </div>
      <div className={styles.trustNote}>
        <span>
          <Check className="size-4" aria-hidden="true" />
        </span>
        <p>
          Transparansi
          <br />
          <strong>di setiap proses.</strong>
        </p>
      </div>
    </div>
  );
}
