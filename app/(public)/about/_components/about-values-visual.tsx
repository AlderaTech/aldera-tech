import Image from "next/image";
import foundation from "@/public/images/about/aldera-values-foundation.webp";
import styles from "./about-values.module.css";

export function AboutValuesVisual({ count }: { count: number }) {
  return (
    <div className={styles.visual} aria-hidden="true">
      <span className={styles.visualCount}>
        {String(count).padStart(2, "0")}
      </span>
      <span className={styles.visualOrbit} />
      <span className={styles.visualShadow} />
      <div className={styles.visualObject}>
        <Image
          src={foundation}
          alt=""
          fill
          quality={90}
          sizes="(min-width: 1280px) 440px, (min-width: 1024px) 38vw, (min-width: 768px) 300px, 260px"
          className={styles.visualImage}
        />
      </div>
      <div className={styles.visualSignature}>
        <span />
        {count} prinsip, satu cara kerja.
      </div>
    </div>
  );
}
