import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { formatDate, getInitials } from "@/lib/utils";
import type { BlogDetailPost } from "../_data/blog-detail";
import styles from "./blog-detail.module.css";

type BlogArticleHeaderProps = {
  post: BlogDetailPost;
  minutes: number;
};

export function BlogArticleHeader({ post, minutes }: BlogArticleHeaderProps) {
  return (
    <>
      <Link href={PUBLIC_ROUTES.blog} className={styles.backLink}>
        <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke Blog
      </Link>

      <header className={styles.header}>
        {post.category && (
          <Link
            href={PUBLIC_ROUTES.blogCategory(post.category.slug)}
            className={styles.category}
          >
            {post.category.name}
          </Link>
        )}
        <h1>{post.title}</h1>
        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
        <div className={styles.meta}>
          {post.author && (
            <div className={styles.author}>
              <Avatar className="size-9">
                <AvatarFallback className={styles.avatarFallback}>
                  {getInitials(post.author.name)}
                </AvatarFallback>
              </Avatar>
              <span>{post.author.name}</span>
            </div>
          )}
          {post.publishedAt && (
            <span>
              <Calendar className="size-3.5" aria-hidden="true" />
              {formatDate(post.publishedAt)}
            </span>
          )}
          <span>
            <Clock className="size-3.5" aria-hidden="true" />
            {minutes} menit baca
          </span>
          {post.views > 0 && (
            <span>
              <Eye className="size-3.5" aria-hidden="true" />
              {post.views.toLocaleString("id-ID")} tampilan
            </span>
          )}
        </div>
      </header>
    </>
  );
}
