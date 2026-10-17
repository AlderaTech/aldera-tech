import { PanelsTopLeft } from "lucide-react";
import { PortfolioImage } from "../../_components/portfolio-image";
import styles from "./portfolio-detail.module.css";

type PortfolioFeaturedImageProps = {
  src: string | null;
  alt: string;
};

export function PortfolioFeaturedImage({
  src,
  alt,
}: PortfolioFeaturedImageProps) {
  if (!src) return null;

  return (
    <figure className={styles.featured}>
      <figcaption className={styles.imageToolbar}>
        <span className={styles.windowDots} aria-hidden="true">
          <i /> <i /> <i />
        </span>
        <span>Pratinjau proyek</span>
        <PanelsTopLeft className="size-3.5" aria-hidden="true" />
      </figcaption>
      <div className={styles.imageCanvas}>
        <PortfolioImage
          src={src}
          alt={alt}
          sizes="(min-width: 1280px) 520px, (min-width: 1024px) 45vw, (min-width: 640px) 560px, 90vw"
          imageClassName={styles.featuredImage}
          fallbackClassName={styles.imageFallback}
          preload
        />
      </div>
    </figure>
  );
}
