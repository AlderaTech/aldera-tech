import shared from "../_components/studio.module.css";
import styles from "./_components/blog.module.css";

export default function BlogLoading() {
  return (
    <div className={styles.loadingPage} role="status" aria-busy="true">
      <span className="sr-only">Memuat artikel Blog...</span>
      <div className={shared.container} aria-hidden="true">
        <div className={styles.loadingIntro}>
          <div className={styles.loadingLine} />
          <div className={styles.loadingLine} />
          <div className={styles.loadingLine} />
        </div>
        <div className={styles.loadingCards}>
          <div className={styles.loadingCard} />
          <div className={styles.loadingCard} />
          <div className={styles.loadingCard} />
        </div>
      </div>
    </div>
  );
}
