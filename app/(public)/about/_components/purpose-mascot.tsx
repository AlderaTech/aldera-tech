import Image from "next/image";
import { Target } from "lucide-react";
import mascot from "@/public/images/about/aldera-cat-vision.webp";
import styles from "./purpose-mascot.module.css";

export function PurposeMascot() {
  return (
    <div className={styles.stage}>
      <span className={styles.orbit} aria-hidden="true" />
      <svg
        className={styles.directionPath}
        viewBox="0 0 480 440"
        fill="none"
        aria-hidden="true"
      >
        <path d="M30 345H90C120 345 135 325 135 295V230C135 200 155 180 185 180H280C310 180 330 160 330 130V80H435M414 60L435 80L414 100" />
        <circle cx="30" cy="345" r="4" />
        <circle cx="280" cy="180" r="4" />
        <circle cx="330" cy="80" r="4" />
      </svg>
      <span className={styles.shadow} aria-hidden="true" />
      <div className={styles.portrait}>
        <Image
          src={mascot}
          alt="Maskot kucing putih Aldera Tech berkacamata dan headphone, melangkah percaya diri sambil menunjuk ke arah depan dengan tangan lainnya di pinggang"
          fill
          quality={90}
          sizes="(min-width: 1024px) 420px, (min-width: 640px) 360px, 280px"
          className={styles.image}
        />
      </div>
      <div className={styles.directionBadge}>
        <span>
          <Target className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </span>
        Berorientasi hasil
      </div>
    </div>
  );
}
