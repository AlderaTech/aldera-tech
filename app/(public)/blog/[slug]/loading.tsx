import shared from "../../_components/studio.module.css";
import styles from "./_components/blog-detail.module.css";

export default function BlogDetailLoading() {
  return (
    <div className={styles.loadingPage} role="status" aria-busy="true">
      <span className="sr-only">Memuat artikel...</span>
      <div className={shared.container} aria-hidden="true">
        <div className={styles.loadingArticle}>
          <div className={styles.loadingLine} />
          <div className={styles.loadingLine} />
          <div className={styles.loadingLine} />
          <div className={styles.loadingImage} />
        </div>
      </div>
    </div>
  );
}
