import { TableOfContents } from "./table-of-contents";
import { BlogArticleBody } from "./blog-article-body";
import { BlogArticleHeader } from "./blog-article-header";
import { BlogCtaBanner } from "./blog-cta-banner";
import { BlogFeaturedImage } from "./blog-featured-image";
import type { BlogDetailPost } from "../_data/blog-detail";

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
    <div className="editorial-surface">
      <div className="mx-auto flex max-w-screen-xxxl gap-12 public-container-px py-12">
        <article className="mx-auto min-w-0 max-w-3xl flex-1">
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
