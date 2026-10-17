import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, CalendarDays, Clock3 } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { formatDate, readingTime } from "@/lib/utils";
import type { BlogListItem } from "../_data/blog-list";
import styles from "./blog.module.css";

export function BlogCard({ post }: { post: BlogListItem }) {
  const minutes = readingTime(post.content);

  return (
    <Link href={PUBLIC_ROUTES.blogDetail(post.slug)} className={styles.card}>
      <article className={styles.cardInner}>
        <div className={styles.cardMedia}>
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              sizes="(min-width: 1280px) 380px, (min-width: 768px) 48vw, 90vw"
              loading="lazy"
              className={styles.cardImage}
            />
          ) : (
            <div className={styles.imageFallback} aria-hidden="true">
              <BookOpenText className="size-9" strokeWidth={1.3} />
              <span>Aldera Journal</span>
            </div>
          )}
          {post.category && (
            <span className={styles.category}>{post.category.name}</span>
          )}
          <span className={styles.cardArrow} aria-hidden="true">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <div className={styles.cardBody}>
          <h3>{post.title}</h3>
          {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
          <div className={styles.cardMeta}>
            {post.author && (
              <span className={styles.author}>{post.author.name}</span>
            )}
            {post.publishedAt && (
              <span>
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDate(post.publishedAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            <span>
              <Clock3 className="size-3.5" aria-hidden="true" />
              {minutes} menit baca
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
