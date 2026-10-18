import { TableOfContents } from "./table-of-contents";
import { BlogArticleBody } from "./blog-article-body";
import { BlogArticleHeader } from "./blog-article-header";
import { BlogCtaBanner } from "./blog-cta-banner";
import { BlogFeaturedImage } from "./blog-featured-image";
import { BlogReactions } from "./blog-reactions";
import { BlogComments } from "./blog-comments";
import type { BlogDetailPost, BlogEngagementData } from "../_data/blog-detail";
import { cn } from "@/lib/utils";
import shared from "../../../_components/studio.module.css";
import styles from "./blog-detail.module.css";

type BlogArticleLayoutProps = {
  post: BlogDetailPost;
  minutes: number;
  featuredImage: string | null;
  engagement: BlogEngagementData;
  currentUserId?: string;
  isAdminUser: boolean;
};

export function BlogArticleLayout({
  post,
  minutes,
  featuredImage,
  engagement,
  currentUserId,
  isAdminUser,
}: BlogArticleLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={cn(shared.container, styles.layout)}>
        <article className={styles.article}>
          <BlogArticleHeader post={post} minutes={minutes} />
          <BlogFeaturedImage src={featuredImage} alt={post.title} />
          <BlogArticleBody html={post.content} />
          <BlogReactions
            postId={post.id}
            initialLikes={engagement.likesCount}
            initialDislikes={engagement.dislikesCount}
            initialUserReaction={engagement.userReaction}
            isAuthenticated={Boolean(currentUserId)}
          />
          <BlogComments
            postId={post.id}
            initialComments={engagement.comments}
            currentUserId={currentUserId}
            isAdminUser={isAdminUser}
          />
          <BlogCtaBanner />
        </article>
        <TableOfContents containerId="blog-content" />
      </div>
    </div>
  );
}
