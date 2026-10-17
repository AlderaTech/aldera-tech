import Image from "next/image";
import { Code2, PenTool, Smartphone } from "lucide-react";
import digitalProducts from "@/public/images/home/aldera-digital-products.webp";
import { cn } from "@/lib/utils";
import styles from "./services-intro.module.css";

export function ServicesShowcase() {
  return (
    <div className={styles.composition}>
      <div className={styles.groundShadow} aria-hidden="true" />
      <div className={styles.artwork}>
        <Image
          src={digitalProducts}
          alt="Ilustrasi 3D laptop dan aplikasi mobile dengan panel desain serta kode bernuansa biru-putih"
          fill
          sizes="(min-width: 1280px) 620px, (min-width: 768px) 49vw, (min-width: 640px) 580px, 94vw"
          quality={90}
          className={styles.image}
        />
      </div>
      <span className={cn(styles.serviceBadge, styles.webBadge)}>
        <Code2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Web Development
      </span>
      <span className={cn(styles.serviceBadge, styles.designBadge)}>
        <PenTool className="size-4" strokeWidth={1.5} aria-hidden="true" />
        UI/UX Design
      </span>
      <span className={cn(styles.serviceBadge, styles.mobileBadge)}>
        <Smartphone className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Mobile Apps
      </span>
    </div>
  );
}
