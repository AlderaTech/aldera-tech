import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { BLOG_PAGE_SIZE } from "../_data/blog-list";
import styles from "./blog.module.css";

export function BlogPagination({
  page,
  postCount,
  category,
  q,
}: {
  page: number;
  postCount: number;
  category?: string;
  q?: string;
}) {
  if (page === 1 && postCount < BLOG_PAGE_SIZE) return null;

  return (
    <nav className={styles.pagination} aria-label="Halaman artikel">
      {page > 1 && (
        <Link
          href={PUBLIC_ROUTES.blogPage({ category, q, page: page - 1 })}
          className={styles.pageLink}
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Sebelumnya
        </Link>
      )}
      <span className={styles.pageNumber}>Halaman {page}</span>
      {postCount === BLOG_PAGE_SIZE && (
        <Link
          href={PUBLIC_ROUTES.blogPage({ category, q, page: page + 1 })}
          className={styles.pageLink}
        >
          Berikutnya <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
