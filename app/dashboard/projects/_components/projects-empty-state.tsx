import Image from "next/image";
import mascot from "@/public/images/about/aldera-cat-about.webp";
import { cn } from "@/lib/utils";
import styles from "./project-list.module.css";
import { EmptyStatePattern } from "../../_components/empty-state-pattern";

export function ProjectsEmptyState() {
  return (
    <section
      className={cn(styles.statePanel, styles.emptyPanel)}
      aria-labelledby="projects-empty-heading"
    >
      <Image
        src={mascot}
        alt=""
        aria-hidden="true"
        width={140}
        height={140}
        className={styles.mascot}
        sizes="(min-width: 640px) 140px, 112px"
        quality={90}
      />
      <div className={styles.stateContent}>
        <p className={styles.eyebrow}>Langkah pertama</p>
        <h2 id="projects-empty-heading">Belum ada proyek</h2>
        <p>Hitung estimasi harga dan ajukan proyek Anda melalui kalkulator.</p>
      </div>
      <EmptyStatePattern />
    </section>
  );
}
