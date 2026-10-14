import type { Metadata } from "next";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { BlogGrid } from "./_components/blog-grid";
import { BlogHero } from "./_components/blog-hero";
import { BlogPagination } from "./_components/blog-pagination";
import { CategoryFilter } from "./_components/category-filter";
import { getBlogCategories, getBlogList } from "./_data/blog-list";

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

  return (
    <>
      <BlogHero />
      <section className="editorial-surface">
        <div className="public-container-px mx-auto max-w-screen-xxxl py-10">
          <CategoryFilter categories={categories} activeCategory={category} />
          <BlogGrid posts={posts} />
          <BlogPagination
            page={page}
            postCount={posts.length}
            category={category}
            q={q}
          />
        </div>
      </section>
    </>
  );
}
