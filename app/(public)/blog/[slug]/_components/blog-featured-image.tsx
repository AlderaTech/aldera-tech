import Image from "next/image";
import { BookOpenText } from "lucide-react";
import styles from "./blog-detail.module.css";

type BlogFeaturedImageProps = {
  src: string | null;
  alt: string;
};

export function BlogFeaturedImage({ src, alt }: BlogFeaturedImageProps) {
  if (!src) {
    return (
      <div className={styles.imageFallback} aria-hidden="true">
        <BookOpenText className="size-12" strokeWidth={1.3} />
        <span>Aldera Journal</span>
      </div>
    );
  }

  return (
    <div className={styles.featuredImage}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 800px, 100vw"
        className={styles.coverImage}
        loading="lazy"
      />
    </div>
  );
}
