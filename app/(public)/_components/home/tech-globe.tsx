import Image from "next/image";
import globe from "@/public/images/hero/aldera-tech-globe.webp";
import styles from "./tech-globe.module.css";

export function TechGlobe() {
  return (
    <div className={styles.globe} aria-hidden="true">
      <Image
        src={globe}
        alt=""
        fill
        sizes="(min-width: 1143px) 80px, (min-width: 800px) 7vw, 56px"
        quality={90}
        className={styles.image}
      />
    </div>
  );
}
