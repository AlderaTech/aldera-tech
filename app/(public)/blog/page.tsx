import type { Metadata } from "next";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { BlogGrid } from "./_components/blog-grid";
import { BlogHero } from "./_components/blog-hero";
import { BlogPagination } from "./_components/blog-pagination";
import { BlogSearch } from "./_components/blog-search";
import { CategoryFilter } from "./_components/category-filter";
import { getBlogCategories, getBlogList } from "./_data/blog-list";
import { filterBlogResults } from "./_utils/filter-blog-results";
import shared from "../_components/studio.module.css";
import styles from "./_components/blog.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artikel, tutorial, dan wawasan dari tim Aldera Tech seputar teknologi, desain, dan bisnis.",
  alternates: { canonical: PUBLIC_ROUTES.blog },
};

type PageProps = {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const { page: pageParam, category, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [posts, categories] = await Promise.all([
    getBlogList({ page, category, q }),
    getBlogCategories(),
  ]);
  const visiblePosts = filterBlogResults(posts, { category, q });

  return (
    <div className={styles.page}>
      <BlogHero />
      <section
        className={styles.listSection}
        aria-labelledby="blog-list-heading"
      >
        <div className={shared.container}>
          <div className={styles.listIntro}>
            <div>
              <p className={styles.sectionEyebrow}>Jelajahi wawasan</p>
              <h2 id="blog-list-heading">Artikel terbaru</h2>
            </div>
            <p>
              Panduan, ide, dan perspektif dari tim Aldera Tech untuk langkah
              digital berikutnya.
            </p>
          </div>
          <div className={styles.toolbar}>
            <CategoryFilter
              categories={categories}
              activeCategory={category}
              q={q}
            />
            <BlogSearch category={category} q={q} />
          </div>
          {q && (
            <p className={styles.searchContext}>
              Hasil untuk <strong>“{q}”</strong>
            </p>
          )}
          <BlogGrid posts={visiblePosts} />
          <BlogPagination
            page={page}
            postCount={visiblePosts.length}
            category={category}
            q={q}
          />
        </div>
      </section>
    </div>
  );
}
