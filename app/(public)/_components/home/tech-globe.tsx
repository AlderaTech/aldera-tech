import Image from "next/image";
import globe from "@/public/images/hero/aldera-tech-globe.webp";
import { cn } from "@/lib/utils";
import styles from "./tech-globe.module.css";

export function TechGlobe({ className }: { className?: string }) {
  return (
    <div className={cn(styles.globe, className)} aria-hidden="true">
      <Image
        src={globe}
        alt=""
        fill
        sizes="(min-width: 640px) 160px, 136px"
        quality={90}
        className={styles.image}
      />
    </div>
  );
}
