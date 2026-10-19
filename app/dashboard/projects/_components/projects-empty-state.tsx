import Image from "next/image";
import mascot from "@/public/images/about/aldera-cat-about.webp";
import styles from "./project-list.module.css";

export function ProjectsEmptyState() {
  return (
    <section
      className={styles.statePanel}
      aria-labelledby="projects-empty-heading"
    >
      <div className={styles.stateContent}>
        <p className={styles.eyebrow}>Langkah pertama</p>
        <h2 id="projects-empty-heading">Belum ada proyek</h2>
        <p>Hitung estimasi harga dan ajukan proyek Anda melalui kalkulator.</p>
      </div>
      <Image
        src={mascot}
        alt=""
        aria-hidden="true"
        width={128}
        height={128}
        className={styles.mascot}
        sizes="(min-width: 640px) 128px, 96px"
        quality={90}
      />
    </section>
  );
}
