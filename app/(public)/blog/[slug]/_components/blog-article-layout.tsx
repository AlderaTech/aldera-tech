import { TableOfContents } from "./table-of-contents";
import { BlogArticleBody } from "./blog-article-body";
import { BlogArticleHeader } from "./blog-article-header";
import { BlogCtaBanner } from "./blog-cta-banner";
import { BlogFeaturedImage } from "./blog-featured-image";
import type { BlogDetailPost } from "../_data/blog-detail";
import { cn } from "@/lib/utils";
import shared from "../../../_components/studio.module.css";
import styles from "./blog-detail.module.css";

type BlogArticleLayoutProps = {
  post: BlogDetailPost;
  minutes: number;
  featuredImage: string | null;
};

export function BlogArticleLayout({
  post,
  minutes,
  featuredImage,
}: BlogArticleLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={cn(shared.container, styles.layout)}>
        <article className={styles.article}>
          <BlogArticleHeader post={post} minutes={minutes} />
          <BlogFeaturedImage src={featuredImage} alt={post.title} />
          <BlogArticleBody html={post.content} />
          <BlogCtaBanner />
        </article>
        <TableOfContents containerId="blog-content" />
      </div>
    </div>
  );
}
