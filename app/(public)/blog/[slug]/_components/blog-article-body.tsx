import styles from "./blog-detail.module.css";
import { sanitizeHtml } from "@/lib/sanitize-html";

type BlogArticleBodyProps = {
  html: string;
};

export function BlogArticleBody({ html }: BlogArticleBodyProps) {
  return (
    <div
      id="blog-content"
      className={styles.body}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
