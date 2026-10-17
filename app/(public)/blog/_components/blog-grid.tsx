import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import type { BlogListItem } from "../_data/blog-list";
import { BlogCard } from "./blog-card";
import styles from "./blog.module.css";

export function BlogGrid({ posts }: { posts: BlogListItem[] }) {
  if (posts.length === 0) {
    return (
      <div className={styles.emptyState} role="status">
        <BookOpenText className="size-7" aria-hidden="true" />
        <h3>Belum ada artikel untuk pilihan ini.</h3>
        <p>Coba kategori atau kata kunci lain untuk menjelajahi Blog.</p>
        <Link href={PUBLIC_ROUTES.blog}>Lihat semua artikel</Link>
      </div>
    );
  }

  return (
    <StaggerContainer className={styles.grid}>
      {posts.map((post) => (
        <StaggerItem key={post.id}>
          <BlogCard post={post} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
