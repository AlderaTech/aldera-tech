import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import type { BlogListItem } from "../_data/blog-list";
import { BlogCard } from "./blog-card";

export function BlogGrid({ posts }: { posts: BlogListItem[] }) {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <StaggerItem key={post.id}>
          <BlogCard post={post} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
