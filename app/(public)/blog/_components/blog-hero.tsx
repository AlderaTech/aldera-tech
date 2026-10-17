import Image from "next/image";
import { FadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import mascot from "@/public/images/blog/aldera-cat-reading.webp";
import shared from "../../_components/studio.module.css";
import styles from "./blog.module.css";

export function BlogHero() {
  return (
    <section className={styles.hero} aria-labelledby="blog-heading">
      <div className={cn(shared.container, styles.heroGrid)}>
        <FadeUp className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Blog / Aldera Tech
          </p>
          <h1 id="blog-heading">
            Wawasan & <span>cerita</span> dari tim kami
          </h1>
          <p className={styles.heroDescription}>
            Artikel tentang pengembangan, desain, dan strategi digital untuk
            bisnis modern.
          </p>
        </FadeUp>
        <FadeUp delay={0.08} className={styles.heroVisual}>
          <span className={styles.visualOrbit} aria-hidden="true" />
          <Image
            src={mascot}
            alt=""
            sizes="(min-width: 1024px) 190px, (min-width: 640px) 155px, 105px"
            quality={88}
            loading="eager"
            className={styles.mascot}
            aria-hidden="true"
          />
        </FadeUp>
      </div>
    </section>
  );
}
