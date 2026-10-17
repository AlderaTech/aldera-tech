import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogCategoryFilter } from "../_data/blog-list";
import { PUBLIC_ROUTES } from "@/lib/routes";
import styles from "./blog.module.css";

export function CategoryFilter({
  categories,
  activeCategory,
  q,
}: {
  categories: BlogCategoryFilter[];
  activeCategory?: string;
  q?: string;
}) {
  return (
    <nav className={styles.filters} aria-label="Kategori artikel">
      <FilterLink
        href={PUBLIC_ROUTES.blogPage({ page: 1, q })}
        active={!activeCategory}
      >
        Semua
      </FilterLink>
      {categories.map((category) => (
        <FilterLink
          key={category.slug}
          href={PUBLIC_ROUTES.blogPage({ page: 1, category: category.slug, q })}
          active={activeCategory === category.slug}
        >
          {category.name}
        </FilterLink>
      ))}
    </nav>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={active ? styles.activeFilter : styles.filter}
    >
      {children}
    </Link>
  );
}
